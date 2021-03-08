import { createSystem } from './createSystem';
import { initConfig } from './initConfig';
import { createSessionContext } from '../session';
import { formatError } from '@keystone-next/keystone-legacy/lib/Keystone/format-error';
import { ApolloServer } from 'apollo-server-micro';
import { KeystoneConfig } from '@keystone-next/types';

export const createApolloServerMicro = (keystoneConfig: KeystoneConfig) => {
  const sessionStrategy = keystoneConfig.session ? keystoneConfig.session() : undefined;
  const system = createSystem(initConfig(keystoneConfig), '.keystone', 'start');

  const connectionPromise = system.keystone.connect();

  return new ApolloServer({
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
};
