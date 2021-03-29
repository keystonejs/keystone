import type { KeystoneConfig, MigrationAction } from '@keystone-next/types';

import { createGraphQLSchema } from './createGraphQLSchema';
import { makeCreateContext } from './createContext';
import { createKeystone } from './createKeystone';

export function createSystem(
  config: KeystoneConfig,
  cwd: string,
  migrationAction: MigrationAction,
  prismaClient?: any
) {
  const keystone = createKeystone(config, cwd, migrationAction, prismaClient);

  const graphQLSchema = createGraphQLSchema(config, keystone, 'public');

  const internalSchema = createGraphQLSchema(config, keystone, 'internal');

  const createContext = makeCreateContext({ keystone, graphQLSchema, internalSchema });

  return { keystone, graphQLSchema, createContext };
}
