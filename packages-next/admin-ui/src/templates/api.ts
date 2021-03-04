export const apiTemplate = `
import { createSystem, initConfig } from '@keystone-next/keystone';
import { createSessionContext } from '@keystone-next/keystone/session'
import { formatError } from '@keystonejs/keystone/lib/Keystone/format-error';
import { ApolloServer } from 'apollo-server-micro';
import keystoneConfig from '../../../../keystone';
import path from 'path';

const sessionStrategy = keystoneConfig.session ? keystoneConfig.session() : undefined;
const system = createSystem(initConfig(keystoneConfig), path.join(__dirname, '.keystone'), 'start');

const connectionPromise = system.keystone.connect();

const apolloServer = new ApolloServer({
  uploads: false,
  schema: system.graphQLSchema,
  playground: { settings: { 'request.credentials': 'same-origin' } },
  formatError,
  context: async ({ req, res }) => {
    await connectionPromise;
    return system.createContext({
      sessionContext: sessionStrategy
        ? await createSessionContext(sessionStrategy, req, res, system.createContext)
        : undefined,
      req,
    });
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};
export default apolloServer.createHandler({ path: '/api/graphql' });
`;
