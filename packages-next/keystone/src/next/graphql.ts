import { KeystoneConfig } from '@keystone-next/types';
import { initConfig, createSystem, createApolloServerMicro } from '../..';

export function nextGraphQLAPIRoute(keystoneConfig: KeystoneConfig, prismaClient: any) {
  const initializedKeystoneConfig = initConfig(keystoneConfig);
  const { graphQLSchema, keystone, createContext } = createSystem(
    initializedKeystoneConfig,
    '.keystone',
    'none-skip-client-generation',
    prismaClient
  );

  const apolloServer = createApolloServerMicro({
    graphQLSchema,
    createContext,
    sessionStrategy: initializedKeystoneConfig.session
      ? initializedKeystoneConfig.session()
      : undefined,
    apolloConfig: initializedKeystoneConfig.graphql?.apolloConfig,
    connectionPromise: keystone.connect(),
  });

  return apolloServer.createHandler({ path: '/api/graphql' });
}
