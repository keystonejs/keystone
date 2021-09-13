import type { IncomingMessage, ServerResponse } from 'http';
import { GraphQLError, GraphQLSchema } from 'graphql';
import { ApolloServer as ApolloServerMicro } from 'apollo-server-micro';
import { ApolloServer as ApolloServerExpress } from 'apollo-server-express';
import type { Config } from 'apollo-server-express';
import type { CreateContext, GraphQLConfig, SessionStrategy } from '../../types';
import { createSessionContext } from '../../session';

export const createApolloServerMicro = ({
  graphQLSchema,
  createContext,
  sessionStrategy,
  graphqlConfig,
  connectionPromise,
}: {
  graphQLSchema: GraphQLSchema;
  createContext: CreateContext;
  sessionStrategy?: SessionStrategy<any>;
  graphqlConfig?: GraphQLConfig;
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
  const serverConfig = _createApolloServerConfig({ graphQLSchema, graphqlConfig });
  return new ApolloServerMicro({ ...serverConfig, context });
};

export const createApolloServerExpress = ({
  graphQLSchema,
  createContext,
  sessionStrategy,
  graphqlConfig,
}: {
  graphQLSchema: GraphQLSchema;
  createContext: CreateContext;
  sessionStrategy?: SessionStrategy<any>;
  graphqlConfig?: GraphQLConfig;
}) => {
  const context = async ({ req, res }: { req: IncomingMessage; res: ServerResponse }) =>
    createContext({
      sessionContext: sessionStrategy
        ? await createSessionContext(sessionStrategy, req, res, createContext)
        : undefined,
      req,
    });
  const serverConfig = _createApolloServerConfig({ graphQLSchema, graphqlConfig });
  return new ApolloServerExpress({ ...serverConfig, context });
};

const _createApolloServerConfig = ({
  graphQLSchema,
  graphqlConfig,
}: {
  graphQLSchema: GraphQLSchema;
  graphqlConfig?: GraphQLConfig;
}) => {
  // Playground config
  const apolloConfig = graphqlConfig?.apolloConfig;
  const apolloConfigPlayground = apolloConfig?.playground;
  let playground: Config['playground'];
  const settings = { 'request.credentials': 'same-origin' };

  if (typeof apolloConfigPlayground === 'boolean' && !apolloConfigPlayground) {
    // graphql.apolloConfig.playground === false (playground not accessible in all cases)
    playground = false;
  } else if (typeof apolloConfigPlayground === 'boolean') {
    // graphql.apolloConfig.playground === true (playground accessible in all cases)
    playground = { settings };
  } else if (apolloConfigPlayground) {
    // graphql.apolloConfig.playground === { settings: ... } (playground accessible in all cases with further customisation - https://www.apollographql.com/docs/apollo-server/testing/graphql-playground)
    playground = {
      ...apolloConfigPlayground,
      settings: { ...settings, ...apolloConfigPlayground.settings },
    };
  } else if (process.env.NODE_ENV === 'production') {
    // process.env.NODE_ENV === 'production' (playground not accessible in production)
    playground = undefined;
  } else {
    // not specified at all (playground uses defaults)
    playground = { settings };
  }

  const apolloConfigIntrospection = apolloConfig?.introspection;
  let introspection: Config['introspection'];

  if (typeof apolloConfigIntrospection === 'boolean' && !apolloConfigIntrospection) {
    // graphql.apolloConfig.introspection === false (introspection not accessible in all cases)
    introspection = false;
  } else if (typeof apolloConfigIntrospection === 'boolean') {
    // graphql.apolloConfig.introspection === true (introspection accessible in all cases)
    introspection = true;
  } else if (process.env.NODE_ENV === 'production') {
    // process.env.NODE_ENV === 'production' (introspection not accessible in production)
    introspection = undefined;
  } else if ((typeof playground === 'boolean' && playground) || typeof playground === 'object') {
    // not specified at all (introspection enabled if playground is enabled or defined)
    introspection = true;
  }

  return {
    uploads: false,
    schema: graphQLSchema,
    debug: graphqlConfig?.debug, // If undefined, use Apollo default of NODE_ENV !== 'production'
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
    formatError: formatError(graphqlConfig),
    // Carefully inject the playground and introspection variables
    playground,
    introspection,
    // FIXME: Support for file handling configuration
    // maxFileSize: 200 * 1024 * 1024,
    // maxFiles: 5,
  };
};

const formatError = (graphqlConfig: GraphQLConfig | undefined) => {
  return (err: GraphQLError) => {
    let debug = graphqlConfig?.debug;
    if (debug === undefined) {
      debug = process.env.NODE_ENV !== 'production';
    }

    if (!debug && err.extensions) {
      // Strip out any `debug` extensions
      delete err.extensions.debug;
      delete err.extensions.exception;
    }

    if (graphqlConfig?.apolloConfig?.formatError) {
      return graphqlConfig.apolloConfig.formatError(err);
    } else {
      return err;
    }
  };
};
