import path from 'path';
import express from 'express';
import { generateAdminUI } from '@keystone-next/admin-ui/system';
import { devMigrations, pushPrismaSchemaToDatabase } from '../../lib/migrations';
import { createSystem } from '../../lib/createSystem';
import { initConfig } from '../../lib/config/initConfig';
import { requireSource } from '../../lib/config/requireSource';
import { createExpressServer } from '../../lib/server/createExpressServer';
import {
  generateCommittedArtifacts,
  generateNodeModulesArtifacts,
  getSchemaPaths,
  requirePrismaClient,
} from '../../artifacts';
import { getAdminPath, getConfigPath } from '../utils';
import { createAdminMeta } from '../../lib/createAdminMeta';

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
    {
      const { keystone, graphQLSchema } = createSystem(config);

      console.log('✨ Generating GraphQL and Prisma schemas');
      const prismaSchema = (await generateCommittedArtifacts(graphQLSchema, config, cwd)).prisma;
      await generateNodeModulesArtifacts(graphQLSchema, keystone, config, cwd);

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
    }
    const prismaClient = requirePrismaClient(cwd);

    const { keystone, graphQLSchema, createContext, lists } = createSystem(config, prismaClient);

    console.log('✨ Connecting to the database');
    await keystone.connect();
    disconnect = () => keystone.disconnect();
    if (config.ui?.isDisabled) {
      console.log('✨ Skipping Admin UI code generation');
    } else {
      console.log('✨ Generating Admin UI code');
      await generateAdminUI(
        config,
        lists,
        graphQLSchema,
        createAdminMeta(config, lists),
        getAdminPath(cwd)
      );
    }

    console.log('✨ Creating server');
    expressServer = await createExpressServer(
      config,
      graphQLSchema,
      createContext,
      true,
      getAdminPath(cwd)
    );
    console.log(`👋 Admin UI and GraphQL API ready`);
  };

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
