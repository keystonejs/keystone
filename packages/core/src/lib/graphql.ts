import type { GField, GOutputType } from '@graphql-ts/schema'
import {
  type GraphQLNamedType,
  GraphQLSchema,
  assertValidSchema,
  isObjectType,
} from 'graphql/index.js'

import type { KeystoneConfig, KeystoneContext } from '../types/index.ts'
import { g } from '../types/schema/index.ts'
import type { AdminMetaSource } from './admin-meta.ts'
import { KeystoneMeta } from './admin-meta-graphql.ts'
import type { InitialisedList } from './core/initialise-lists.ts'
import { registerItemRequirements } from './core/queries/select.ts'
import { fieldItemRequirements } from '../types/item-field.ts'
import { getMutationsForList } from './core/mutations/index.ts'
import { getQueriesForList } from './core/queries/index.ts'

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
  scope: 'public' | 'internal'
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
      scope,
    },
  })
}

export function createGraphQLSchema(
  config: KeystoneConfig,
  lists: Record<string, InitialisedList>,
  adminMeta: AdminMetaSource | null,
  scope: 'public' | 'internal'
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
    scope
  )

  // merge in the user defined graphQL API
  const schema = config.graphql?.extendGraphqlSchema?.(graphQLSchema) ?? graphQLSchema
  const missing: string[] = []
  for (const list of Object.values(lists)) {
    const outputType = schema.getType(list.graphql.types.output.name)
    if (!isObjectType(outputType)) continue
    for (const [fieldKey, field] of Object.entries(outputType.getFields())) {
      if (registerItemRequirements(fieldItemRequirements(field), list)) continue
      if (!list.prisma.requireItemSelection) continue
      missing.push(`${outputType.name}.${fieldKey}`)
    }
  }
  if (missing.length) {
    throw new Error(
      `db.requireItemSelection needs declared item selections for GraphQL fields ${missing.join(', ')}`
    )
  }
  assertValidSchema(schema)
  return schema
}
