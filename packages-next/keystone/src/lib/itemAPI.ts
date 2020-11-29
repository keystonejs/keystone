import { GraphQLSchema } from 'graphql';
import {
  BaseGeneratedListTypes,
  BaseKeystoneList,
  KeystoneContext,
  KeystoneListsAPI,
} from '@keystone-next/types';
import {
  getItem,
  getItems,
  createItem,
  createItems,
  updateItem,
  updateItems,
  deleteItem,
  deleteItems,
  // @ts-ignore
} from '@keystonejs/server-side-graphql-client';

import { getCoerceAndValidateArgumentsFnForGraphQLField } from './getCoerceAndValidateArgumentsFnForGraphQLField';

export function itemAPIConstructorForList(
  list: BaseKeystoneList,
  schema: GraphQLSchema
): (context: KeystoneContext) => KeystoneListsAPI<Record<string, BaseGeneratedListTypes>>[string] {
  const queryFields = schema.getQueryType()!.getFields();
  const mutationFields = schema.getMutationType()!.getFields();

  const getArgsForFindOne = getCoerceAndValidateArgumentsFnForGraphQLField(
    schema,
    queryFields[list.gqlNames.itemQueryName]
  );

  const getArgsForFindMany = getCoerceAndValidateArgumentsFnForGraphQLField(
    schema,
    queryFields[list.gqlNames.listQueryName]
  );

  const getArgsForMeta = getCoerceAndValidateArgumentsFnForGraphQLField(
    schema,
    queryFields[list.gqlNames.listQueryMetaName]
  );

  const getArgsForCreateOne = getCoerceAndValidateArgumentsFnForGraphQLField(
    schema,
    mutationFields[list.gqlNames.createMutationName]
  );

  const getArgsForCreateMany = getCoerceAndValidateArgumentsFnForGraphQLField(
    schema,
    mutationFields[list.gqlNames.createManyMutationName]
  );

  const getArgsForUpdateOne = getCoerceAndValidateArgumentsFnForGraphQLField(
    schema,
    mutationFields[list.gqlNames.updateMutationName]
  );

  const getArgsForUpdateMany = getCoerceAndValidateArgumentsFnForGraphQLField(
    schema,
    mutationFields[list.gqlNames.updateManyMutationName]
  );

  const getArgsForDeleteOne = getCoerceAndValidateArgumentsFnForGraphQLField(
    schema,
    mutationFields[list.gqlNames.deleteMutationName]
  );

  const getArgsForDeleteMany = getCoerceAndValidateArgumentsFnForGraphQLField(
    schema,
    mutationFields[list.gqlNames.deleteManyMutationName]
  );

  return context => ({
    findOne({ resolveFields, ...rawArgs }) {
      if (resolveFields) {
        return getItem({
          returnFields: resolveFields,
          listKey: list.key,
          itemId: rawArgs.where.id,
          context,
        });
      }
      const args = getArgsForFindOne(rawArgs);
      return list.itemQuery(args as any, context);
    },
    findMany({ resolveFields, ...rawArgs }) {
      const args = getArgsForFindMany(rawArgs);
      return list.listQuery(args, context);
    },
    async count({ resolveFields, ...rawArgs }) {
      const args = getArgsForMeta(rawArgs);
      return (await list.listQueryMeta(args, context)).getCount();
    },
    createOne({ resolveFields, ...rawArgs }) {
      const { data } = getArgsForCreateOne(rawArgs);
      return list.createMutation(data, context);
    },
    createMany({ resolveFields, ...rawArgs }) {
      const { data } = getArgsForCreateMany(rawArgs);
      return list.createManyMutation(data, context);
    },
    updateOne({ resolveFields, ...rawArgs }) {
      const { id, data } = getArgsForUpdateOne(rawArgs);
      return list.updateMutation(id, data, context);
    },
    updateMany({ resolveFields, ...rawArgs }) {
      const { data } = getArgsForUpdateMany(rawArgs);
      return list.updateManyMutation(data, context);
    },
    deleteOne({ resolveFields, ...rawArgs }) {
      const { id } = getArgsForDeleteOne(rawArgs);
      return list.deleteMutation(id, context);
    },
    deleteMany({ resolveFields, ...rawArgs }) {
      const { ids } = getArgsForDeleteMany(rawArgs);
      return list.deleteManyMutation(ids, context);
    },
  });
}
