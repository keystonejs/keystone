import type { ResultOf, TadaDocumentNode } from 'gql.tada'
import type { BaseListTypeInfo } from './types'

declare module './types/graphql-fields' {
  export interface GraphqlFields<ListsTypeInfo extends Record<string, BaseListTypeInfo>> {
    fields: <Document extends TadaDocumentNode<any, {}, { on: keyof ListsTypeInfo }>>(args: {
      fragment: Document
      source: Document extends TadaDocumentNode<
        any,
        {},
        { on: infer ListKey extends keyof ListsTypeInfo }
      >
        ? ListsTypeInfo[ListKey]['item']
        : never
    }) => Promise<ResultOf<Document>>
  }
}
