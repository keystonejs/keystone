import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import cors, { CorsOptions } from 'cors';
import express from 'express';
import { GraphQLSchema } from 'graphql';
import { graphqlUploadExpress } from 'graphql-upload';
import { ApolloServer } from 'apollo-server-express';
import type { KeystoneConfig, CreateContext, SessionStrategy, GraphQLConfig } from '../../types';
import { createSessionContext } from '../../session';
import { DEFAULT_FILES_STORAGE_PATH } from '../context/createFilesContext';
import { DEFAULT_IMAGES_STORAGE_PATH } from '../context/createImagesContext';
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
    cors: false,
  });
  return apolloServer;
};

export const createExpressServer = async (
  config: KeystoneConfig,
  graphQLSchema: GraphQLSchema,
  createContext: CreateContext
): Promise<{
  expressServer: express.Express;
  apolloServer: ApolloServer<{
    req: IncomingMessage;
    res: ServerResponse;
  }>;
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
    const createRequestContext = async (req: IncomingMessage, res: ServerResponse) =>
      createContext({
        sessionContext: config.session
          ? await createSessionContext(config.session, req, res, createContext)
          : undefined,
        req,
      });

    await config.server.extendExpressApp(expressServer, createRequestContext);
  }

  if (config.server?.extendHttpServer) {
    const createRequestContext = async (req: IncomingMessage, res: ServerResponse) =>
      createContext({
        sessionContext: config.session
          ? await createSessionContext(config.session, req, res, createContext)
          : undefined,
        req,
      });
    config.server?.extendHttpServer(httpServer, createRequestContext);
  }

  if (config.files) {
    expressServer.use(
      '/files',
      express.static(config.files.local?.storagePath ?? DEFAULT_FILES_STORAGE_PATH)
    );
  }

  if (config.images) {
    expressServer.use(
      '/images',
      express.static(config.images.local?.storagePath ?? DEFAULT_IMAGES_STORAGE_PATH)
    );
  }

  const apolloServer = await addApolloServer({
    server: expressServer,
    config,
    graphQLSchema,
    createContext,
    sessionStrategy: config.session,
    graphqlConfig: config.graphql,
  });

  return { expressServer, apolloServer, httpServer };
};
