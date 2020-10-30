import type { GraphQLSchema } from 'graphql';
import { mergeSchemas } from '@graphql-tools/merge';

import type {
  ListSchemaConfig,
  ListConfig,
  BaseGeneratedListTypes,
  KeystoneConfig,
  ExtendGraphqlSchema,
  BaseFields,
} from '@keystone-next/types';

export function createSchema(config: ListSchemaConfig) {
  return config;
}

export function config(config: KeystoneConfig) {
  return config;
}

export function list<Fields extends BaseFields<BaseGeneratedListTypes>>(
  config: ListConfig<BaseGeneratedListTypes, Fields>
) {
  return config;
}

export function singleton<Fields extends BaseFields<BaseGeneratedListTypes>>(
  config: ListConfig<BaseGeneratedListTypes, Fields>
) {
  return config;
}

export function gql(strings: TemplateStringsArray) {
  return strings[0];
}

export function graphQLSchemaExtension({
  typeDefs,
  resolvers,
}: {
  typeDefs: string;
  resolvers: any;
}): ExtendGraphqlSchema {
  return (schema: GraphQLSchema) => {
    return mergeSchemas({ schemas: [schema], typeDefs, resolvers });
  };
}
