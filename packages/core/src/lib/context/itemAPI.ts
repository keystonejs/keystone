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

  const fcache = {
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

  return (context: KeystoneContext) => {
    return {
      findOne: (args: Record<string, any>) => fcache.findOne(args, context),
      findMany: (args: Record<string, any>) => fcache.findMany(args, context),
      count: (args: Record<string, any>) => fcache.count(args, context),
      createOne: (args: Record<string, any>) => fcache.createOne(args, context),
      createMany: (args: Record<string, any>) => fcache.createMany(args, context),
      updateOne: (args: Record<string, any>) => fcache.updateOne(args, context),
      updateMany: (args: Record<string, any>) => fcache.updateMany(args, context),
      deleteOne: (args: Record<string, any>) => fcache.deleteOne(args, context),
      deleteMany: (args: Record<string, any>) => fcache.deleteMany(args, context),
    };
  };
}

export function itemAPIForList(
  listKey: string,
  context: KeystoneContext
): KeystoneListsAPI<Record<string, BaseListTypeInfo>>[string] {
  const f = (operation: 'query' | 'mutation', field: string) => {
    const exec = executeGraphQLFieldWithSelection(context.graphql.schema, operation, field);
    return ({ query, ...args }: { query?: string } & Record<string, any> = {}) => {
      const returnFields = query ?? 'id';
      return exec(args, returnFields, context) as any;
    };
  };
  const gqlNames = context.gqlNames(listKey);
  return {
    findOne: f('query', gqlNames.itemQueryName),
    findMany: f('query', gqlNames.listQueryName),
    async count({ where = {} } = {}) {
      const { listQueryCountName, whereInputName } = context.gqlNames(listKey);
      const query = `query ($where: ${whereInputName}!) { count: ${listQueryCountName}(where: $where)  }`;
      const response = (await context.graphql.run({ query, variables: { where } })) as {
        count: number;
      };
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
