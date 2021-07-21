import { GraphQLSchema, GraphQLField } from 'graphql';
import {
  BaseGeneratedListTypes,
  KeystoneDbAPI,
  KeystoneListsAPI,
  KeystoneContext,
  GqlNames,
} from '@keystone-next/types';
import { executeGraphQLFieldToRootVal } from './executeGraphQLFieldToRootVal';
import { executeGraphQLFieldWithSelection } from './executeGraphQLFieldWithSelection';

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
    return executeGraphQLFieldToRootVal(field);
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
  const f = (
    operation: 'query' | 'mutation',
    field: string,
    dbAPIVersionOfAPI: (args: any) => Promise<any>
  ) => {
    const exec = executeGraphQLFieldWithSelection(context.graphql.schema, operation, field);
    return ({
      query,
      resolveFields,
      ...args
    }: { resolveFields?: false | string; query?: string } & Record<string, any>) => {
      const returnFields = defaultQueryParam(query, resolveFields);
      if (returnFields) {
        return exec(args, returnFields, context);
      } else {
        return dbAPIVersionOfAPI(args);
      }
    };
  };
  const gqlNames = context.gqlNames(listKey);
  return {
    findOne: f('query', gqlNames.itemQueryName, dbAPI.findOne),
    findMany: f('query', gqlNames.listQueryName, dbAPI.findMany),
    async count(args = {}) {
      const { first, skip = 0, where = {} } = args;
      const { listQueryMetaName, whereInputName } = context.gqlNames(listKey);
      const query = `query ($first: Int, $skip: Int! = 0, $where: ${whereInputName}! = {}) { ${listQueryMetaName}(first: $first, skip: $skip, where: $where) { count }  }`;
      const response = await context.graphql.run({ query, variables: { first, skip, where } });
      return response[listQueryMetaName].count;
    },
    createOne: f('mutation', gqlNames.createMutationName, dbAPI.createOne),
    createMany: f('mutation', gqlNames.createManyMutationName, dbAPI.createMany),
    updateOne: f('mutation', gqlNames.updateMutationName, dbAPI.updateOne),
    updateMany: f('mutation', gqlNames.updateManyMutationName, dbAPI.updateMany),
    deleteOne: f('mutation', gqlNames.deleteMutationName, dbAPI.deleteOne),
    deleteMany: f('mutation', gqlNames.deleteManyMutationName, dbAPI.deleteMany),
  };
}
