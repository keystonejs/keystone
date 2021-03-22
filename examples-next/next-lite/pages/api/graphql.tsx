// TODO: Generate something into .keystone that we can import that makes this cleaner

import { initConfig, createSystem, createApolloServerMicro } from '@keystone-next/keystone';
import keystoneConfig from '../../keystone';

const initializedKeystoneConfig = initConfig(keystoneConfig);
const { graphQLSchema, keystone, createContext } = createSystem(
  initializedKeystoneConfig,
  '.keystone',
  'none'
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

export const config = {
  api: {
    bodyParser: false,
  },
};
export default apolloServer.createHandler({ path: '/api/graphql' });
