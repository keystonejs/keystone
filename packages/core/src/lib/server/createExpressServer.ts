import { createServer, Server } from 'http';
import cors, { CorsOptions } from 'cors';
import { json } from 'body-parser';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import { GraphQLSchema } from 'graphql';
// @ts-ignore
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
import { ApolloServer } from '@apollo/server';
import type { KeystoneConfig, KeystoneContext, GraphQLConfig } from '../../types';
import { createApolloServerExpress } from './createApolloServer';
import { addHealthCheck } from './addHealthCheck';

/*
NOTE: This creates the main Keystone express server, including the
GraphQL API, but does NOT add the Admin UI middleware.

The Admin UI takes a while to build for dev, and is created separately
so the CLI can bring up the dev server early to handle GraphQL requests.
*/

const DEFAULT_MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MiB

const addApolloServer = async ({
  server,
  config,
  graphQLSchema,
  context,
  graphqlConfig,
}: {
  server: express.Express;
  config: KeystoneConfig;
  graphQLSchema: GraphQLSchema;
  context: KeystoneContext;
  graphqlConfig?: GraphQLConfig;
}) => {
  const apolloServer = createApolloServerExpress({
    graphQLSchema,
    graphqlConfig,
  });

  const maxFileSize = config.server?.maxFileSize || DEFAULT_MAX_FILE_SIZE;
  server.use(graphqlUploadExpress({ maxFileSize }));
  await apolloServer.start();
  server.use(
    config.graphql?.path || '/api/graphql',
    json(config.graphql?.bodyParser),
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => {
        return await context.withRequest(req, res);
      },
    })
  );
  return apolloServer;
};

export const createExpressServer = async (
  config: KeystoneConfig,
  graphQLSchema: GraphQLSchema,
  context: KeystoneContext
): Promise<{
  expressServer: express.Express;
  apolloServer: ApolloServer<KeystoneContext>;
  httpServer: Server;
}> => {
  const expressServer = express();
  const httpServer = createServer(expressServer);

  if (config.server?.cors) {
    // Setting config.server.cors = true will provide backwards compatible defaults
    // Otherwise, the user can provide their own config object to use
    const corsConfig: CorsOptions =
      typeof config.server.cors === 'boolean'
        ? { origin: true, credentials: true }
        : config.server.cors;
    expressServer.use(cors(corsConfig));
  }

  addHealthCheck({ config, server: expressServer });

  if (config.server?.extendExpressApp) {
    await config.server.extendExpressApp(expressServer, context);
  }

  if (config.server?.extendHttpServer) {
    config.server?.extendHttpServer(httpServer, context, graphQLSchema);
  }

  if (config.storage) {
    for (const val of Object.values(config.storage)) {
      if (val.kind !== 'local' || !val.serverRoute) continue;
      expressServer.use(
        val.serverRoute.path,
        express.static(val.storagePath, {
          setHeaders(res) {
            if (val.type === 'file') {
              res.setHeader('Content-Type', 'application/octet-stream');
            }
          },
          index: false,
          redirect: false,
          lastModified: false,
        })
      );
    }
  }

  const apolloServer = await addApolloServer({
    server: expressServer,
    config,
    graphQLSchema,
    context,
    graphqlConfig: config.graphql,
  });

  return { expressServer, apolloServer, httpServer };
};
