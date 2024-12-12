import type {
  GraphQLNames,
} from '../types/utils'
import type {
  ListMeta,
  FieldMeta,
  FieldGroupMeta,
} from '../types'
import { gql } from './apollo'

export const adminMetaQuery = gql`
  query AdminMeta {
    keystone {
      __typename
      adminMeta {
        __typename
        lists {
          __typename
          key
          path
          description

          label
          labelField
          singular
          plural

          fields {
            __typename
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
            __typename
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
            __typename
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
    __typename: 'KeystoneMeta'
    adminMeta: {
      __typename: 'KeystoneAdminMeta'
      lists: (ListMeta & {
        __typename: 'KeystoneAdminUIListMeta'
        fields: (Omit<FieldMeta, 'graphql'> & {
          __typename: 'KeystoneAdminUIFieldMeta'
          isNonNull: FieldMeta['graphql']['isNonNull'] // TODO: FIXME: flattened?
        })[]
        groups: (FieldGroupMeta & {
          __typename: 'KeystoneAdminUIFieldGroupMeta'
          fields: (FieldMeta & {
            __typename: 'KeystoneAdminUIFieldMeta'
          })[]
        })[]
        graphql: {
          names: GraphQLNames
        }

        pageSize: number
        initialColumns: string[]
        initialSearchFields: string[]
        initialSort: ({
          __typename: 'KeystoneAdminUISort'
        } & ListMeta['initialSort']) | null
        isSingleton: boolean

        hideNavigation: boolean
        hideCreate: boolean
        hideDelete: boolean
      })[]
    }
  }
}
