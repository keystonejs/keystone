import type { KeystoneConfig, Provider } from '@keystone-next/types';

import { createGraphQLSchema } from './createGraphQLSchema';
import { makeCreateContext } from './context/createContext';
import { createKeystone } from './createKeystone';

export function getDBProvider(db: KeystoneConfig['db']): Provider {
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

export function createSystem(config: KeystoneConfig, prismaClient?: any) {
  const provider = getDBProvider(config.db);

  const keystone = createKeystone(config, provider, prismaClient);

  const graphQLSchema = createGraphQLSchema(config, keystone, 'public');

  const internalSchema = createGraphQLSchema(config, keystone, 'internal');

  const createContext = makeCreateContext({
    keystone,
    graphQLSchema,
    internalSchema,
    imagesConfig: config.images,
    filesConfig: config.files,
  });

  return { keystone, graphQLSchema, createContext };
}
