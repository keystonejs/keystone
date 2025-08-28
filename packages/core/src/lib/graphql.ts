import type { GField, GOutputType } from '@graphql-ts/schema'
import { type GraphQLNamedType, GraphQLSchema } from 'graphql'

import type { KeystoneConfig, KeystoneContext } from '../types'
import { g } from '../types/schema'
import type { AdminMetaSource } from './admin-meta'
import { KeystoneMeta } from './admin-meta-graphql'
import type { InitialisedList } from './core/initialise-lists'
import { getMutationsForList } from './core/mutations'
import { getQueriesForList } from './core/queries'

function getGraphQLSchema(
  lists: Record<string, InitialisedList>,
  extraFields: {
    query: Record<
      string,
      GField<unknown, any, GOutputType<KeystoneContext>, unknown, KeystoneContext>
    >
    mutation: Record<
      string,
      GField<unknown, any, GOutputType<KeystoneContext>, unknown, KeystoneContext>
    >
  },
  sudo: boolean
) {
  const query = g.object()({
    name: 'Query',
    fields: Object.assign(
      {},
      ...Object.values(lists).map(list => getQueriesForList(list)),
      extraFields.query
    ),
  })

  const collectedTypes: GraphQLNamedType[] = []
  const mutation = g.object()({
    name: 'Mutation',
    fields: Object.assign(
      {},
      ...Object.values(lists).map(list => {
        const { mutations, types } = getMutationsForList(list)
        collectedTypes.push(...types)
        return mutations
      }),
      extraFields.mutation
    ),
  })

  return new GraphQLSchema({
    query,
    mutation,
    types: [...collectedTypes, g.JSON, mutation],
    extensions: {
      sudo,
    },
  })
}

export function createGraphQLSchema(
  config: KeystoneConfig,
  lists: Record<string, InitialisedList>,
  adminMeta: AdminMetaSource | null,
  sudo: boolean
) {
  const graphQLSchema = getGraphQLSchema(
    lists,
    {
      mutation: {},
      query: adminMeta
        ? {
            keystone: g.field({
              type: g.nonNull(KeystoneMeta),
              resolve: () => ({ adminMeta }),
            }),
          }
        : {},
    },
    sudo
  )

  // merge in the user defined graphQL API
  return config.graphql?.extendGraphqlSchema?.(graphQLSchema) ?? graphQLSchema
}
