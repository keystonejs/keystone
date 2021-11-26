import type { GraphQLSchema } from 'graphql';
import { mergeSchemas } from '@graphql-tools/schema';

import type {
  BaseFields,
  BaseGeneratedListTypes,
  ExtendGraphqlSchema,
  GraphQLSchemaExtension,
  KeystoneConfig,
  KeystoneGeneratedTypes,
  ListConfig,
} from '../types';

export function config<KSTypes extends KeystoneGeneratedTypes>(config: KeystoneConfig<KSTypes>) {
  return config;
}

export function list<
  Fields extends BaseFields<GeneratedListTypes>,
  GeneratedListTypes extends BaseGeneratedListTypes
>(config: ListConfig<GeneratedListTypes, Fields>): ListConfig<GeneratedListTypes, any> {
  return config;
}

export function gql(strings: TemplateStringsArray) {
  return strings[0];
}

export function graphQLSchemaExtension<KSTypes extends KeystoneGeneratedTypes>({
  typeDefs,
  resolvers,
}: GraphQLSchemaExtension<KSTypes>): ExtendGraphqlSchema {
  return (schema: GraphQLSchema) => mergeSchemas({ schemas: [schema], typeDefs, resolvers });
}
