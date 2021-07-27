import path from 'path';
import express from 'express';
import { generateAdminUI } from '../../admin-ui/system';
import { devMigrations, pushPrismaSchemaToDatabase } from '../../lib/migrations';
import { createSystem } from '../../lib/createSystem';
import { initConfig } from '../../lib/config/initConfig';
import { requireSource } from '../../lib/config/requireSource';
import { defaults } from '../../lib/config/defaults';
import { createExpressServer } from '../../lib/server/createExpressServer';
import {
  generateCommittedArtifacts,
  generateNodeModulesArtifacts,
  getSchemaPaths,
  requirePrismaClient,
} from '../../artifacts';
import { getAdminPath, getConfigPath } from '../utils';

const devLoadingHTMLFilepath = path.join(
  path.dirname(require.resolve('@keystone-next/keystone/package.json')),
  'static',
  'dev-loading.html'
);

export const dev = async (cwd: string, shouldDropDatabase: boolean) => {
  console.log('✨ Starting Keystone');

  const app = express();
  let expressServer: null | ReturnType<typeof express> = null;

  let disconnect: null | (() => Promise<void>) = null;

  const config = initConfig(requireSource(getConfigPath(cwd)).default);

  const initKeystone = async () => {
    const { graphQLSchema, adminMeta, getKeystone } = createSystem(config);

    console.log('✨ Generating GraphQL and Prisma schemas');
    const prismaSchema = (await generateCommittedArtifacts(graphQLSchema, config, cwd)).prisma;
    await generateNodeModulesArtifacts(graphQLSchema, config, cwd);

    if (config.db.useMigrations) {
      await devMigrations(
        config.db.url,
        prismaSchema,
        getSchemaPaths(cwd).prisma,
        shouldDropDatabase
      );
    } else {
      await pushPrismaSchemaToDatabase(
        config.db.url,
        prismaSchema,
        getSchemaPaths(cwd).prisma,
        shouldDropDatabase
      );
    }

    const prismaClient = requirePrismaClient(cwd);

    const keystone = getKeystone(prismaClient);

    console.log('✨ Connecting to the database');
    await keystone.connect();
    disconnect = () => keystone.disconnect();
    if (config.ui?.isDisabled) {
      console.log('✨ Skipping Admin UI code generation');
    } else {
      console.log('✨ Generating Admin UI code');
      await generateAdminUI(config, graphQLSchema, adminMeta, getAdminPath(cwd));
    }

    console.log('✨ Creating server');
    expressServer = await createExpressServer(
      config,
      graphQLSchema,
      keystone.createContext,
      true,
      getAdminPath(cwd)
    );
    console.log(`👋 Admin UI and GraphQL API ready`);
  };

  // You shouldn't really be doing a healthcheck on the dev server, but we
  // respond on the endpoint with the correct error code just in case. This
  // doesn't send the configured data shape, because config doesn't allow
  // for the "not ready" case but that's probably OK.
  if (config.server?.healthCheck) {
    const healthCheckPath =
      config.server.healthCheck === true
        ? defaults.healthCheckPath
        : config.server.healthCheck.path || defaults.healthCheckPath;
    app.use(healthCheckPath, (req, res, next) => {
      if (expressServer) return next();
      res.status(503).json({ status: 'fail', timestamp: Date.now() });
    });
  }

  app.use('/__keystone_dev_status', (req, res) => {
    res.json({ ready: expressServer ? true : false });
  });
  app.use((req, res, next) => {
    if (expressServer) return expressServer(req, res, next);
    res.sendFile(devLoadingHTMLFilepath);
  });
  const port = config.server?.port || process.env.PORT || 3000;
  let initKeystonePromiseResolve: () => void | undefined;
  let initKeystonePromiseReject: (err: any) => void | undefined;
  let initKeystonePromise = new Promise<void>((resolve, reject) => {
    initKeystonePromiseResolve = resolve;
    initKeystonePromiseReject = reject;
  });
  const server = app.listen(port, (err?: any) => {
    if (err) throw err;
    console.log(`⭐️ Dev Server Ready on http://localhost:${port}`);
    // Don't start initialising Keystone until the dev server is ready,
    // otherwise it slows down the first response significantly
    initKeystone()
      .then(() => {
        initKeystonePromiseResolve();
      })
      .catch(err => {
        server.close(async closeErr => {
          if (closeErr) {
            console.log('There was an error while closing the server');
            console.log(closeErr);
          }
          try {
            await disconnect?.();
          } catch (err) {
            console.log('There was an error while disconnecting from the database');
            console.log(err);
          }

          initKeystonePromiseReject(err);
        });
      });
  });

  await initKeystonePromise;

  return () =>
    new Promise<void>((resolve, reject) => {
      server.close(async err => {
        try {
          await disconnect?.();
        } catch (disconnectionError) {
          if (!err) {
            err = disconnectionError;
          } else {
            console.log('There was an error while disconnecting from the database');
            console.log(disconnectionError);
          }
        }
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
};
