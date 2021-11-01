import path from 'path';
import url from 'url';
import util from 'util';
import express from 'express';
import { GraphQLSchema, printSchema } from 'graphql';
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
  getFormattedGraphQLSchema,
  getSchemaPaths,
  requirePrismaClient,
} from '../../artifacts';
import { getAdminPath, getConfigPath } from '../utils';
import { AdminMetaRootVal, CreateContext, KeystoneConfig } from '../../types';
import { serializePathForImport } from '../../admin-ui/utils/serializePathForImport';
import { initialiseLists } from '../../lib/core/types-for-lists';
import { printPrismaSchema } from '../../lib/core/prisma-schema';

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

  let disconnect: null | (() => Promise<void>) = null;

  // note that because we don't catch this throwing, if this fails it'll crash the process
  // so that means if
  // - you have an error in your config on startup -> will fail to start and you have to start the process manually after fixing the problem
  // - you have an error in your config after startup -> will keep the last working version until importing the config succeeds
  // also, if you're thinking "why not always use the Next api route to get the config"?
  // this will get the GraphQL API up earlier
  const config = initConfig(requireSource(getConfigPath(cwd)).default);

  const isReady = () =>
    expressServer !== null && (hasAddedAdminUIMiddleware || config.ui?.isDisabled === true);

  const initKeystone = async () => {
    await fs.remove(getAdminPath(cwd));
    const p = serializePathForImport(
      path.relative(path.join(getAdminPath(cwd), 'pages', 'api'), `${cwd}/keystone`)
    );
    const { adminMeta, graphQLSchema, createContext, prismaSchema, apolloServer, ...rest } =
      await setupInitialKeystone(config, cwd, shouldDropDatabase);
    const prismaClient = createContext().prisma;
    ({ disconnect, expressServer } = rest);
    // if you've disabled the Admin UI, sorry, no live reloading
    // the chance that someone is actually using this is probably quite low
    // and starting Next in tests where we don't care about it would slow things down quite a bit
    if (config.ui?.isDisabled) {
      initKeystonePromiseResolve();
      return;
    }
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

    // this exports a function which dynamically requires the config rather than directly importing it.
    // this allows us to control exactly _when_ the gets evaluated so that we can handle errors ourselves.
    // note this is intentionally using CommonJS and not ESM because by doing a dynamic import, webpack
    // will generate a separate chunk for that whereas a require will be in the same bundle but the execution can still be delayed.
    // dynamic importing didn't work on windows because it couldn't get the path to require the chunk for some reason
    await fs.outputFile(
      `${getAdminPath(cwd)}/pages/api/__keystone_api_build.js`,
      `exports.getConfig = () => require(${p}).default;
const x = Math.random();
exports.default = function (req, res) { return res.send(x.toString()) }
`
    );
    let lastVersion = '';
    let lastError = undefined;
    const originalPrismaSchema = printPrismaSchema(
      initialiseLists(config.lists, config.db.provider),
      config.db.provider,
      config.db.prismaPreviewFeatures
    );
    let lastPrintedGraphQLSchema = printSchema(graphQLSchema);
    let lastApolloServer = apolloServer;

    while (true) {
      await wait(500);
      try {
        // this fetching essentially does two things:
        // - keeps the api route built, if we don't fetch it, Next will stop compiling it
        // - returns a random number which when it changes indicates that the config _might_ have changed
        //   note that it can go off randomly so the version changing doesn't necessarily
        //   mean that the config has changed, Next might have just reloaded for some random reason
        //   so we shouldn't log something like "hey, we reloaded your config"
        //   because it would go off at times when the user didn't change their config

        const version = await fetch(`http://localhost:${port}/api/__keystone_api_build`).then(x =>
          x.text()
        );
        if (lastVersion !== version) {
          lastVersion = version;
          const resolved = require.resolve(
            `${getAdminPath(cwd)}/.next/server/pages/api/__keystone_api_build`
          );
          delete require.cache[resolved];
          const newConfig = initConfig(require(resolved).getConfig());
          const newPrismaSchema = printPrismaSchema(
            initialiseLists(newConfig.lists, newConfig.db.provider),
            newConfig.db.provider,
            newConfig.db.prismaPreviewFeatures
          );
          if (originalPrismaSchema !== newPrismaSchema) {
            console.log('Your prisma schema has changed, please restart Keystone');
            process.exit(1);
          }

          // we only need to test for the things which influence the prisma client creation
          // and aren't written into the prisma schema since we check whether the prisma schema has changed above
          if (
            newConfig.db.enableLogging !== config.db.enableLogging ||
            newConfig.db.url !== config.db.url ||
            newConfig.db.useMigrations !== config.db.useMigrations
          ) {
            console.log('Your db config has changed, please restart Keystone');
            process.exit(1);
          }
          const { graphQLSchema, getKeystone, adminMeta } = createSystem(newConfig, true);
          // we're not using generateCommittedArtifacts or any of the similar functions
          // because we will never need to write a new prisma schema here
          // and formatting the prisma schema leaves some listeners on the process
          // which means you get a "there's probably a memory leak" warning from node
          const newPrintedGraphQLSchema = printSchema(graphQLSchema);
          if (newPrintedGraphQLSchema !== lastPrintedGraphQLSchema) {
            await fs.writeFile(
              getSchemaPaths(cwd).graphql,
              getFormattedGraphQLSchema(newPrintedGraphQLSchema)
            );
            lastPrintedGraphQLSchema = newPrintedGraphQLSchema;
          }

          await generateNodeModulesArtifactsWithoutPrismaClient(graphQLSchema, newConfig, cwd);
          await generateAdminUI(newConfig, graphQLSchema, adminMeta, getAdminPath(cwd), true);
          const keystone = getKeystone(function fakePrismaClientClass() {
            return prismaClient;
          });
          await keystone.connect();
          const servers = await createExpressServer(
            newConfig,
            graphQLSchema,
            keystone.createContext
          );

          servers.expressServer.use(adminUIMiddleware);
          expressServer = servers.expressServer;
          let prevApolloServer = lastApolloServer;
          lastApolloServer = servers.apolloServer;
          await prevApolloServer.stop();
          lastError = undefined;
        }
      } catch (err) {
        // since Next will sometimes randomly refresh the api route even though it hasn't changed
        // we want to avoid showing the same error again
        const printed = util.inspect(err);
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
    res.json({ ready: isReady() ? true : false });
  });
  // Pass the request the express server, or serve the loading page
  app.use((req, res, next) => {
    // If both the express server and Admin UI Middleware are ready, we're go!
    if (expressServer && (hasAddedAdminUIMiddleware || config.ui?.isDisabled === true)) {
      return expressServer(req, res, next);
    }
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

async function setupInitialKeystone(
  config: KeystoneConfig,
  cwd: string,
  shouldDropDatabase: boolean
) {
  const { graphQLSchema, adminMeta, getKeystone } = createSystem(config);

  // Generate the Artifacts
  console.log('✨ Generating GraphQL and Prisma schemas');
  const prismaSchema = (await generateCommittedArtifacts(graphQLSchema, config, cwd)).prisma;
  let keystonePromise = generateNodeModulesArtifacts(graphQLSchema, config, cwd).then(() => {
    const prismaClient = requirePrismaClient(cwd);
    return getKeystone(prismaClient);
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

  const [keystone] = await Promise.all([keystonePromise, migrationPromise]);
  const { createContext } = keystone;

  // Connect to the Database
  console.log('✨ Connecting to the database');
  await keystone.connect();

  // Set up the Express Server
  console.log('✨ Creating server');
  const { apolloServer, expressServer } = await createExpressServer(
    config,
    graphQLSchema,
    createContext
  );
  console.log(`✅ GraphQL API ready`);
  return {
    adminMeta,
    disconnect: () => keystone.disconnect(),
    expressServer,
    apolloServer,
    graphQLSchema,
    createContext,
    prismaSchema,
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
  await generateAdminUI(config, graphQLSchema, adminMeta, getAdminPath(cwd), false);

  console.log('✨ Preparing Admin UI app');
  const middleware = await createAdminUIMiddleware(config, createContext, true, getAdminPath(cwd));
  console.log(`✅ Admin UI ready`);
  return middleware;
}
