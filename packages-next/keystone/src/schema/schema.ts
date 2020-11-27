import type { GraphQLSchema } from 'graphql';
import { mergeSchemas } from '@graphql-tools/merge';

import type {
  BaseFields,
  BaseGeneratedListTypes,
  ExtendGraphqlSchema,
  GraphQLResolver,
  KeystoneConfig,
  ListConfig,
  ListSchemaConfig,
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

type Resolvers = Record<string, Record<string, GraphQLResolver>>;

export function graphQLSchemaExtension({
  typeDefs,
  resolvers,
}: {
  typeDefs: string;
  resolvers: Resolvers;
}): ExtendGraphqlSchema {
  return (schema: GraphQLSchema) => mergeSchemas({ schemas: [schema], typeDefs, resolvers });
}
