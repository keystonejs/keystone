import type { BaseListTypeInfo } from './type-info'

// this is augmented in gql.tada.ts to add the `fields` method using `gql.tada` types
export interface GraphqlFields<ListsTypeInfo extends Record<string, BaseListTypeInfo>> {}
