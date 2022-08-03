import { GraphQLNamedType, GraphQLSchema } from 'graphql';
import { graphql } from '../..';
import { InitialisedModel } from './types-for-lists';

import { getMutationsForModel } from './mutations';
import { getQueriesForModel } from './queries';

export function getGraphQLSchema(
  models: Record<string, InitialisedModel>,
  extraFields: {
    mutation: Record<string, graphql.Field<unknown, any, graphql.OutputType, string>>;
    query: Record<string, graphql.Field<unknown, any, graphql.OutputType, string>>;
  }
) {
  const query = graphql.object()({
    name: 'Query',
    fields: Object.assign(
      {},
      ...Object.values(models).map(model => getQueriesForModel(model)),
      extraFields.query
    ),
  });

  const updateManyByModel: Record<string, graphql.InputObjectType<any>> = {};

  const mutation = graphql.object()({
    name: 'Mutation',
    fields: Object.assign(
      {},
      ...Object.values(models).map(model => {
        const { mutations, updateManyInput } = getMutationsForModel(model);
        updateManyByModel[model.modelKey] = updateManyInput;
        return mutations;
      }),
      extraFields.mutation
    ),
  });
  const graphQLSchema = new GraphQLSchema({
    query: query.graphQLType,
    mutation: mutation.graphQLType,
    // not about behaviour, only ordering
    types: [...collectTypes(models, updateManyByModel), mutation.graphQLType],
  });
  return graphQLSchema;
}

function collectTypes(
  models: Record<string, InitialisedModel>,
  updateManyByModel: Record<string, graphql.InputObjectType<any>>
) {
  const collectedTypes: GraphQLNamedType[] = [];
  for (const model of Object.values(models)) {
    const { isEnabled } = model.graphql;
    if (!isEnabled.type) continue;
    // adding all of these types explicitly isn't strictly necessary but we do it to create a certain order in the schema
    collectedTypes.push(model.types.output.graphQLType);
    if (isEnabled.query || isEnabled.update || isEnabled.delete) {
      collectedTypes.push(model.types.uniqueWhere.graphQLType);
    }
    if (isEnabled.query) {
      for (const field of Object.values(model.fields)) {
        if (
          isEnabled.query &&
          field.graphql.isEnabled.read &&
          field.unreferencedConcreteInterfaceImplementations
        ) {
          // this _IS_ actually necessary since they aren't implicitly referenced by other types, unlike the types above
          collectedTypes.push(
            ...field.unreferencedConcreteInterfaceImplementations.map(x => x.graphQLType)
          );
        }
      }
      collectedTypes.push(model.types.where.graphQLType);
      collectedTypes.push(model.types.orderBy.graphQLType);
    }
    if (isEnabled.update) {
      collectedTypes.push(model.types.update.graphQLType);
      collectedTypes.push(updateManyByModel[model.modelKey].graphQLType);
    }
    if (isEnabled.create) {
      collectedTypes.push(model.types.create.graphQLType);
    }
  }
  // this is not necessary, just about ordering
  collectedTypes.push(graphql.JSON.graphQLType);
  return collectedTypes;
}
