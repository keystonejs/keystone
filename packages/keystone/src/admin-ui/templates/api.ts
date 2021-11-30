export const apiTemplate = `
import keystoneConfig from '../../../../keystone';
import { initConfig, createSystem, createApolloServerMicro } from '@keystone-6/core/system';
import { PrismaClient } from '.prisma/client';

const initializedKeystoneConfig = initConfig(keystoneConfig);
const { graphQLSchema, keystone, createContext } = createSystem(initializedKeystoneConfig, 'none', PrismaClient);
const apolloServer = createApolloServerMicro({
  graphQLSchema,
  createContext,
  sessionStrategy: initializedKeystoneConfig.session ? initializedKeystoneConfig.session() : undefined,
  graphqlConfig: initializedKeystoneConfig.graphql,
  connectionPromise: keystone.connect(),
});

export const config = {
  api: {
    bodyParser: false,
  },
};
export default apolloServer.createHandler({ path: initializedKeystoneConfig.graphql?.path || '/api/graphql' });
`;
