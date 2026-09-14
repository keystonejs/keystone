import type { AdminMeta } from '../types/index.ts'
import { gql } from './apollo.ts'

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
              arguments {
                name
                type
                source
              }
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
          hiddenFilter
          isSingleton

          hideNavigation
          hideCreate
          hideDelete
        }
      }
    }
  }
`

export type AdminMetaQuery = {
  keystone: {
    adminMeta: AdminMeta
  }
}
