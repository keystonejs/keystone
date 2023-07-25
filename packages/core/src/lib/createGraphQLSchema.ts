import { GraphQLNamedType, GraphQLSchema } from 'graphql';

import type { KeystoneConfig } from '../types';
import { KeystoneMeta } from '../admin-ui/system/adminMetaSchema';
import { graphql } from '../types/schema';
import { AdminMetaRootVal } from '../admin-ui/system/createAdminMeta';
import { InitialisedList } from './core/types-for-lists';

import { getMutationsForList } from './core/mutations';
import { getQueriesForList } from './core/queries';

function getGraphQLSchema(
  lists: Record<string, InitialisedList>,
  extraFields: {
    mutation: Record<string, graphql.Field<unknown, any, graphql.OutputType, string>>;
    query: Record<string, graphql.Field<unknown, any, graphql.OutputType, string>>;
  },
  sudo: boolean
) {
  const query = graphql.object()({
    name: 'Query',
    fields: Object.assign(
      {},
      ...Object.values(lists).map(list => getQueriesForList(list)),
      extraFields.query
    ),
  });

  const updateManyByList: Record<string, graphql.InputObjectType<any>> = {};

  const mutation = graphql.object()({
    name: 'Mutation',
    fields: Object.assign(
      {},
      ...Object.values(lists).map(list => {
        const { mutations, updateManyInput } = getMutationsForList(list);
        updateManyByList[list.listKey] = updateManyInput;
        return mutations;
      }),
      extraFields.mutation
    ),
  });

  return new GraphQLSchema({
    query: query.graphQLType,
    mutation: mutation.graphQLType,
    // not about behaviour, only ordering
    types: [...collectTypes(lists, updateManyByList), mutation.graphQLType],
    extensions: {
      sudo,
    },
  });
}

function collectTypes(
  lists: Record<string, InitialisedList>,
  updateManyByList: Record<string, graphql.InputObjectType<any>>
) {
  const collectedTypes: GraphQLNamedType[] = [];
  for (const list of Object.values(lists)) {
    const { isEnabled } = list.graphql;
    if (!isEnabled.type) continue;
    // adding all of these types explicitly isn't strictly necessary but we do it to create a certain order in the schema
    collectedTypes.push(list.graphql.types.output.graphQLType);
    if (isEnabled.query || isEnabled.update || isEnabled.delete) {
      collectedTypes.push(list.graphql.types.uniqueWhere.graphQLType);
    }
    if (isEnabled.query) {
      for (const field of Object.values(list.fields)) {
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
      collectedTypes.push(list.graphql.types.where.graphQLType);
      collectedTypes.push(list.graphql.types.orderBy.graphQLType);
    }
    if (isEnabled.update) {
      collectedTypes.push(list.graphql.types.update.graphQLType);
      collectedTypes.push(updateManyByList[list.listKey].graphQLType);
    }
    if (isEnabled.create) {
      collectedTypes.push(list.graphql.types.create.graphQLType);
    }
  }
  // this is not necessary, just about ordering
  collectedTypes.push(graphql.JSON.graphQLType);
  return collectedTypes;
}

export function createGraphQLSchema(
  config: KeystoneConfig,
  lists: Record<string, InitialisedList>,
  adminMeta: AdminMetaRootVal | null,
  sudo: boolean
) {
  const graphQLSchema = getGraphQLSchema(
    lists,
    {
      mutation: config.session
        ? {
            endSession: graphql.field({
              type: graphql.nonNull(graphql.Boolean),
              async resolve(rootVal, args, context) {
                if (context.sessionStrategy) {
                  await context.sessionStrategy.end({ context });
                }
                return true;
              },
            }),
          }
        : {},
      query: adminMeta ? {
        keystone: graphql.field({
          type: graphql.nonNull(KeystoneMeta),
          resolve: () => ({ adminMeta }),
        }),
      } : {},
    },
    sudo
  );

  // merge in the user defined graphQL API
  if (config.extendGraphqlSchema) {
    return config.extendGraphqlSchema(graphQLSchema);
  }

  return graphQLSchema;
}
