import cors, { CorsOptions } from 'cors';
import express from 'express';
import { GraphQLSchema } from 'graphql';
import { graphqlUploadExpress } from 'graphql-upload';
import type { KeystoneConfig, CreateContext, SessionStrategy, GraphQLConfig } from '../../types';
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
  createContext,
  sessionStrategy,
  graphqlConfig,
}: {
  server: express.Express;
  config: KeystoneConfig;
  graphQLSchema: GraphQLSchema;
  createContext: CreateContext;
  sessionStrategy?: SessionStrategy<any>;
  graphqlConfig?: GraphQLConfig;
}) => {
  const apolloServer = createApolloServerExpress({
    graphQLSchema,
    createContext,
    sessionStrategy,
    graphqlConfig,
  });

  const maxFileSize = config.server?.maxFileSize || DEFAULT_MAX_FILE_SIZE;
  server.use(graphqlUploadExpress({ maxFileSize }));
  await apolloServer.start();
  apolloServer.applyMiddleware({
    app: server,
    path: config.graphql?.path || '/api/graphql',
    cors:
      config.graphql?.cors ||
      (process.env.NODE_ENV !== 'production'
        ? { origin: 'https://studio.apollographql.com', credentials: true }
        : undefined),
  });
};

export const createExpressServer = async (
  config: KeystoneConfig,
  graphQLSchema: GraphQLSchema,
  createContext: CreateContext
) => {
  const server = express();

  if (config.server?.cors) {
    // Setting config.server.cors = true will provide backwards compatible defaults
    // Otherwise, the user can provide their own config object to use
    const corsConfig: CorsOptions =
      typeof config.server.cors === 'boolean'
        ? { origin: true, credentials: true }
        : config.server.cors;
    server.use(cors(corsConfig));
  }

  addHealthCheck({ config, server });

  if (config.server?.extendExpressApp) {
    config.server?.extendExpressApp(server);
  }

  await addApolloServer({
    server,
    config,
    graphQLSchema,
    createContext,
    sessionStrategy: config.session,
    graphqlConfig: config.graphql,
  });

  return server;
};
