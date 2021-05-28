import type { IncomingMessage, ServerResponse } from 'http';
import { GraphQLSchema } from 'graphql';
import { ApolloServer as ApolloServerMicro } from 'apollo-server-micro';
import { ApolloServer as ApolloServerExpress } from 'apollo-server-express';
import type { Config } from 'apollo-server-express';
import type { CreateContext, SessionStrategy } from '@keystone-next/types';
import { createSessionContext } from '../../session';
import { formatError } from '../core/Keystone/format-error';

export const createApolloServerMicro = ({
  graphQLSchema,
  createContext,
  sessionStrategy,
  apolloConfig,
  connectionPromise,
}: {
  graphQLSchema: GraphQLSchema;
  createContext: CreateContext;
  sessionStrategy?: SessionStrategy<any>;
  apolloConfig?: Config;
  connectionPromise: Promise<any>;
}) => {
  const context = async ({ req, res }: { req: IncomingMessage; res: ServerResponse }) => {
    await connectionPromise;
    return createContext({
      sessionContext: sessionStrategy
        ? await createSessionContext(sessionStrategy, req, res, createContext)
        : undefined,
      req,
    });
  };
  const serverConfig = _createApolloServerConfig({ graphQLSchema, apolloConfig });
  return new ApolloServerMicro({ ...serverConfig, context });
};

export const createApolloServerExpress = ({
  graphQLSchema,
  createContext,
  sessionStrategy,
  apolloConfig,
}: {
  graphQLSchema: GraphQLSchema;
  createContext: CreateContext;
  sessionStrategy?: SessionStrategy<any>;
  apolloConfig?: Config;
}) => {
  const context = async ({ req, res }: { req: IncomingMessage; res: ServerResponse }) =>
    createContext({
      sessionContext: sessionStrategy
        ? await createSessionContext(sessionStrategy, req, res, createContext)
        : undefined,
      req,
    });
  const serverConfig = _createApolloServerConfig({ graphQLSchema, apolloConfig });
  return new ApolloServerExpress({ ...serverConfig, context });
};

const _createApolloServerConfig = ({
  graphQLSchema,
  apolloConfig,
}: {
  graphQLSchema: GraphQLSchema;
  apolloConfig?: Config;
}) => {
  // Playground config
  const pp = apolloConfig?.playground;
  let playground: Config['playground'];

  console.log('pp', pp);
  console.log('playground', playground);
  console.log('process.env.NODE_ENV', process.env.NODE_ENV);

  const settings = { 'request.credentials': 'same-origin' };

  // check: can we access http://localhost:3000/api/graphql?

  // graphql.apolloConfig.playground === false (playground not accessible in all cases)
  if (typeof pp === 'boolean' && !pp) {
    playground = false;
  // graphql.apolloConfig.playground === true (playground accessible in all cases)
  } else if (typeof pp === 'boolean') {
    playground = { settings };
  // graphql.apolloConfig.playground === { settings: ... } (playground accessible in all cases with further customisation)
  } else if (pp) {
    playground = { ...pp, settings: { ...settings, ...pp.settings } };
  // process.env.NODE_ENV === 'production' (playground not accessible in production)
  } else if (process.env.NODE_ENV === 'production') {
    playground = undefined;
  // N/A (playground uses defaults)
  } else {
    playground = { settings };
  }

  console.log('playground (final)', playground);

  return {
    uploads: false,
    schema: graphQLSchema,
    formatError, // TODO: this needs to be discussed
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
    ...apolloConfig,
    // Carefully inject the playground
    playground,
    // FIXME: Support for file handling configuration
    // maxFileSize: 200 * 1024 * 1024,
    // maxFiles: 5,
  };
};
