import path from 'path';
import url from 'url';
import { inspect } from 'util';
import express from 'express';
import { GraphQLSchema } from 'graphql';
import fs from 'fs-extra';
import chalk from 'chalk';
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
  generateNodeModulesArtifactsWithoutPrismaClient,
  getSchemaPaths,
  requirePrismaClient,
} from '../../artifacts';
import { getAdminPath, getConfigPath } from '../utils';
import { AdminMetaRootVal, CreateContext, KeystoneConfig } from '../../types';
import { serializePathForImport } from '../../admin-ui/utils/serializePathForImport';

const devLoadingHTMLFilepath = path.join(
  path.dirname(require.resolve('@keystone-next/keystone/package.json')),
  'static',
  'dev-loading.html'
);

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dev = async (cwd: string, shouldDropDatabase: boolean) => {
  console.log('✨ Starting Keystone');

  const app = express();
  let expressServer: express.Express | null = null;
  let hasAddedAdminUIMiddleware = false;
  const ready = () => !!(expressServer && hasAddedAdminUIMiddleware);

  let disconnect: null | (() => Promise<void>) = null;

  const config = initConfig(requireSource(getConfigPath(cwd)).default);

  const initKeystone = async () => {
    await fs.remove(getAdminPath(cwd));
    const p = serializePathForImport(
      path.relative(path.join(getAdminPath(cwd), 'pages', 'api'), `${cwd}/keystone`)
    );
    // this exports a function which dynamically imports the config
    // rather than directly
    // this allows us to control exactly _when_ the gets evaluated
    // so that we can handle errors
    await fs.outputFile(
      `${getAdminPath(cwd)}/pages/api/__keystone_api_build.js`,
      `export const getConfig = () => import(${p});
const x = Math.random();
export default function (req, res) { return res.send(x.toString()) }
`
    );
    const { adminMeta, graphQLSchema, createContext, prismaSchema, prismaClient, ...rest } =
      await thing(config, cwd, shouldDropDatabase);
    ({ disconnect, expressServer } = rest);

    const adminUIMiddleware = await initAdminUI(
      config,
      graphQLSchema,
      adminMeta,
      cwd,
      createContext
    );
    expressServer.use(adminUIMiddleware);
    hasAddedAdminUIMiddleware = true;
    initKeystonePromiseResolve();
    let lastVersion = '';
    let lastError = undefined;
    while (true) {
      await wait(500);
      try {
        const version = await fetch(`http://localhost:${port}/api/__keystone_api_build`).then(x =>
          x.text()
        );
        if (lastVersion !== version) {
          lastVersion = version;
          const resolved = require.resolve(
            `${getAdminPath(cwd)}/.next/server/pages/api/__keystone_api_build`
          );
          delete require.cache[resolved];
          const newConfig = initConfig((await require(resolved).getConfig()).default);
          const { graphQLSchema, getKeystone } = createSystem(newConfig);
          const newPrismaSchema = (await generateCommittedArtifacts(graphQLSchema, newConfig, cwd))
            .prisma;

          if (prismaSchema !== newPrismaSchema) {
            console.log('Your prisma schema has changed, please restart Keystone');
            process.exit(1);
          }

          // we only need to test for the things which influence the prisma client creation
          // and aren't written into the prisma schema
          if (
            newConfig.db.enableLogging !== config.db.enableLogging ||
            newConfig.db.url !== config.db.url ||
            newConfig.db.useMigrations !== config.db.useMigrations
          ) {
            console.log('Your db config has changed, please restart Keystone');
            process.exit(1);
          }

          await generateNodeModulesArtifactsWithoutPrismaClient(graphQLSchema, newConfig, cwd);
          await generateAdminUI(newConfig, graphQLSchema, adminMeta, getAdminPath(cwd));
          const keystone = getKeystone(function fakePrismaClientClass() {
            return createContext().prisma;
          });
          expressServer = await createExpressServer(
            newConfig,
            graphQLSchema,
            keystone.createContext
          );
          expressServer.use(adminUIMiddleware);
          lastError = undefined;
        }
      } catch (err) {
        const printed = inspect(err);
        if (printed !== lastError) {
          console.log('🚨', chalk.red('There was an error loading your Keystone config'));
          console.log(printed);
          lastError = printed;
        }
      }
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
    if (expressServer && hasAddedAdminUIMiddleware) return expressServer(req, res, next);
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
    // We start initialising Keystone after the dev server is ready,
    console.log(`⭐️ Dev Server Starting on http://localhost:${port}`);
    console.log(
      `⭐️ GraphQL API Starting on http://localhost:${port}${
        config.graphql?.path || '/api/graphql'
      }`
    );
    // Don't start initialising Keystone until the dev server is ready,
    // otherwise it slows down the first response significantly
    initKeystone().catch(err => {
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

async function thing(config: KeystoneConfig, cwd: string, shouldDropDatabase: boolean) {
  const { graphQLSchema, adminMeta, getKeystone } = createSystem(config);

  // Generate the Artifacts
  console.log('✨ Generating GraphQL and Prisma schemas');
  const prismaSchema = (await generateCommittedArtifacts(graphQLSchema, config, cwd)).prisma;
  let keystonePromise = generateNodeModulesArtifacts(graphQLSchema, config, cwd).then(() => {
    const prismaClient = requirePrismaClient(cwd);
    return { keystone: getKeystone(prismaClient), prismaClient };
  });

  let migrationPromise: Promise<void>;

  // Set up the Database
  if (config.db.useMigrations) {
    migrationPromise = devMigrations(
      config.db.url,
      prismaSchema,
      getSchemaPaths(cwd).prisma,
      shouldDropDatabase
    );
  } else {
    migrationPromise = pushPrismaSchemaToDatabase(
      config.db.url,
      prismaSchema,
      getSchemaPaths(cwd).prisma,
      shouldDropDatabase
    );
  }

  const [{ keystone, prismaClient }] = await Promise.all([keystonePromise, migrationPromise]);
  const { createContext } = keystone;

  // Connect to the Database
  console.log('✨ Connecting to the database');
  await keystone.connect();

  // Set up the Express Server
  console.log('✨ Creating server');
  const expressServer = await createExpressServer(config, graphQLSchema, createContext);
  console.log(`✅ GraphQL API ready`);
  return {
    adminMeta,
    disconnect: () => keystone.disconnect(),
    expressServer,
    graphQLSchema,
    createContext,
    prismaSchema,
    prismaClient,
  };
}

async function initAdminUI(
  config: KeystoneConfig,
  graphQLSchema: GraphQLSchema,
  adminMeta: AdminMetaRootVal,
  cwd: string,
  createContext: CreateContext
) {
  console.log('✨ Generating Admin UI code');
  await generateAdminUI(config, graphQLSchema, adminMeta, getAdminPath(cwd));

  console.log('✨ Preparing Admin UI app');
  const middleware = await createAdminUIMiddleware(config, createContext, true, getAdminPath(cwd));
  console.log(`✅ Admin UI ready`);
  return middleware;
}
