import { GraphQLFormattedError, GraphQLSchema } from 'graphql';
import { ApolloServer, ApolloServerOptions } from '@apollo/server';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import type { KeystoneContext, GraphQLConfig } from '../../types';

export const createApolloServerExpress = ({
  graphQLSchema,
  graphqlConfig,
}: {
  graphQLSchema: GraphQLSchema;
  graphqlConfig?: GraphQLConfig;
}) => {
  const serverConfig = _createApolloServerConfig({ graphQLSchema, graphqlConfig });
  return new ApolloServer({ ...serverConfig });
};

const _createApolloServerConfig = ({
  graphQLSchema,
  graphqlConfig,
}: {
  graphQLSchema: GraphQLSchema;
  graphqlConfig?: GraphQLConfig;
}): ApolloServerOptions<KeystoneContext> => {
  const apolloConfig = graphqlConfig?.apolloConfig;
  const playgroundOption = graphqlConfig?.playground ?? process.env.NODE_ENV !== 'production';

  return {
    formatError: formatError(graphqlConfig),
    includeStacktraceInErrorResponses: graphqlConfig?.debug, // If undefined, use Apollo default of NODE_ENV !== 'production'
    ...apolloConfig,
    schema: graphQLSchema,
    plugins:
      playgroundOption === 'apollo'
        ? apolloConfig?.plugins
        : [
            playgroundOption
              ? ApolloServerPluginLandingPageLocalDefault()
              : ApolloServerPluginLandingPageDisabled(),
            ...(apolloConfig?.plugins || []),
          ],
  } as ApolloServerOptions<KeystoneContext>;
};

const formatError = (graphqlConfig: GraphQLConfig | undefined) => {
  return (formattedError: GraphQLFormattedError, error: unknown) => {
    let debug = graphqlConfig?.debug;
    if (debug === undefined) {
      debug = process.env.NODE_ENV !== 'production';
    }

    if (!debug && formattedError.extensions) {
      // Strip out any `debug` extensions
      delete formattedError.extensions.debug;
      delete formattedError.extensions.exception;
    }

    if (graphqlConfig?.apolloConfig?.formatError) {
      return graphqlConfig.apolloConfig.formatError(formattedError, error);
    } else {
      return formattedError;
    }
  };
};
