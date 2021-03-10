export const apiTemplate = `
import keystoneConfig from '../../../../keystone';
import { initConfig, createSystem, createApolloServerMicro } from '@keystone-next/keystone';
import { PrismaClient } from '../../../prisma/generated-client';

const initializedKeystoneConfig = initConfig(keystoneConfig);
const { graphQLSchema, keystone, createContext } = createSystem(initializedKeystoneConfig, '.keystone', 'start', PrismaClient);
const apolloServer = createApolloServerMicro({
  graphQLSchema,
  createContext,
  sessionStrategy: _config.session ? _config.session() : undefined,
  connectionPromise: keystone.connect(),
});

export const config = {
  api: {
    bodyParser: false,
  },
};
export default apolloServer.createHandler({ path: '/api/graphql' });
`;
