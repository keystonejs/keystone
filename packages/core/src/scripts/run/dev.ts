import path from 'path';
import type { ListenOptions } from 'net';
import url from 'url';
import { createServer } from 'http';
import express from 'express';
import { GraphQLSchema, printSchema } from 'graphql';
import fs from 'fs-extra';
import chalk from 'chalk';
import esbuild, { BuildFailure, BuildResult } from 'esbuild';
import { generateAdminUI } from '../../admin-ui/system';
import { devMigrations, pushPrismaSchemaToDatabase } from '../../lib/migrations';
import { createSystem } from '../../lib/createSystem';
import { getEsbuildConfig, loadBuiltConfig } from '../../lib/config/loadConfig';
import { defaults } from '../../lib/config/defaults';
import { createExpressServer } from '../../lib/server/createExpressServer';
import {
  createAdminUIMiddlewareWithNextApp,
  getNextApp,
} from '../../lib/server/createAdminUIMiddleware';
import { runTelemetry } from '../../lib/telemetry';
import {
  generateCommittedArtifacts,
  generateNodeModulesArtifacts,
  generateNodeModulesArtifactsWithoutPrismaClient,
  getFormattedGraphQLSchema,
  getSchemaPaths,
  requirePrismaClient,
} from '../../artifacts';
import { ExitError, getAdminPath, getBuiltConfigPath } from '../utils';
import { KeystoneConfig } from '../../types';
import { initialiseLists } from '../../lib/core/types-for-lists';
import { printPrismaSchema } from '../../lib/core/prisma-schema';
import { AdminMetaRootVal } from '../../admin-ui/system/createAdminMeta';
import { Flags } from './../cli';

const devLoadingHTMLFilepath = path.join(
  path.dirname(require.resolve('@keystone-6/core/package.json')),
  'static',
  'dev-loading.html'
);

const cleanConfig = (config: KeystoneConfig): KeystoneConfig => {
  const { server, ...rest } = config;
  if (server) {
    const { extendHttpServer, ...restServer } = server;
    return { ...rest, server: restServer };
  }
  return rest;
};

function resolvablePromise<T>(): Promise<T> & { resolve: (value: T) => void } {
  let _resolve!: (value: T) => void;
  const promise: any = new Promise<T>(resolve => {
    _resolve = resolve;
  });
  promise.resolve = _resolve;
  return promise;
}

function isBuildFailure(err: unknown): err is BuildFailure {
  return err instanceof Error && Array.isArray((err as any).errors);
}

let shouldWatch = true;

export function setSkipWatching() {
  shouldWatch = false;
}

// note that because we don't catch this throwing, if this fails it'll crash the process
// so that means if
// - you have an error in your config on startup -> will fail to start and you have to start the process manually after fixing the problem
// - you have an error in your config after startup -> will keep the last working version until importing the config succeeds
// also, if you're thinking "why not always use the Next api route to get the config"?
// this will get the GraphQL API up earlier
type WatchBuildResult = { error: BuildFailure | null; result: BuildResult | null };

export async function dev(cwd: string, { server, prisma, dbPush, resetDb, ui }: Flags) {
  console.log('✨ Starting Keystone');
  const app = server ? express() : null;
  const httpServer = app ? createServer(app) : null;

  let expressServer: express.Express | null = null;
  let hasAddedAdminUIMiddleware = false;
  let disconnect: null | (() => Promise<void>) = null;
  let lastPromise = resolvablePromise<IteratorResult<WatchBuildResult>>();

  const builds: AsyncIterable<WatchBuildResult> = {
    [Symbol.asyncIterator]: () => ({ next: () => lastPromise }),
  };
  const initialBuildResult = await esbuild
    .build({
      ...getEsbuildConfig(cwd),
      watch: shouldWatch
        ? {
            onRebuild(error, result) {
              let prev = lastPromise;
              lastPromise = resolvablePromise();
              prev.resolve({ value: { error, result }, done: false });
            },
          }
        : undefined,
    })
    .catch(async err => {
      if (isBuildFailure(err)) {
        // when a build failure happens, esbuild will have printed the error already
        throw new ExitError(1);
      }
      throw err;
    });
  const configWithHTTP = loadBuiltConfig(cwd);
  const config = cleanConfig(configWithHTTP);
  const isReady = () => !server || (expressServer !== null && hasAddedAdminUIMiddleware);

  const initKeystone = async () => {
    await fs.remove(getAdminPath(cwd));
    const {
      adminMeta,
      graphQLSchema,
      context,
      prismaSchema,
      prismaClientModule,
      apolloServer,
      ...rest
    } = await setupInitialKeystone(config, cwd, { server, prisma, dbPush, resetDb });

    if (configWithHTTP?.server?.extendHttpServer && httpServer && context) {
      configWithHTTP.server.extendHttpServer(httpServer, context, graphQLSchema);
    }

    const prismaClient = context?.prisma;
    if (rest.disconnect && rest.expressServer) {
      ({ disconnect, expressServer } = rest);
    }
    const nextApp = await initAdminUI(config, graphQLSchema, adminMeta, cwd, ui);
    if (nextApp && expressServer && context) {
      expressServer.use(createAdminUIMiddlewareWithNextApp(config, context, nextApp));
    }
    hasAddedAdminUIMiddleware = true;
    initKeystonePromiseResolve();

    const initialisedLists = initialiseLists(config);
    const originalPrismaSchema = printPrismaSchema(
      initialisedLists,
      config.db.provider,
      config.db.prismaPreviewFeatures,
      config.db.additionalPrismaDatasourceProperties,
      config.db.extendPrismaSchema
    );
    let lastPrintedGraphQLSchema = printSchema(graphQLSchema);
    let lastApolloServer = apolloServer || null;

    if (config.telemetry !== false) {
      runTelemetry(cwd, initialisedLists, config.db.provider);
    }

    for await (const buildResult of builds) {
      // esbuild will have printed any errors already
      if (buildResult.error) continue;

      console.log('compiled successfully');
      try {
        const resolved = require.resolve(getBuiltConfigPath(cwd));
        delete require.cache[resolved];
        const newConfigWithHttp = loadBuiltConfig(cwd);
        const newConfig = cleanConfig(newConfigWithHttp);
        if (prisma) {
          const newPrismaSchema = printPrismaSchema(
            initialiseLists(newConfig),
            newConfig.db.provider,
            newConfig.db.prismaPreviewFeatures,
            newConfig.db.additionalPrismaDatasourceProperties,
            newConfig.db.extendPrismaSchema
          );
          if (originalPrismaSchema !== newPrismaSchema) {
            console.log('🔄 Your prisma schema has changed, please restart Keystone');
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
        }
        const { graphQLSchema, getKeystone, adminMeta } = createSystem(newConfig);
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
        if (prismaClientModule) {
          if (server && lastApolloServer) {
            const keystone = getKeystone({
              PrismaClient: function fakePrismaClientClass() {
                return prismaClient;
              } as unknown as new (args: unknown) => any,
              Prisma: prismaClientModule.Prisma,
            });
            const servers = await createExpressServer(newConfig, graphQLSchema, keystone.context);
            if (nextApp) {
              servers.expressServer.use(
                createAdminUIMiddlewareWithNextApp(newConfig, keystone.context, nextApp)
              );
            }
            expressServer = servers.expressServer;
            let prevApolloServer = lastApolloServer;
            lastApolloServer = servers.apolloServer;
            await prevApolloServer.stop();
          }
        }
      } catch (err) {
        console.log('🚨', chalk.red('There was an error loading your Keystone config'));
        console.log(err);
      }
    }
  };

  // You shouldn't really be doing a healthcheck on the dev server, but we
  // respond on the endpoint with the correct error code just in case. This
  // doesn't send the configured data shape, because config doesn't allow
  // for the "not ready" case but that's probably OK.
  if (config.server?.healthCheck && app) {
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
  let initKeystonePromiseResolve: () => void | undefined;
  let initKeystonePromiseReject: (err: any) => void | undefined;
  let initKeystonePromise = new Promise<void>((resolve, reject) => {
    initKeystonePromiseResolve = resolve;
    initKeystonePromiseReject = reject;
  });

  if (app && httpServer) {
    app.use('/__keystone_dev_status', (req, res) => {
      res.json({ ready: isReady() ? true : false });
    });

    // Pass the request the express server, or serve the loading page
    app.use((req, res, next) => {
      // If both the express server and Admin UI Middleware are ready, we're go!
      if (expressServer && hasAddedAdminUIMiddleware) {
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

    const httpOptions: ListenOptions = {
      port: 3000,
    };

    if (config?.server && 'port' in config.server) {
      httpOptions.port = config.server.port;
    }

    if (config?.server && 'options' in config.server && config.server.options) {
      Object.assign(httpOptions, config.server.options);
    }

    // preference env.PORT if supplied
    if ('PORT' in process.env) {
      httpOptions.port = parseInt(process.env.PORT || '');
    }

    // preference env.HOST if supplied
    if ('HOST' in process.env) {
      httpOptions.host = process.env.HOST || '';
    }

    const server = httpServer.listen(httpOptions, (err?: any) => {
      if (err) throw err;

      const easyHost = [undefined, '', '::', '0.0.0.0'].includes(httpOptions.host)
        ? 'localhost'
        : httpOptions.host;
      console.log(
        `⭐️ Server listening on ${httpOptions.host || ''}:${
          httpOptions.port
        } (http://${easyHost}:${httpOptions.port}/)`
      );
      console.log(`⭐️ GraphQL API available at ${config.graphql?.path || '/api/graphql'}`);

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
          initialBuildResult.stop?.();
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
  } else {
    await initKeystone();
    return () => Promise.resolve();
  }
}

async function setupInitialKeystone(
  config: KeystoneConfig,
  cwd: string,
  options: { dbPush: boolean; resetDb: boolean; prisma: boolean; server: boolean }
) {
  const { dbPush, resetDb, prisma, server } = options;
  const { graphQLSchema, adminMeta, getKeystone } = createSystem(config);

  // Make local storage folders if used
  for (const val of Object.values(config.storage || {})) {
    if (val.kind !== 'local') continue;

    fs.mkdirSync(val.storagePath, { recursive: true });
    console.warn(`WARNING: 'mkdir -p ${val.storagePath}' won't happen in production`);
  }

  // Generate the Artifacts
  if (prisma) {
    console.log('✨ Generating GraphQL and Prisma schemas');
    const prismaSchema = (await generateCommittedArtifacts(graphQLSchema, config, cwd)).prisma;
    const prismaClientGenerationPromise = generateNodeModulesArtifacts(graphQLSchema, config, cwd);

    if (config.db.useMigrations) {
      await devMigrations(
        config.db.url,
        config.db.shadowDatabaseUrl,
        prismaSchema,
        getSchemaPaths(cwd).prisma,
        resetDb
      );
    } else if (dbPush) {
      await pushPrismaSchemaToDatabase(
        config.db.url,
        config.db.shadowDatabaseUrl,
        prismaSchema,
        getSchemaPaths(cwd).prisma,
        resetDb
      );
    } else {
      console.log('⚠️ Skipping database schema push');
    }

    await prismaClientGenerationPromise;
    const prismaClientModule = requirePrismaClient(cwd);
    const keystone = getKeystone(prismaClientModule);

    // Connect to the Database
    console.log('✨ Connecting to the database');
    await keystone.connect(); // TODO: remove, replace with server.onStart
    if (!server) {
      return {
        adminMeta,
        disconnect: () => keystone.disconnect(),
        graphQLSchema,
        context: keystone.context,
        prismaSchema,
        prismaClientModule,
      };
    }
    // Set up the Express Server
    console.log('✨ Creating server');
    const { apolloServer, expressServer } = await createExpressServer(
      config,
      graphQLSchema,
      keystone.context
    );
    console.log(`✅ GraphQL API ready`);

    return {
      adminMeta,
      disconnect: () => keystone.disconnect(),
      expressServer,
      apolloServer,
      graphQLSchema,
      context: keystone.context,
      prismaSchema,
      prismaClientModule,
    };
  }
  return {
    adminMeta,
    graphQLSchema,
  };
}

async function initAdminUI(
  config: KeystoneConfig,
  graphQLSchema: GraphQLSchema,
  adminMeta: AdminMetaRootVal,
  cwd: string,
  ui: boolean
) {
  if (config.ui?.isDisabled || !ui) {
    return;
  }
  console.log('✨ Generating Admin UI code');
  await generateAdminUI(config, graphQLSchema, adminMeta, getAdminPath(cwd), false);

  console.log('✨ Preparing Admin UI app');
  const nextApp = await getNextApp(true, getAdminPath(cwd));
  console.log(`✅ Admin UI ready`);
  return nextApp;
}
