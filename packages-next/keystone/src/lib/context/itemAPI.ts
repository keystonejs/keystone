import { GraphQLSchema, GraphQLField } from 'graphql';
import {
  BaseGeneratedListTypes,
  KeystoneDbAPI,
  KeystoneListsAPI,
  KeystoneContext,
  GqlNames,
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
} from './server-side-graphql-client';
import { runGraphQLFieldButGetRootValFactory } from './executeGraphQLFieldToRootVal';

// this is generally incorrect because types are open in TS but is correct in the specific usage here.
// (i mean it's not really any more incorrect than TS is generally is but let's ignore that)
const objectEntriesButUsingKeyof: <T extends Record<string, any>>(
  obj: T
) => [keyof T, T[keyof T]][] = Object.entries as any;

export function getDbAPIFactory(
  gqlNames: GqlNames,
  schema: GraphQLSchema
): (context: KeystoneContext) => KeystoneDbAPI<Record<string, BaseGeneratedListTypes>>[string] {
  const queryFields = schema.getQueryType()!.getFields();
  const mutationFields = schema.getMutationType()!.getFields();
  const f = (field: GraphQLField<any, any> | undefined) => {
    if (field === undefined) {
      return (): never => {
        throw new Error('You do not have access to this resource');
      };
    }
    return runGraphQLFieldButGetRootValFactory(field);
  };
  const api = {
    findOne: f(queryFields[gqlNames.itemQueryName]),
    findMany: f(queryFields[gqlNames.listQueryName]),
    count: f(queryFields[gqlNames.listQueryMetaName]),
    createOne: f(mutationFields[gqlNames.createMutationName]),
    createMany: f(mutationFields[gqlNames.createManyMutationName]),
    updateOne: f(mutationFields[gqlNames.updateMutationName]),
    updateMany: f(mutationFields[gqlNames.updateManyMutationName]),
    deleteOne: f(mutationFields[gqlNames.deleteMutationName]),
    deleteMany: f(mutationFields[gqlNames.deleteManyMutationName]),
  };
  return (context: KeystoneContext) => {
    let obj = Object.fromEntries(
      objectEntriesButUsingKeyof(api).map(([key, impl]) => [
        key,
        (args: Record<string, any>) => impl(args, context),
      ])
    );
    obj.count = async (args: Record<string, any>) => (await api.count(args, context)).getCount();
    return obj;
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
  listKey: string,
  context: KeystoneContext,
  dbAPI: KeystoneDbAPI<Record<string, BaseGeneratedListTypes>>[string]
): KeystoneListsAPI<Record<string, BaseGeneratedListTypes>>[string] {
  return {
    findOne({ query, resolveFields, ...args }) {
      const returnFields = defaultQueryParam(query, resolveFields);
      if (returnFields) {
        return getItem({ listKey, context, returnFields, itemId: args.where.id });
      } else {
        return dbAPI.findOne(args);
      }
    },
    findMany({ query, resolveFields, ...args } = {}) {
      const returnFields = defaultQueryParam(query, resolveFields);
      if (returnFields) {
        return getItems({ listKey, context, returnFields, ...args });
      } else {
        return dbAPI.findMany(args);
      }
    },
    async count(args = {}) {
      const { first, skip, where } = args;
      const { listQueryMetaName, whereInputName } = context.gqlNames(listKey);
      const query = `query ($first: Int, $skip: Int, $where: ${whereInputName}) { ${listQueryMetaName}(first: $first, skip: $skip, where: $where) { count }  }`;
      const response = await context.graphql.run({ query, variables: { first, skip, where } });
      return response[listQueryMetaName].count;
    },
    createOne({ query, resolveFields, ...args }) {
      const returnFields = defaultQueryParam(query, resolveFields);
      if (returnFields) {
        const { data } = args;
        return createItem({ listKey, context, returnFields, item: data });
      } else {
        return dbAPI.createOne(args);
      }
    },
    createMany({ query, resolveFields, ...args }) {
      const returnFields = defaultQueryParam(query, resolveFields);
      if (returnFields) {
        const { data } = args;
        return createItems({ listKey, context, returnFields, items: data });
      } else {
        return dbAPI.createMany(args);
      }
    },
    updateOne({ query, resolveFields, ...args }) {
      const returnFields = defaultQueryParam(query, resolveFields);
      if (returnFields) {
        const { id, data } = args;
        return updateItem({ listKey, context, returnFields, item: { id, data } });
      } else {
        return dbAPI.updateOne(args);
      }
    },
    updateMany({ query, resolveFields, ...args }) {
      const returnFields = defaultQueryParam(query, resolveFields);
      if (returnFields) {
        const { data } = args;
        return updateItems({ listKey, context, returnFields, items: data });
      } else {
        return dbAPI.updateMany(args);
      }
    },
    deleteOne({ query, resolveFields, ...args }) {
      const returnFields = defaultQueryParam(query, resolveFields);
      if (returnFields) {
        const { id } = args;
        return deleteItem({ listKey, context, returnFields, itemId: id });
      } else {
        return dbAPI.deleteOne(args);
      }
    },
    deleteMany({ query, resolveFields, ...args }) {
      const returnFields = defaultQueryParam(query, resolveFields);
      if (returnFields) {
        const { ids } = args;
        return deleteItems({ listKey, context, returnFields, items: ids });
      } else {
        return dbAPI.deleteMany(args);
      }
    },
  };
}
