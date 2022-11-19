import { ApolloServer } from 'apollo-server-micro';
import { KeystoneConfig } from '../types';
import { initConfig } from '../lib/config/initConfig';
import { createSystem } from '../lib/createSystem';
import { createApolloServerMicro } from '../lib/server/createApolloServer';

type Handler = ReturnType<ApolloServer['createHandler']>;

export function nextGraphQLAPIRoute(keystoneConfig: KeystoneConfig, prismaClient: any): Handler {
  const initializedKeystoneConfig = initConfig(keystoneConfig);
  const { graphQLSchema, getKeystone } = createSystem(initializedKeystoneConfig);

  const { connect, context } = getKeystone(prismaClient);

  connect();

  const apolloServer = createApolloServerMicro({
    graphQLSchema,
    context,
    sessionStrategy: initializedKeystoneConfig.session,
    graphqlConfig: initializedKeystoneConfig.graphql,
    connectionPromise: connect(),
  });

  let startPromise = apolloServer.start();

  return async (req, res) => {
    await startPromise;
    return apolloServer.createHandler({ path: keystoneConfig.graphql?.path || '/api/graphql' })(
      req,
      res
    );
  };
}
