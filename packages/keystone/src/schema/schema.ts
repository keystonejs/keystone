import type { GraphQLSchema } from 'graphql';
import { mergeSchemas } from '@graphql-tools/schema';

import type {
  BaseFields,
  BaseGeneratedListTypes,
  ExtendGraphqlSchema,
  GraphQLSchemaExtension,
  KeystoneConfig,
  ListConfig,
} from '../types';

export function config(config: KeystoneConfig) {
  return config;
}

export function list<Fields extends BaseFields<BaseGeneratedListTypes>>(
  config: ListConfig<BaseGeneratedListTypes, Fields>
): ListConfig<any, any> {
  return config;
}

export function gql(strings: TemplateStringsArray) {
  return strings[0];
}

export function graphQLSchemaExtension({
  typeDefs,
  resolvers,
}: GraphQLSchemaExtension): ExtendGraphqlSchema {
  return (schema: GraphQLSchema) => mergeSchemas({ schemas: [schema], typeDefs, resolvers });
}
