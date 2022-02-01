import { GraphQLSchema } from 'graphql';
import {
  BaseListTypeInfo,
  KeystoneDbAPI,
  KeystoneListsAPI,
  KeystoneContext,
  GqlNames,
} from '../../types';
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
): (context: KeystoneContext) => KeystoneDbAPI<Record<string, BaseListTypeInfo>>[string] {
  const f = (operation: 'query' | 'mutation', fieldName: string) => {
    const rootType = operation === 'mutation' ? schema.getMutationType()! : schema.getQueryType()!;
    const field = rootType.getFields()[fieldName];

    if (field === undefined) {
      return (): never => {
        // This will be triggered if the field is missing due to `omit` configuration.
        // The GraphQL equivalent would be a bad user input error.
        throw new Error(`This ${operation} is not supported by the GraphQL schema: ${fieldName}()`);
      };
    }
    return executeGraphQLFieldToRootVal(field);
  };
  const api = {
    findOne: f('query', gqlNames.itemQueryName),
    findMany: f('query', gqlNames.listQueryName),
    count: f('query', gqlNames.listQueryCountName),
    createOne: f('mutation', gqlNames.createMutationName),
    createMany: f('mutation', gqlNames.createManyMutationName),
    updateOne: f('mutation', gqlNames.updateMutationName),
    updateMany: f('mutation', gqlNames.updateManyMutationName),
    deleteOne: f('mutation', gqlNames.deleteMutationName),
    deleteMany: f('mutation', gqlNames.deleteManyMutationName),
  };
  return (context: KeystoneContext) =>
    Object.fromEntries(
      objectEntriesButUsingKeyof(api).map(([key, impl]) => [
        key,
        (args: Record<string, any>) => impl(args, context),
      ])
    ) as Record<keyof typeof api, any>;
}

export function itemAPIForList(
  listKey: string,
  context: KeystoneContext
): KeystoneListsAPI<Record<string, BaseListTypeInfo>>[string] {
  const f = (operation: 'query' | 'mutation', field: string) => {
    const exec = executeGraphQLFieldWithSelection(context.graphql.schema, operation, field);
    return ({ query, ...args }: { query?: string } & Record<string, any> = {}) => {
      const returnFields = query ?? 'id';
      return exec(args, returnFields, context);
    };
  };
  const gqlNames = context.gqlNames(listKey);
  return {
    findOne: f('query', gqlNames.itemQueryName),
    findMany: f('query', gqlNames.listQueryName),
    async count({ where = {} } = {}) {
      const { listQueryCountName, whereInputName } = context.gqlNames(listKey);
      const query = `query ($where: ${whereInputName}!) { count: ${listQueryCountName}(where: $where)  }`;
      const response = await context.graphql.run({ query, variables: { where } });
      return response.count;
    },
    createOne: f('mutation', gqlNames.createMutationName),
    createMany: f('mutation', gqlNames.createManyMutationName),
    updateOne: f('mutation', gqlNames.updateMutationName),
    updateMany: f('mutation', gqlNames.updateManyMutationName),
    deleteOne: f('mutation', gqlNames.deleteMutationName),
    deleteMany: f('mutation', gqlNames.deleteManyMutationName),
  };
}
