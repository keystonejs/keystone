export const apiTemplate = `
import keystoneConfig from '../../../../keystone';
import { createApolloServerMicro } from '@keystone-next/keystone';

const apolloServer = createApolloServerMicro(keystoneConfig);

export const config = {
  api: {
    bodyParser: false,
  },
};
export default apolloServer.createHandler({ path: '/api/graphql' });
`;
