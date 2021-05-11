import type { KeystoneConfig, DatabaseProvider } from '@keystone-next/types';

import { createGraphQLSchema } from './createGraphQLSchema';
import { makeCreateContext } from './context/createContext';
import { createKeystone } from './createKeystone';

export function getDBProvider(db: KeystoneConfig['db']): DatabaseProvider {
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

  // Convert the Keystone lists into just what's needed by the createContext function
  // This will in soon evolve into the code in the next-fields effort.
  const lists = Object.fromEntries(
    Object.entries(keystone.lists).map(([listKey, list]) => {
      return [
        listKey,
        {
          listKey,
          itemQueryName: list.gqlNames.itemQueryName,
          listQueryName: list.gqlNames.listQueryName.slice(3),
        },
      ];
    })
  );

  const graphQLSchema = createGraphQLSchema(config, keystone, 'public');

  const internalSchema = createGraphQLSchema(config, keystone, 'internal');

  const createContext = makeCreateContext({
    keystone,
    graphQLSchema,
    internalSchema,
    config,
    prismaClient,
    lists,
  });

  return { keystone, graphQLSchema, createContext };
}
