import { GraphQLSchema } from 'graphql';
import type { InitialisedList } from '../core/types-for-lists';
import { BaseListTypeInfo, KeystoneDbAPI, KeystoneListsAPI, KeystoneContext } from '../../types';
import { executeGraphQLFieldToRootVal } from './executeGraphQLFieldToRootVal';
import { executeGraphQLFieldWithSelection } from './executeGraphQLFieldWithSelection';

export function getDbAPIFactory(
  list: InitialisedList,
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
    findOne: f('query', list.graphql.names.itemQueryName),
    findMany: f('query', list.graphql.names.listQueryName),
    count: f('query', list.graphql.names.listQueryCountName),
    createOne: f('mutation', list.graphql.names.createMutationName),
    createMany: f('mutation', list.graphql.names.createManyMutationName),
    updateOne: f('mutation', list.graphql.names.updateMutationName),
    updateMany: f('mutation', list.graphql.names.updateManyMutationName),
    deleteOne: f('mutation', list.graphql.names.deleteMutationName),
    deleteMany: f('mutation', list.graphql.names.deleteManyMutationName),
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
  list: InitialisedList,
  context: KeystoneContext
): KeystoneListsAPI<Record<string, BaseListTypeInfo>>[string] {
  const f = (operation: 'query' | 'mutation', field: string) => {
    const exec = executeGraphQLFieldWithSelection(context.graphql.schema, operation, field);
    return ({ query, ...args }: { query?: string } & Record<string, any> = {}) => {
      const returnFields = query ?? 'id';
      return exec(args, returnFields, context) as any;
    };
  };

  return {
    findOne: f('query', list.graphql.names.itemQueryName),
    findMany: f('query', list.graphql.names.listQueryName),
    async count({ where = {} } = {}) {
      const { listQueryCountName, whereInputName } = list.graphql.names;
      const query = `query ($where: ${whereInputName}!) { count: ${listQueryCountName}(where: $where)  }`;
      const response = (await context.graphql.run({ query, variables: { where } })) as {
        count: number;
      };
      return response.count;
    },
    createOne: f('mutation', list.graphql.names.createMutationName),
    createMany: f('mutation', list.graphql.names.createManyMutationName),
    updateOne: f('mutation', list.graphql.names.updateMutationName),
    updateMany: f('mutation', list.graphql.names.updateManyMutationName),
    deleteOne: f('mutation', list.graphql.names.deleteMutationName),
    deleteMany: f('mutation', list.graphql.names.deleteManyMutationName),
  };
}
