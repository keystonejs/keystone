import { GraphQLSchema } from 'graphql';
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
  getArgs: ReturnType<typeof getArgsFactory>
): KeystoneListsAPI<Record<string, BaseGeneratedListTypes>>[string] {
  const listKey = list.key;
  return {
    findOne({ resolveFields = 'id', ...rawArgs }) {
      const args = getArgs.findOne(rawArgs) as { where: { id: string } };
      if (resolveFields) {
        return getItem({ listKey, context, returnFields: resolveFields, itemId: args.where.id });
      } else {
        return list.itemQuery(args, context);
      }
    },
    findMany({ resolveFields = 'id', ...rawArgs }) {
      const args = getArgs.findMany(rawArgs);
      if (resolveFields) {
        return getItems({ listKey, context, returnFields: resolveFields, ...args });
      } else {
        return list.listQuery(args, context);
      }
    },
    async count(rawArgs) {
      const args = getArgs.count(rawArgs);
      return (await list.listQueryMeta(args, context)).getCount();
    },
    createOne({ resolveFields = 'id', ...rawArgs }) {
      const { data } = getArgs.createOne(rawArgs);
      if (resolveFields) {
        return createItem({ listKey, context, returnFields: resolveFields, item: data });
      } else {
        return list.createMutation(data, context);
      }
    },
    createMany({ resolveFields = 'id', ...rawArgs }) {
      const { data } = getArgs.createMany(rawArgs);
      if (resolveFields) {
        return createItems({ listKey, context, returnFields: resolveFields, items: data });
      } else {
        return list.createManyMutation(data, context);
      }
    },
    updateOne({ resolveFields = 'id', ...rawArgs }) {
      const { id, data } = getArgs.updateOne(rawArgs);
      if (resolveFields) {
        return updateItem({ listKey, context, returnFields: resolveFields, item: { id, data } });
      } else {
        return list.updateMutation(id, data, context);
      }
    },
    updateMany({ resolveFields = 'id', ...rawArgs }) {
      const { data } = getArgs.updateMany(rawArgs);
      if (resolveFields) {
        return updateItems({ listKey, context, returnFields: resolveFields, items: data });
      } else {
        return list.updateManyMutation(data, context);
      }
    },
    deleteOne({ resolveFields = 'id', ...rawArgs }) {
      const { id } = getArgs.deleteOne(rawArgs);
      if (resolveFields) {
        return deleteItem({ listKey, context, returnFields: resolveFields, itemId: id });
      } else {
        return list.deleteMutation(id, context);
      }
    },
    deleteMany({ resolveFields = 'id', ...rawArgs }) {
      const { ids } = getArgs.deleteMany(rawArgs);
      if (resolveFields) {
        return deleteItems({ listKey, context, returnFields: resolveFields, items: ids });
      } else {
        return list.deleteManyMutation(ids, context);
      }
    },
  };
}
