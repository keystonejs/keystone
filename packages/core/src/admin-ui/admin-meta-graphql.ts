import type { GraphQLNames, JSONValue } from '../types/utils'
import type { ListMeta, FieldMeta, FieldGroupMeta } from '../types'
import { gql } from './apollo'

export const adminMetaQuery = gql`
  query KsFetchAdminMeta {
    keystone {
      adminMeta {
        lists {
          key

          label
          singular
          plural
          path

          labelField
          fields {
            key

            label
            description

            fieldMeta
            isOrderable
            isFilterable
            viewsIndex
            customViewsIndex

            search
            isNonNull
            createView {
              fieldMode
              isRequired
            }
            itemView {
              fieldMode
              fieldPosition
              isRequired
            }
            listView {
              fieldMode
            }
          }

          groups {
            label
            description
            fields {
              key
            }
          }

          actions {
            key

            label
            icon
            messages {
              promptTitle
              promptTitleMany
              prompt
              promptMany
              promptConfirmLabel
              promptConfirmLabelMany
              fail
              failMany
              success
              successMany
            }
            graphql {
              names {
                one
                many
              }
            }
            itemView {
              actionMode
              navigation
              hidePrompt
              hideToast
            }
            listView {
              actionMode
            }
          }

          graphql {
            names {
              outputTypeName
              whereInputName
              whereUniqueInputName

              createInputName
              createMutationName
              createManyMutationName
              relateToOneForCreateInputName
              relateToManyForCreateInputName

              itemQueryName
              listQueryName
              listQueryCountName
              listOrderName

              updateInputName
              updateMutationName
              updateManyInputName
              updateManyMutationName
              relateToOneForUpdateInputName
              relateToManyForUpdateInputName

              deleteMutationName
              deleteManyMutationName
            }
          }

          pageSize
          initialColumns
          initialSearchFields
          initialSort {
            field
            direction
          }
          initialFilter
          isSingleton

          hideNavigation
          hideCreate
          hideDelete
        }
      }
    }
  }
`

// TODO: duplicate, reference core/src/lib/admin-meta.ts
export type AdminMetaQuery = {
  keystone: {
    adminMeta: {
      lists: (ListMeta & {
        fields: ListMeta['fields'][string][]
        actions: ListMeta['actions']
        groups: (FieldGroupMeta & {
          fields: FieldMeta[]
        })[]
        graphql: {
          names: GraphQLNames
        }

        pageSize: number
        initialColumns: string[]
        initialSearchFields: string[]
        initialSort: ListMeta['initialSort'] | null
        initialFilter: JSONValue
        isSingleton: boolean

        hideNavigation: boolean
        hideCreate: boolean
        hideDelete: boolean
      })[]
    }
  }
}
