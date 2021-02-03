import type { IncomingMessage, ServerResponse } from 'http';
import cors, { CorsOptions } from 'cors';
import express from 'express';
import { GraphQLSchema } from 'graphql';
import { ApolloServer } from 'apollo-server-express';
import { graphqlUploadExpress } from 'graphql-upload';
// @ts-ignore
import { formatError } from '@keystonejs/keystone/lib/Keystone/format-error';
import type { KeystoneConfig, SessionImplementation, CreateContext } from '@keystone-next/types';
import { createAdminUIServer } from '@keystone-next/admin-ui/system';
import { implementSession } from '../session';

const addApolloServer = ({
  server,
  graphQLSchema,
  createContext,
  sessionImplementation,
}: {
  server: express.Express;
  graphQLSchema: GraphQLSchema;
  createContext: CreateContext;
  sessionImplementation?: SessionImplementation;
}) => {
  const apolloServer = new ApolloServer({
    uploads: false,
    schema: graphQLSchema,
    // FIXME: allow the dev to control where/when they get a playground
    playground: { settings: { 'request.credentials': 'same-origin' } },
    formatError, // TODO: this needs to be discussed
    context: async ({ req, res }: { req: IncomingMessage; res: ServerResponse }) =>
      createContext({
        sessionContext: await sessionImplementation?.createSessionContext(req, res, createContext),
        req,
      }),
    // FIXME: support for apollo studio tracing
    // ...(process.env.ENGINE_API_KEY || process.env.APOLLO_KEY
    //   ? { tracing: true }
    //   : {
    //       engine: false,
    //       // Only enable tracing in dev mode so we can get local debug info, but
    //       // don't bother returning that info on prod when the `engine` is
    //       // disabled.
    //       tracing: dev,
    //     }),
    // FIXME: Support for generic custom apollo configuration
    // ...apolloConfig,
  });
  // FIXME: Support custom API path via config.graphql.path.
  // Note: Core keystone uses '/admin/api' as the default.
  // FIXME: Support for file handling configuration
  // maxFileSize: 200 * 1024 * 1024,
  // maxFiles: 5,
  server.use(graphqlUploadExpress());
  apolloServer.applyMiddleware({ app: server, path: '/api/graphql', cors: false });
};

export const createExpressServer = async (
  config: KeystoneConfig,
  graphQLSchema: GraphQLSchema,
  createContext: CreateContext,
  dev: boolean,
  projectAdminPath: string
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

  const sessionImplementation = config.session ? implementSession(config.session()) : undefined;

  console.log('✨ Preparing GraphQL Server');
  addApolloServer({ server, graphQLSchema, createContext, sessionImplementation });

  console.log('✨ Preparing Next.js app');
  server.use(
    await createAdminUIServer(
      config.ui,
      createContext,
      dev,
      projectAdminPath,
      sessionImplementation
    )
  );

  return server;
};
