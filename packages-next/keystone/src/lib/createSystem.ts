import type { KeystoneConfig } from '@keystone-next/types';

import { createGraphQLSchema } from './createGraphQLSchema';
import { makeCreateContext } from './context/createContext';
import { createKeystone } from './createKeystone';

export function createSystem(config: KeystoneConfig, prismaClient?: any) {
  const keystone = createKeystone(config, prismaClient);

  const graphQLSchema = createGraphQLSchema(config, keystone, 'public');

  const internalSchema = createGraphQLSchema(config, keystone, 'internal');

  const createContext = makeCreateContext({
    graphQLSchema,
    internalSchema,
    imagesConfig: config.images,
    maxTotalResults: config.graphql?.queryLimits?.maxTotalResults ?? Infinity,
  });

  return { keystone, graphQLSchema, createContext };
}
