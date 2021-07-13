import { GraphQLNamedType, GraphQLSchema } from 'graphql';
import { DatabaseProvider, schema } from '@keystone-next/types';
import { InitialisedList } from './types-for-lists';

import { getMutationsForList } from './mutations';
import { getQueriesForList } from './queries';

export function getGraphQLSchema(
  lists: Record<string, InitialisedList>,
  provider: DatabaseProvider
) {
  const query = schema.object()({
    name: 'Query',
    fields: Object.assign({}, ...Object.values(lists).map(list => getQueriesForList(list))),
  });

  const createManyByList: Record<string, schema.InputObjectType<any>> = {};
  const updateManyByList: Record<string, schema.InputObjectType<any>> = {};

  const mutation = schema.object()({
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
  const graphQLSchema = new GraphQLSchema({
    query: query.graphQLType,
    mutation: mutation.graphQLType,
    types: collectTypes(lists, createManyByList, updateManyByList),
  });
  return graphQLSchema;
}

function collectTypes(
  lists: Record<string, InitialisedList>,
  createManyByList: Record<string, schema.InputObjectType<any>>,
  updateManyByList: Record<string, schema.InputObjectType<any>>
) {
  const collectedTypes: GraphQLNamedType[] = [];
  for (const list of Object.values(lists)) {
    // adding all of these types explicitly isn't strictly necessary but we do it to create a certain order in the schema
    if (list.access.read || list.access.create || list.access.update || list.access.delete) {
      collectedTypes.push(list.types.output.graphQLType);
      for (const field of Object.values(list.fields)) {
        if (
          list.access.read !== false &&
          field.access.read !== false &&
          field.unreferencedConcreteInterfaceImplementations
        ) {
          // this _IS_ actually necessary since they aren't implicitly referenced by other types, unlike the types above
          collectedTypes.push(
            ...field.unreferencedConcreteInterfaceImplementations.map(x => x.graphQLType)
          );
        }
      }
      collectedTypes.push(list.types.where.graphQLType);
      collectedTypes.push(list.types.uniqueWhere.graphQLType);
      collectedTypes.push(list.types.findManyArgs.sortBy.type.of.of.graphQLType);
      collectedTypes.push(list.types.orderBy.graphQLType);
    }
    if (list.access.update) {
      collectedTypes.push(list.types.update.graphQLType);
      collectedTypes.push(updateManyByList[list.listKey].graphQLType);
    }
    if (list.access.create) {
      collectedTypes.push(list.types.create.graphQLType);
      collectedTypes.push(createManyByList[list.listKey].graphQLType);
    }
  }
  // this is not necessary, just about ordering
  collectedTypes.push(schema.JSON.graphQLType);
  return collectedTypes;
}
