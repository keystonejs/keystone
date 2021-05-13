import { KeystoneConfig } from '@keystone-next/types';
import { initConfig } from '../lib/config/initConfig';
import { createSystem } from '../lib/createSystem';
import { createApolloServerMicro } from '../lib/server/createApolloServer';

export function nextGraphQLAPIRoute(keystoneConfig: KeystoneConfig, prismaClient: any) {
  const initializedKeystoneConfig = initConfig(keystoneConfig);
  const { graphQLSchema, connect, createContext } = createSystem(
    initializedKeystoneConfig,
    prismaClient
  );

  const apolloServer = createApolloServerMicro({
    graphQLSchema,
    createContext,
    sessionStrategy: initializedKeystoneConfig.session,
    apolloConfig: initializedKeystoneConfig.graphql?.apolloConfig,
    connectionPromise: connect(),
  });

  return apolloServer.createHandler({ path: '/api/graphql' });
}
