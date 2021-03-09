import type { IncomingMessage, ServerResponse } from 'http';
import { GraphQLSchema } from 'graphql';
import { ApolloServer as ApolloServerMicro } from 'apollo-server-micro';
import { ApolloServer as ApolloServerExpress } from 'apollo-server-express';

// @ts-ignore
import { formatError } from '@keystone-next/keystone-legacy/lib/Keystone/format-error';
import type { CreateContext, SessionStrategy } from '@keystone-next/types';
import { createSessionContext } from '../session';

export const createApolloServerMicro = ({
  graphQLSchema,
  createContext,
  sessionStrategy,
  connectionPromise,
}: {
  graphQLSchema: GraphQLSchema;
  createContext: CreateContext;
  sessionStrategy?: SessionStrategy<any>;
  connectionPromise: Promise<any>;
}) => {
  return new ApolloServerMicro({
    uploads: false,
    schema: graphQLSchema,
    playground: { settings: { 'request.credentials': 'same-origin' } },
    formatError,
    context: async ({ req, res }: { req: IncomingMessage; res: ServerResponse }) => {
      await connectionPromise;
      return createContext({
        sessionContext: sessionStrategy
          ? await createSessionContext(sessionStrategy, req, res, createContext)
          : undefined,
        req,
      });
    },
  });
};

export const createApolloServerExpress = ({
  graphQLSchema,
  createContext,
  sessionStrategy,
}: {
  graphQLSchema: GraphQLSchema;
  createContext: CreateContext;
  sessionStrategy?: SessionStrategy<any>;
}) => {
  return new ApolloServerExpress({
    uploads: false,
    schema: graphQLSchema,
    // FIXME: allow the dev to control where/when they get a playground
    playground: { settings: { 'request.credentials': 'same-origin' } },
    formatError, // TODO: this needs to be discussed
    context: async ({ req, res }: { req: IncomingMessage; res: ServerResponse }) =>
      createContext({
        sessionContext: sessionStrategy
          ? await createSessionContext(sessionStrategy, req, res, createContext)
          : undefined,
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
};
