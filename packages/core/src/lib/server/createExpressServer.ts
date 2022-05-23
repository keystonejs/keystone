import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { pipeline } from 'stream';
import { promisify } from 'util';
import cors, { CorsOptions } from 'cors';
import express from 'express';
import { GraphQLSchema } from 'graphql';
import { graphqlUploadExpress } from 'graphql-upload';
import { ApolloServer } from 'apollo-server-express';
import fetch from 'node-fetch';
import type { KeystoneConfig, CreateContext, SessionStrategy, GraphQLConfig } from '../../types';
import { createSessionContext } from '../../session';
import { getS3AssetsEndpoint } from '../assets/s3';
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

const streamPipeline = promisify(pipeline);

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

  if (config.storage) {
    for (const val of Object.values(config.storage)) {
      if (!val.serverRoute) continue;
      if (val.kind === 'local') {
        expressServer.use(val.serverRoute.path, express.static(val.storagePath));
      } else if (val.kind === 's3') {
        const endpoint = getS3AssetsEndpoint(val);
        expressServer.use(`${val.serverRoute.path}/:id`, async (req, res) => {
          const s3Url = new URL(endpoint);
          s3Url.pathname += `${val.pathPrefix || ''}${
            req.params.id
          }`;

          // pass through the URL query parameters verbatim
          // the URL object is always absolute but req.url is not
          // so we have to provide a base URL but we don't really care what it is
          const { searchParams } = new URL(req.url, 'https://example.com');
          for (const [key, value] of searchParams) {
            s3Url.searchParams.append(key, value);
          }

          const imageResponse = await fetch(s3Url.toString());
          if (!imageResponse.ok) {
            return res
              .status(imageResponse.status)
              .end(`Unexpected response ${imageResponse.statusText}`);
          }

          for (const header of ['Content-Type', 'Content-Length', 'Cache-Control']) {
            const headerValue = imageResponse.headers.get(header);
            if (headerValue) {
              res.setHeader(header, headerValue);
            }
          }

          res.status(200);
          await streamPipeline(imageResponse.body, res);
        });
      }
    }
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
