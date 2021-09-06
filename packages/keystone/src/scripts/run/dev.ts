import path from 'path';
import url from 'url';
import express from 'express';
import { generateAdminUI } from '../../admin-ui/system';
import { devMigrations, pushPrismaSchemaToDatabase } from '../../lib/migrations';
import { createSystem } from '../../lib/createSystem';
import { initConfig } from '../../lib/config/initConfig';
import { requireSource } from '../../lib/config/requireSource';
import { defaults } from '../../lib/config/defaults';
import { createExpressServer } from '../../lib/server/createExpressServer';
import { createAdminUIMiddleware } from '../../lib/server/createAdminUIMiddleware';
import {
  generateCommittedArtifacts,
  generateNodeModulesArtifacts,
  getSchemaPaths,
  requirePrismaClient,
} from '../../artifacts';
import { getAdminPath, getConfigPath } from '../utils';

type ExpressServer = null | ReturnType<typeof express>;
type AdminUIMiddleware = null | ((req: express.Request, res: express.Response) => Promise<void>);

const devLoadingHTMLFilepath = path.join(
  path.dirname(require.resolve('@keystone-next/keystone/package.json')),
  'static',
  'dev-loading.html'
);

export const dev = async (cwd: string, shouldDropDatabase: boolean) => {
  console.log('✨ Starting Keystone');

  const app = express();
  let expressServer: ExpressServer = null;
  let adminUIMiddleware: AdminUIMiddleware = null;
  const ready = () => !!(expressServer && adminUIMiddleware);

  let disconnect: null | (() => Promise<void>) = null;

  const config = initConfig(requireSource(getConfigPath(cwd)).default);

  const initKeystone = async () => {
    const { graphQLSchema, adminMeta, getKeystone } = createSystem(config);

    // Generate the Artifacts
    console.log('✨ Generating GraphQL and Prisma schemas');
    const prismaSchema = (await generateCommittedArtifacts(graphQLSchema, config, cwd)).prisma;
    await generateNodeModulesArtifacts(graphQLSchema, config, cwd);

    // Set up the Database
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
    const { createContext } = keystone;

    // Connect to the Database
    console.log('✨ Connecting to the database');
    await keystone.connect();
    disconnect = () => keystone.disconnect();

    // Set up the Express Server
    console.log('✨ Creating server');
    expressServer = await createExpressServer(config, graphQLSchema, createContext);
    console.log(`✅ GraphQL API ready`);

    // Initialise the Admin UI
    if (!config.ui?.isDisabled) {
      console.log('✨ Generating Admin UI code');
      await generateAdminUI(config, graphQLSchema, adminMeta, getAdminPath(cwd));

      console.log('✨ Preparing Admin UI app');
      adminUIMiddleware = await createAdminUIMiddleware(
        config,
        createContext,
        true,
        getAdminPath(cwd)
      );
      expressServer.use(adminUIMiddleware);
      console.log(`✅ Admin UI ready`);
    }
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

  // Serve the dev status page for the Admin UI
  app.use('/__keystone_dev_status', (req, res) => {
    res.json({ ready: ready() ? true : false });
  });
  // Pass the request the express server, or serve the loading page
  app.use((req, res, next) => {
    // If both the express server and Admin UI Middleware are ready, we're go!
    if (expressServer && adminUIMiddleware) return expressServer(req, res, next);
    // Otherwise, we may be able to serve the GraphQL API
    const { pathname } = url.parse(req.url);
    if (expressServer && pathname === (config.graphql?.path || '/api/graphql')) {
      return expressServer(req, res, next);
    }
    // Serve the loading page
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
    // We start initialising Keystone after the dev server is ready,
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
        } catch (disconnectionError: any) {
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
