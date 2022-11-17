import type { IncomingMessage, ServerResponse } from 'http';
import { GraphQLError, GraphQLSchema } from 'graphql';
import { ApolloServer as ApolloServerMicro } from 'apollo-server-micro';
import { ApolloServer as ApolloServerExpress } from 'apollo-server-express';
import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
  Config,
} from 'apollo-server-core';
import type { KeystoneContext, GraphQLConfig, SessionStrategy } from '../../types';

export const createApolloServerMicro = ({
  graphQLSchema,
  context,
  sessionStrategy,
  graphqlConfig,
  connectionPromise,
}: {
  graphQLSchema: GraphQLSchema;
  context: KeystoneContext;
  sessionStrategy?: SessionStrategy<any>;
  graphqlConfig?: GraphQLConfig;
  connectionPromise: Promise<any>;
}) => {
  const userContext = async ({ req, res }: { req: IncomingMessage; res: ServerResponse }) => {
    await connectionPromise;
    return context.withRequest(req, res);
  };
  const serverConfig = _createApolloServerConfig({ graphQLSchema, graphqlConfig });
  return new ApolloServerMicro({ ...serverConfig, context: userContext });
};

export const createApolloServerExpress = ({
  graphQLSchema,
  context,
  sessionStrategy,
  graphqlConfig,
}: {
  graphQLSchema: GraphQLSchema;
  context: KeystoneContext;
  sessionStrategy?: SessionStrategy<any>;
  graphqlConfig?: GraphQLConfig;
}) => {
  const userContext = async ({ req, res }: { req: IncomingMessage; res: ServerResponse }) =>
    context.withRequest(req, res);
  const serverConfig = _createApolloServerConfig({ graphQLSchema, graphqlConfig });
  return new ApolloServerExpress({ ...serverConfig, context: userContext });
};

const _createApolloServerConfig = ({
  graphQLSchema,
  graphqlConfig,
}: {
  graphQLSchema: GraphQLSchema;
  graphqlConfig?: GraphQLConfig;
}): Config => {
  const apolloConfig = graphqlConfig?.apolloConfig;
  const playgroundOption = graphqlConfig?.playground ?? process.env.NODE_ENV !== 'production';

  return {
    schema: graphQLSchema,
    debug: graphqlConfig?.debug, // If undefined, use Apollo default of NODE_ENV !== 'production'
    cache: 'bounded',
    persistedQueries: false,
    ...apolloConfig,
    plugins:
      playgroundOption === 'apollo'
        ? apolloConfig?.plugins
        : [
            playgroundOption
              ? ApolloServerPluginLandingPageGraphQLPlayground({
                  settings: { 'request.credentials': 'same-origin' },
                })
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
