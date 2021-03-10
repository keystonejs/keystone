import type { KeystoneConfig } from '@keystone-next/types';

import { createGraphQLSchema } from './createGraphQLSchema';
import { makeCreateContext } from './createContext';
import { createKeystone } from './createKeystone';

export function createSystem(
  config: KeystoneConfig,
  dotKeystonePath: string,
  script: string,
  prismaClient?: any
) {
  const keystone = createKeystone(config, dotKeystonePath, script, prismaClient);

  const graphQLSchema = createGraphQLSchema(config, keystone);

  const createContext = makeCreateContext({ keystone, graphQLSchema });

  return { keystone, graphQLSchema, createContext };
}
