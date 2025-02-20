import type { TadaDocumentNode } from 'gql.tada'

declare module './types/query-fields-base.js' {
  interface ResolveFieldsQueryOptions<Result, ListKey extends string> {
    tada: TadaDocumentNode<Result, any, { on: ListKey }>
  }
}

export {}
