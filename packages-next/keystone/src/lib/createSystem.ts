import type { KeystoneConfig, MigrationMode } from '@keystone-next/types';

import { createGraphQLSchema } from './createGraphQLSchema';
import { makeCreateContext } from './createContext';
import { createKeystone } from './createKeystone';

export function createSystem(
  config: KeystoneConfig,
  dotKeystonePath: string,
  migrationMode: MigrationMode,
  prismaClient?: any
) {
  const keystone = createKeystone(config, dotKeystonePath, migrationMode, prismaClient);

  const graphQLSchema = createGraphQLSchema(config, keystone, 'public');

  const internalSchema = createGraphQLSchema(config, keystone, 'internal');

  const createContext = makeCreateContext({ keystone, graphQLSchema, internalSchema });

  return { keystone, graphQLSchema, createContext };
}
