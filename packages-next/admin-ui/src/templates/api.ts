// so you might be thinking "that ../../../../../prisma/generated-client path looks very wrong, it's a directory above the user's keystone config?"
// and the answer to that is "yes, it's wrong from one perspective but it's also right because webpack things"
// in our next config (in this package at src/next-config.ts), we mark anything matching `prisma/generated-client` external
// this means that webpack will naively leave it as a require to ../../../../../prisma/generated-client
// ../../../../../prisma/generated-client is the exact right path to get to the generated client
// from where the bundled version of this file will be generated at so the require will end up working

export const apiTemplate = `
import keystoneConfig from '../../../../keystone';
import { initConfig, createSystem, createApolloServerMicro } from '@keystone-next/keystone';
import { PrismaClient } from '../../../../../prisma/generated-client';

const initializedKeystoneConfig = initConfig(keystoneConfig);
const { graphQLSchema, keystone, createContext } = createSystem(initializedKeystoneConfig, process.cwd(), 'none', PrismaClient);
const apolloServer = createApolloServerMicro({
  graphQLSchema,
  createContext,
  sessionStrategy: initializedKeystoneConfig.session ? initializedKeystoneConfig.session() : undefined,
  apolloConfig: initializedKeystoneConfig.graphql?.apolloConfig,
  connectionPromise: keystone.connect(),
});

export const config = {
  api: {
    bodyParser: false,
  },
};
export default apolloServer.createHandler({ path: '/api/graphql' });
`;
