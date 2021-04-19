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
} from '@keystone-next/server-side-graphql-client-legacy';
import {
  BaseGeneratedListTypes,
  BaseKeystoneList,
  KeystoneDbAPI,
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

function defaultQueryParam(query?: string, resolveFields?: string | false) {
  if (query !== undefined && resolveFields !== undefined) {
    throw new Error('query and resolveFields cannot both be passed to an Items API query');
  }
  if (query !== undefined) return query;
  if (resolveFields !== undefined) return resolveFields;
  return 'id';
}

/* NOTE
 *
 * The `resolveFields` param has been deprecated in favor of `query` (when selecting fields to
 * query) or the new dbAPI which is available via `context.db.lists.{List}`, which replaces
 * the previous `resolveFields: false` behaviour.
 *
 * We'll be removing the option to use `resolveFields` entirely in a future release.
 */
export function itemAPIForList(
  list: BaseKeystoneList,
  context: KeystoneContext,
  getArgs: ReturnType<typeof getArgsFactory>
): KeystoneListsAPI<Record<string, BaseGeneratedListTypes>>[string] {
  const listKey = list.key;
  return {
    findOne({ query, resolveFields, ...rawArgs }) {
      if (!getArgs.findOne) throw new Error('You do not have access to this resource');
      const args = getArgs.findOne(rawArgs) as { where: { id: string } };
      const returnFields = defaultQueryParam(query, resolveFields);
      if (returnFields) {
        return getItem({ listKey, context, returnFields, itemId: args.where.id });
      } else {
        return list.itemQuery(args, context);
      }
    },
    findMany({ query, resolveFields, ...rawArgs }) {
      if (!getArgs.findMany) throw new Error('You do not have access to this resource');
      const args = getArgs.findMany(rawArgs);
      const returnFields = defaultQueryParam(query, resolveFields);
      if (returnFields) {
        return getItems({ listKey, context, returnFields, ...args });
      } else {
        return list.listQuery(args, context);
      }
    },
    async count(rawArgs) {
      if (!getArgs.count) throw new Error('You do not have access to this resource');
      const args = getArgs.count(rawArgs!);
      return (await list.listQueryMeta(args, context)).getCount();
    },
    createOne({ query, resolveFields, ...rawArgs }) {
      if (!getArgs.createOne) throw new Error('You do not have access to this resource');
      const { data } = getArgs.createOne(rawArgs);
      const returnFields = defaultQueryParam(query, resolveFields);
      if (returnFields) {
        return createItem({ listKey, context, returnFields, item: data });
      } else {
        return list.createMutation(data, context);
      }
    },
    createMany({ query, resolveFields, ...rawArgs }) {
      if (!getArgs.createMany) throw new Error('You do not have access to this resource');
      const { data } = getArgs.createMany(rawArgs);
      const returnFields = defaultQueryParam(query, resolveFields);
      if (returnFields) {
        return createItems({ listKey, context, returnFields, items: data });
      } else {
        return list.createManyMutation(data, context);
      }
    },
    updateOne({ query, resolveFields, ...rawArgs }) {
      if (!getArgs.updateOne) throw new Error('You do not have access to this resource');
      const { id, data } = getArgs.updateOne(rawArgs);
      const returnFields = defaultQueryParam(query, resolveFields);
      if (returnFields) {
        return updateItem({ listKey, context, returnFields, item: { id, data } });
      } else {
        return list.updateMutation(id, data, context);
      }
    },
    updateMany({ query, resolveFields, ...rawArgs }) {
      if (!getArgs.updateMany) throw new Error('You do not have access to this resource');
      const { data } = getArgs.updateMany(rawArgs);
      const returnFields = defaultQueryParam(query, resolveFields);
      if (returnFields) {
        return updateItems({ listKey, context, returnFields, items: data });
      } else {
        return list.updateManyMutation(data, context);
      }
    },
    deleteOne({ query, resolveFields, ...rawArgs }) {
      if (!getArgs.deleteOne) throw new Error('You do not have access to this resource');
      const { id } = getArgs.deleteOne(rawArgs);
      const returnFields = defaultQueryParam(query, resolveFields);
      if (returnFields) {
        return deleteItem({ listKey, context, returnFields, itemId: id });
      } else {
        return list.deleteMutation(id, context);
      }
    },
    deleteMany({ query, resolveFields, ...rawArgs }) {
      if (!getArgs.deleteMany) throw new Error('You do not have access to this resource');
      const { ids } = getArgs.deleteMany(rawArgs);
      const returnFields = defaultQueryParam(query, resolveFields);
      if (returnFields) {
        return deleteItems({ listKey, context, returnFields, items: ids });
      } else {
        return list.deleteManyMutation(ids, context);
      }
    },
  };
}

export function itemDbAPIForList(
  list: BaseKeystoneList,
  context: KeystoneContext,
  getArgs: ReturnType<typeof getArgsFactory>
): KeystoneDbAPI<Record<string, BaseGeneratedListTypes>>[string] {
  return {
    findOne(rawArgs) {
      if (!getArgs.findOne) throw new Error('You do not have access to this resource');
      const args = getArgs.findOne(rawArgs) as { where: { id: string } };
      return list.itemQuery(args, context);
    },
    findMany(rawArgs) {
      if (!getArgs.findMany) throw new Error('You do not have access to this resource');
      const args = getArgs.findMany(rawArgs);
      return list.listQuery(args, context);
    },
    async count(rawArgs) {
      if (!getArgs.count) throw new Error('You do not have access to this resource');
      const args = getArgs.count(rawArgs!);
      return (await list.listQueryMeta(args, context)).getCount();
    },
    createOne(rawArgs) {
      if (!getArgs.createOne) throw new Error('You do not have access to this resource');
      const { data } = getArgs.createOne(rawArgs);
      return list.createMutation(data, context);
    },
    createMany(rawArgs) {
      if (!getArgs.createMany) throw new Error('You do not have access to this resource');
      const { data } = getArgs.createMany(rawArgs);
      return list.createManyMutation(data, context);
    },
    updateOne(rawArgs) {
      if (!getArgs.updateOne) throw new Error('You do not have access to this resource');
      const { id, data } = getArgs.updateOne(rawArgs);
      return list.updateMutation(id, data, context);
    },
    updateMany(rawArgs) {
      if (!getArgs.updateMany) throw new Error('You do not have access to this resource');
      const { data } = getArgs.updateMany(rawArgs);
      return list.updateManyMutation(data, context);
    },
    deleteOne(rawArgs) {
      if (!getArgs.deleteOne) throw new Error('You do not have access to this resource');
      const { id } = getArgs.deleteOne(rawArgs);
      return list.deleteMutation(id, context);
    },
    deleteMany(rawArgs) {
      if (!getArgs.deleteMany) throw new Error('You do not have access to this resource');
      const { ids } = getArgs.deleteMany(rawArgs);
      return list.deleteManyMutation(ids, context);
    },
  };
}
