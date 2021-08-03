import { KeystoneConfig } from '@keystone-next/types';
import { initConfig } from '../lib/config/initConfig';
import { createSystem } from '../lib/createSystem';
import { createApolloServerMicro } from '../lib/server/createApolloServer';

export function nextGraphQLAPIRoute(keystoneConfig: KeystoneConfig, prismaClient: any) {
  const initializedKeystoneConfig = initConfig(keystoneConfig);
  const { graphQLSchema, getKeystone } = createSystem(initializedKeystoneConfig);

  const keystone = getKeystone(prismaClient);

  keystone.connect();

  const apolloServer = createApolloServerMicro({
    graphQLSchema,
    createContext: keystone.createContext,
    sessionStrategy: initializedKeystoneConfig.session,
    apolloConfig: initializedKeystoneConfig.graphql?.apolloConfig,
    connectionPromise: keystone.connect(),
  });

  return apolloServer.createHandler({ path: '/api/graphql' });
}
