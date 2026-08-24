import { initGraphQLTada } from 'gql.tada'
import type { introspection } from './tada.generated.ts'

export const graphql = initGraphQLTada<{
  introspection: introspection
}>()
