import { type GraphQLNamedType, GraphQLSchema } from 'graphql'

import { g } from '../types/schema'
import type { KeystoneConfig } from '../types'
import { KeystoneMeta } from './resolve-admin-meta'
import type { AdminMetaSource } from './create-admin-meta'
import type { InitialisedList } from './core/initialise-lists'

import { getQueriesForList } from './core/queries'
import { getMutationsForList } from './core/mutations'
import { GInputObjectType } from '@graphql-ts/schema'

function getGraphQLSchema(
  lists: Record<string, InitialisedList>,
  extraFields: {
    query: Record<string, g.Field<unknown, any, g.OutputType, string>>
    mutation: Record<string, g.Field<unknown, any, g.OutputType, string>>
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

  const updateManyByList: Record<string, g.InputObjectType<any>> = {}
  const mutation = g.object()({
    name: 'Mutation',
    fields: Object.assign(
      {},
      ...Object.values(lists).map(list => {
        const { mutations, updateManyInput } = getMutationsForList(list)
        updateManyByList[list.listKey] = updateManyInput
        return mutations
      }),
      extraFields.mutation
    ),
  })

  return new GraphQLSchema({
    query: query,
    mutation: mutation,
    // not about behaviour, only ordering
    types: [...collectTypes(lists, updateManyByList), mutation],
    extensions: {
      sudo,
    },
  })
}

function collectTypes(
  lists: Record<string, InitialisedList>,
  updateManyByList: Record<string, g.InputObjectType<any>>
) {
  const collectedTypes: GraphQLNamedType[] = []
  for (const list of Object.values(lists)) {
    const { isEnabled } = list.graphql
    if (!isEnabled.type) continue
    // adding all of these types explicitly isn't strictly necessary but we do it to create a certain order in the schema
    collectedTypes.push(list.graphql.types.output)
    if (isEnabled.query || isEnabled.update || isEnabled.delete) {
      collectedTypes.push(list.graphql.types.uniqueWhere)
    }
    if (isEnabled.query) {
      for (const field of Object.values(list.fields)) {
        if (
          isEnabled.query &&
          field.graphql.isEnabled.read &&
          field.unreferencedConcreteInterfaceImplementations
        ) {
          // this _IS_ actually necessary since they aren't implicitly referenced by other types, unlike the types above
          collectedTypes.push(...field.unreferencedConcreteInterfaceImplementations)
        }
      }
      collectedTypes.push(list.graphql.types.where)
      collectedTypes.push(list.graphql.types.orderBy)
    }
    if (isEnabled.update) {
      if (list.graphql.types.update instanceof GInputObjectType) {
        collectedTypes.push(list.graphql.types.update)
      }
      collectedTypes.push(updateManyByList[list.listKey])
    }
    if (isEnabled.create) {
      if (list.graphql.types.create instanceof GInputObjectType) {
        collectedTypes.push(list.graphql.types.create)
      }
    }
  }
  // this is not necessary, just about ordering
  collectedTypes.push(g.JSON)
  return collectedTypes
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
