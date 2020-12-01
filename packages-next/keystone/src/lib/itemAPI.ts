import { GraphQLSchema } from 'graphql';
import {
  BaseGeneratedListTypes,
  BaseKeystoneList,
  KeystoneListsAPI,
  KeystoneContext,
} from '@keystone-next/types';
import { getCoerceAndValidateArgumentsFnForGraphQLField } from './getCoerceAndValidateArgumentsFnForGraphQLField';

export function getArgsFactory(list: BaseKeystoneList, schema: GraphQLSchema) {
  const queryFields = schema.getQueryType()!.getFields();
  const mutationFields = schema.getMutationType()!.getFields();
  const f = getCoerceAndValidateArgumentsFnForGraphQLField;
  return {
    findOne: f(schema, queryFields[list.gqlNames.itemQueryName]),
    findMany: f(schema, queryFields[list.gqlNames.listQueryName]),
    count: f(schema, queryFields[list.gqlNames.listQueryMetaName]),
    createOne: f(schema, mutationFields[list.gqlNames.createMutationName]),
    createMany: f(schema, mutationFields[list.gqlNames.createManyMutationName]),
    updateOne: f(schema, mutationFields[list.gqlNames.updateMutationName]),
    updateMany: f(schema, mutationFields[list.gqlNames.updateManyMutationName]),
    deleteOne: f(schema, mutationFields[list.gqlNames.deleteMutationName]),
    deleteMany: f(schema, mutationFields[list.gqlNames.deleteManyMutationName]),
  };
}

export function itemAPIForList(
  list: BaseKeystoneList,
  context: KeystoneContext,
  schema: GraphQLSchema
): KeystoneListsAPI<Record<string, BaseGeneratedListTypes>>[string] {
  const getArgs = getArgsFactory(list, schema);
  return {
    findOne(rawArgs) {
      const args = getArgs.findOne(rawArgs) as { where: { id: string } };
      return list.itemQuery(args, context);
    },
    findMany(rawArgs) {
      const args = getArgs.findMany(rawArgs);
      return list.listQuery(args, context);
    },
    async count(rawArgs) {
      const args = getArgs.count(rawArgs);
      return (await list.listQueryMeta(args, context)).getCount();
    },
    createOne(rawArgs) {
      const { data } = getArgs.createOne(rawArgs);
      return list.createMutation(data, context);
    },
    createMany(rawArgs) {
      const { data } = getArgs.createMany(rawArgs);
      return list.createManyMutation(data, context);
    },
    updateOne(rawArgs) {
      const { id, data } = getArgs.updateOne(rawArgs);
      return list.updateMutation(id, data, context);
    },
    updateMany(rawArgs) {
      const { data } = getArgs.updateMany(rawArgs);
      return list.updateManyMutation(data, context);
    },
    deleteOne(rawArgs) {
      const { id } = getArgs.deleteOne(rawArgs);
      return list.deleteMutation(id, context);
    },
    deleteMany(rawArgs) {
      const { ids } = getArgs.deleteMany(rawArgs);
      return list.deleteManyMutation(ids, context);
    },
  };
}
