import type { KeystoneConfig, MigrationMode } from '@keystone-next/types';

import { createGraphQLSchema } from './createGraphQLSchema';
import { makeCreateContext } from './createContext';
import { createKeystone } from './createKeystone';

export function createSystem(
  config: KeystoneConfig,
  dotKeystonePath: string,
  migrationMode: MigrationMode
) {
  const keystone = createKeystone(config, dotKeystonePath, migrationMode);

  const graphQLSchema = createGraphQLSchema(config, keystone);

  const createContext = makeCreateContext({ keystone, graphQLSchema });

  return { keystone, graphQLSchema, createContext };
}
