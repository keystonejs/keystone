import { GraphQLNamedType, GraphQLSchema } from 'graphql';
import { DatabaseProvider, graphql } from '../../types';
import { InitialisedList } from './types-for-lists';

import { getMutationsForList } from './mutations';
import { getQueriesForList } from './queries';

export function getGraphQLSchema(
  lists: Record<string, InitialisedList>,
  provider: DatabaseProvider
) {
  const query = graphql.object()({
    name: 'Query',
    fields: Object.assign({}, ...Object.values(lists).map(list => getQueriesForList(list))),
  });

  const updateManyByList: Record<string, graphql.InputObjectType<any>> = {};

  const mutation = graphql.object()({
    name: 'Mutation',
    fields: Object.assign(
      {},
      ...Object.values(lists).map(list => {
        const { mutations, updateManyInput } = getMutationsForList(list, provider);
        updateManyByList[list.listKey] = updateManyInput;
        return mutations;
      })
    ),
  });
  const graphQLSchema = new GraphQLSchema({
    query: query.graphQLType,
    mutation: mutation.graphQLType,
    types: collectTypes(lists, updateManyByList),
  });
  return graphQLSchema;
}

function collectTypes(
  lists: Record<string, InitialisedList>,
  updateManyByList: Record<string, graphql.InputObjectType<any>>
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
      collectedTypes.push(list.types.orderBy.graphQLType);
    }
    if (list.access.update) {
      collectedTypes.push(list.types.update.graphQLType);
      collectedTypes.push(updateManyByList[list.listKey].graphQLType);
    }
    if (list.access.create) {
      collectedTypes.push(list.types.create.graphQLType);
    }
  }
  // this is not necessary, just about ordering
  collectedTypes.push(graphql.JSON.graphQLType);
  return collectedTypes;
}
