export const apiTemplate = `
import keystoneConfig from '../../../../keystone';
import { initConfig, createSystem, createApolloServerMicro } from '@keystone-next/keystone';

const config = initConfig(keystoneConfig);
const { graphQLSchema, keystone, createContext } = createSystem(config, '.keystone', 'start');
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
