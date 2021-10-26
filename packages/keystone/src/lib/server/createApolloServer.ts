import type { IncomingMessage, ServerResponse } from 'http';
import { GraphQLError, GraphQLSchema } from 'graphql';
import { ApolloServer as ApolloServerMicro } from 'apollo-server-micro';
import { ApolloServer as ApolloServerExpress } from 'apollo-server-express';
import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from 'apollo-server-core';
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
  const apolloConfig = graphqlConfig?.apolloConfig;
  const playgroundOption = graphqlConfig?.playground ?? process.env.NODE_ENV !== 'production';

  return {
    schema: graphQLSchema,
    debug: graphqlConfig?.debug, // If undefined, use Apollo default of NODE_ENV !== 'production'
    ...apolloConfig,
    plugins:
      playgroundOption === 'apollo'
        ? apolloConfig?.plugins
        : [
            playgroundOption
              ? ApolloServerPluginLandingPageGraphQLPlayground()
              : ApolloServerPluginLandingPageDisabled(),
            ...(apolloConfig?.plugins || []),
          ],
    formatError: formatError(graphqlConfig),
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
