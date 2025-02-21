import type { GraphQLNames } from '../types/utils'
import type { ListMeta, FieldMeta, FieldGroupMeta } from '../types'
import { gql } from './apollo'

export const adminMetaQuery = gql`
  query KsFetchAdminMeta {
    keystone {
      adminMeta {
        lists {
          key
          path
          description

          label
          labelField
          singular
          plural

          fields {
            path
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
            }
            itemView {
              fieldMode
              fieldPosition
            }
            listView {
              fieldMode
            }
          }

          groups {
            label
            description
            fields {
              path
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
          isSingleton

          hideNavigation
          hideCreate
          hideDelete
        }
      }
    }
  }
`

// TODO: FIXME: should use DeepNullable
// TODO: duplicate, reference core/src/lib/create-admin-meta.ts
export type AdminMetaQuery = {
  keystone: {
    adminMeta: {
      lists: (ListMeta & {
        fields: (Omit<FieldMeta, 'graphql'> & {
          isNonNull: FieldMeta['graphql']['isNonNull'] // TODO: FIXME: flattened?
        })[]
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
        isSingleton: boolean

        hideNavigation: boolean
        hideCreate: boolean
        hideDelete: boolean
      })[]
    }
  }
}
