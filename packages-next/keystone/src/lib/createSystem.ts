import type { KeystoneConfig, Provider } from '@keystone-next/types';

import { createGraphQLSchema } from './createGraphQLSchema';
import { makeCreateContext } from './context/createContext';
import { createKeystone } from './createKeystone';

function getDBProvider(db: KeystoneConfig['db']): Provider {
  if (db.adapter === 'prisma_postgresql' || db.provider === 'postgresql') {
    return 'postgresql';
  } else if (db.adapter === 'prisma_sqlite' || db.provider === 'sqlite') {
    return 'sqlite';
  } else {
    throw new Error(
      'Invalid db configuration. Please specify db.provider as either "sqlite" or "postgresql"'
    );
  }
}

export function createSystem(config: KeystoneConfig, PrismaClient?: any) {
  const keystone = createKeystone(config);

  const graphQLSchema = createGraphQLSchema(config, keystone, 'public');

  const internalSchema = createGraphQLSchema(config, keystone, 'internal');
  const prismaClient = PrismaClient
    ? new PrismaClient({ datasources: { [getDBProvider(config.db)]: { url: config.url } } })
    : undefined;
  const createContext = makeCreateContext({
    graphQLSchema,
    internalSchema,
    imagesConfig: config.images,
    maxTotalResults: config.graphql?.queryLimits?.maxTotalResults ?? Infinity,
    prismaClient,
    gqlNamesByList,
  });

  return {
    keystone: {
      async connect() {
        await prismaClient.$connect();
        const context = createContext({ skipAccessControl: true, schemaName: 'internal' });
        await config.db.onConnect?.(context);
      },
      async disconnect() {
        await prismaClient.$disconnect();
      },
    },
    graphQLSchema,
    createContext,
  };
}
