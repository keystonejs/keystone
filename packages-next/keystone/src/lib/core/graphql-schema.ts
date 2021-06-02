import { GraphQLNamedType, GraphQLSchema } from 'graphql';
import { DatabaseProvider, types } from '@keystone-next/types';
import { InitialisedList } from './types-for-lists';

import { getMutationsForList } from './mutations';
import { getQueriesForList } from './queries';

export function getGraphQLSchema(
  lists: Record<string, InitialisedList>,
  provider: DatabaseProvider
) {
  let query = types.object()({
    name: 'Query',
    fields: () => Object.assign({}, ...Object.values(lists).map(list => getQueriesForList(list))),
  });

  const createManyByList: Record<string, types.InputObjectType<any>> = {};
  const updateManyByList: Record<string, types.InputObjectType<any>> = {};

  let mutation = types.object()({
    name: 'Mutation',
    fields: Object.assign(
      {},
      ...Object.values(lists).map(list => {
        const { mutations, createManyInput, updateManyInput } = getMutationsForList(list, provider);
        createManyByList[list.listKey] = createManyInput;
        updateManyByList[list.listKey] = updateManyInput;
        return mutations;
      })
    ),
  });
  let graphQLSchema = new GraphQLSchema({
    query: query.graphQLType,
    mutation: mutation.graphQLType,
    types: collectTypes(lists, createManyByList, updateManyByList),
  });
  return graphQLSchema;
}

function collectTypes(
  lists: Record<string, InitialisedList>,
  createManyByList: Record<string, types.InputObjectType<any>>,
  updateManyByList: Record<string, types.InputObjectType<any>>
) {
  const types: GraphQLNamedType[] = [];
  for (const list of Object.values(lists)) {
    // adding all of these types explicitly isn't strictly necessary but we do it to create a certain order in the schema
    if (list.access.read || list.access.create || list.access.update || list.access.delete) {
      types.push(list.types.output.graphQLType);
      types.push(list.types.where.graphQLType);
      types.push(list.types.uniqueWhere.graphQLType);
      types.push(list.types.findManyArgs.sortBy.type.of.of.graphQLType);
      types.push(list.types.orderBy.graphQLType);
    }
    if (list.access.update) {
      types.push(list.types.update.graphQLType);
      types.push(updateManyByList[list.listKey].graphQLType);
    }
    if (list.access.create) {
      types.push(list.types.create.graphQLType);
      types.push(createManyByList[list.listKey].graphQLType);
    }

    for (const field of Object.values(list.fields)) {
      if (
        list.access.read !== false &&
        field.access.read !== false &&
        field.unreferencedConcreteInterfaceImplementations
      ) {
        types.push(...field.unreferencedConcreteInterfaceImplementations.map(x => x.graphQLType));
      }
    }
  }
  return types;
}
