import { ApolloServer } from 'apollo-server-micro';
import { KeystoneConfig } from '../types';
import { initConfig } from '../lib/config/initConfig';
import { createSystem } from '../lib/createSystem';
import { createApolloServerMicro } from '../lib/server/createApolloServer';

type Handler = ReturnType<ApolloServer['createHandler']>;

export function nextGraphQLAPIRoute(keystoneConfig: KeystoneConfig, prismaClient: any): Handler {
  const initializedKeystoneConfig = initConfig(keystoneConfig);
  const { graphQLSchema, getKeystone } = createSystem(initializedKeystoneConfig);

  const keystone = getKeystone(prismaClient);

  keystone.connect();

  const apolloServer = createApolloServerMicro({
    graphQLSchema,
    createContext: keystone.createContext,
    sessionStrategy: initializedKeystoneConfig.session,
    graphqlConfig: initializedKeystoneConfig.graphql,
    connectionPromise: keystone.connect(),
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
