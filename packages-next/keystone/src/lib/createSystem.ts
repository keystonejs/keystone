import type { KeystoneConfig } from '@keystone-next/types';

import { createGraphQLSchema } from './createGraphQLSchema';
import { makeCreateContext } from './createContext';
import { createKeystone } from './createKeystone';

export function createSystem(config: KeystoneConfig, prismaClient?: any) {
  const keystone = createKeystone(config, prismaClient);

  const graphQLSchema = createGraphQLSchema(config, keystone, 'public');

  const internalSchema = createGraphQLSchema(config, keystone, 'internal');

  const createContext = makeCreateContext({
    keystone,
    graphQLSchema,
    internalSchema,
    imagesConfig: config.images,
  });

  return { keystone, graphQLSchema, createContext };
}
