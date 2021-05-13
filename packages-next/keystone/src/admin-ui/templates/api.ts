export const apiTemplate = `
import keystoneConfig from '../../../../keystone';
import { initConfig, createSystem, createApolloServerMicro } from '@keystone-next/keystone';
import { PrismaClient } from '.prisma/client';

const initializedKeystoneConfig = initConfig(keystoneConfig);
const { graphQLSchema, connect, createContext } = createSystem(initializedKeystoneConfig, 'none', PrismaClient);
const apolloServer = createApolloServerMicro({
  graphQLSchema,
  createContext,
  sessionStrategy: initializedKeystoneConfig.session ? initializedKeystoneConfig.session() : undefined,
  apolloConfig: initializedKeystoneConfig.graphql?.apolloConfig,
  connectionPromise: connect(),
});

export const config = {
  api: {
    bodyParser: false,
  },
};
export default apolloServer.createHandler({ path: '/api/graphql' });
`;
