import type { BaseItem } from '../types'
import type { GraphQLNames } from '../types/utils'
import { QueryMode } from '../types'
import { g } from '../types/schema'
import type {
  AdminMetaSource,
  FieldGroupMetaSource,
  FieldMetaSource,
  ListMetaSource,
} from './create-admin-meta'

const KeystoneAdminUIFieldMeta = g.object<FieldMetaSource>()({
  name: 'KeystoneAdminUIFieldMeta',
  fields: {
    path: g.field({ type: g.nonNull(g.String) }),
    label: g.field({ type: g.nonNull(g.String) }),
    description: g.field({ type: g.String }),
    isOrderable: g.field({ type: g.nonNull(g.Boolean) }),
    isFilterable: g.field({ type: g.nonNull(g.Boolean) }),
    isNonNull: g.field({
      type: g.list(
        g.nonNull(
          g.enum({
            name: 'KeystoneAdminUIFieldMetaIsNonNull',
            values: g.enumValues(['read', 'create', 'update']),
          })
        )
      ),
    }),
    fieldMeta: g.field({ type: g.JSON }),
    viewsIndex: g.field({ type: g.nonNull(g.Int) }),
    customViewsIndex: g.field({ type: g.Int }),
    createView: g.field({
      type: g.nonNull(
        g.object<FieldMetaSource['createView']>()({
          name: 'KeystoneAdminUIFieldMetaCreateView',
          fields: {
            fieldMode: g.field({
              type: g.nonNull(g.JSON),
            }),
            isRequired: g.field({
              type: g.nonNull(g.JSON),
            }),
          },
        })
      ),
    }),
    listView: g.field({
      type: g.nonNull(
        g.object<FieldMetaSource['listView']>()({
          name: 'KeystoneAdminUIFieldMetaListView',
          fields: {
            fieldMode: g.field({
              type: g.nonNull(
                g.enum({
                  name: 'KeystoneAdminUIFieldMetaListViewFieldMode',
                  values: g.enumValues(['read', 'hidden']),
                })
              ),
            }),
          },
        })
      ),
    }),
    itemView: g.field({
      args: { id: g.arg({ type: g.ID }) },
      resolve: async ({ itemView, listKey, fieldKey }, { id }, context) => {
        if (id == null) {
          return {
            listKey,
            fieldKey,
            fieldMode: itemView.fieldMode,
            fieldPosition: itemView.fieldPosition,
            isRequired: itemView.isRequired,
            item: null,
            itemField: null,
          }
        }
        const item = await context.db[listKey].findOne({ where: { id } })
        if (!item) return null
        return {
          listKey,
          fieldKey,
          fieldMode: itemView.fieldMode,
          fieldPosition: itemView.fieldPosition,
          isRequired: itemView.isRequired,
          item,
          itemField: item[fieldKey],
        }
      },
      type: g.object<{
        listKey: string
        fieldKey: string
        fieldMode: FieldMetaSource['itemView']['fieldMode']
        fieldPosition: FieldMetaSource['itemView']['fieldPosition']
        isRequired: FieldMetaSource['itemView']['isRequired']
        item: BaseItem | null
        itemField: BaseItem[string] | null
      }>()({
        name: 'KeystoneAdminUIFieldMetaItemView',
        fields: {
          fieldMode: g.field({
            type: g.nonNull(g.JSON),
            async resolve({ fieldMode, listKey, fieldKey, item, itemField }, _, context) {
              if (typeof fieldMode !== 'function') return fieldMode
              return fieldMode({
                session: context.session,
                context,
                item,
                itemField,
                listKey,
                fieldKey,
              })
            },
          }),
          fieldPosition: g.field({
            type: g.nonNull(
              g.enum({
                name: 'KeystoneAdminUIFieldMetaItemViewFieldPosition',
                values: g.enumValues(['form', 'sidebar']),
              })
            ),
            async resolve({ fieldPosition, listKey, fieldKey, item, itemField }, _, context) {
              if (typeof fieldPosition !== 'function') return fieldPosition
              return fieldPosition({
                session: context.session,
                context,
                item,
                itemField,
                listKey,
                fieldKey,
              })
            },
          }),
          isRequired: g.field({
            type: g.nonNull(g.JSON),
            resolve({ isRequired, item, fieldKey, itemField, listKey }, _, context) {
              if (typeof isRequired !== 'function') return isRequired
              return isRequired({
                session: context.session,
                context,
                item,
                itemField,
                listKey,
                fieldKey,
              })
            },
          }),
        },
      }),
    }),
    search: g.field({
      type: QueryMode,
    }),
  },
})

const KeystoneAdminUIFieldGroupMeta = g.object<FieldGroupMetaSource>()({
  name: 'KeystoneAdminUIFieldGroupMeta',
  fields: {
    label: g.field({ type: g.nonNull(g.String) }),
    description: g.field({ type: g.String }),
    fields: g.field({
      type: g.nonNull(g.list(g.nonNull(KeystoneAdminUIFieldMeta))),
    }),
  },
})

const KeystoneAdminUISort = g.object<NonNullable<ListMetaSource['initialSort']>>()({
  name: 'KeystoneAdminUISort',
  fields: {
    field: g.field({ type: g.nonNull(g.String) }),
    direction: g.field({
      type: g.nonNull(
        g.enum({
          name: 'KeystoneAdminUISortDirection',
          values: g.enumValues(['ASC', 'DESC']),
        })
      ),
    }),
  },
})

const KeystoneAdminUIGraphQLNames = g.object<GraphQLNames>()({
  name: 'KeystoneAdminUIGraphQLNames',
  fields: {
    outputTypeName: g.field({ type: g.nonNull(g.String) }),
    whereInputName: g.field({ type: g.nonNull(g.String) }),
    whereUniqueInputName: g.field({ type: g.nonNull(g.String) }),

    // create
    createInputName: g.field({ type: g.nonNull(g.String) }),
    createMutationName: g.field({ type: g.nonNull(g.String) }),
    createManyMutationName: g.field({ type: g.nonNull(g.String) }),
    relateToOneForCreateInputName: g.field({ type: g.nonNull(g.String) }),
    relateToManyForCreateInputName: g.field({ type: g.nonNull(g.String) }),

    // read
    itemQueryName: g.field({ type: g.nonNull(g.String) }),
    listOrderName: g.field({ type: g.nonNull(g.String) }),
    listQueryCountName: g.field({ type: g.nonNull(g.String) }),
    listQueryName: g.field({ type: g.nonNull(g.String) }),

    // update
    updateInputName: g.field({ type: g.nonNull(g.String) }),
    updateMutationName: g.field({ type: g.nonNull(g.String) }),
    updateManyInputName: g.field({ type: g.nonNull(g.String) }),
    updateManyMutationName: g.field({ type: g.nonNull(g.String) }),
    relateToOneForUpdateInputName: g.field({ type: g.nonNull(g.String) }),
    relateToManyForUpdateInputName: g.field({ type: g.nonNull(g.String) }),

    // delete
    deleteMutationName: g.field({ type: g.nonNull(g.String) }),
    deleteManyMutationName: g.field({ type: g.nonNull(g.String) }),
  },
})

const KeystoneAdminUIGraphQL = g.object<any>()({
  name: 'KeystoneAdminUIGraphQL',
  fields: {
    names: g.field({ type: g.nonNull(KeystoneAdminUIGraphQLNames) }),
  },
})

const KeystoneAdminUIListMeta = g.object<ListMetaSource>()({
  name: 'KeystoneAdminUIListMeta',
  fields: {
    key: g.field({ type: g.nonNull(g.String) }),
    path: g.field({ type: g.nonNull(g.String) }),
    description: g.field({ type: g.String }),

    label: g.field({ type: g.nonNull(g.String) }),
    labelField: g.field({ type: g.nonNull(g.String) }),
    singular: g.field({ type: g.nonNull(g.String) }),
    plural: g.field({ type: g.nonNull(g.String) }),

    fields: g.field({ type: g.nonNull(g.list(g.nonNull(KeystoneAdminUIFieldMeta))) }),
    groups: g.field({ type: g.nonNull(g.list(g.nonNull(KeystoneAdminUIFieldGroupMeta))) }),
    graphql: g.field({ type: g.nonNull(KeystoneAdminUIGraphQL) }),

    pageSize: g.field({ type: g.nonNull(g.Int) }),
    initialColumns: g.field({ type: g.nonNull(g.list(g.nonNull(g.String))) }),
    initialSearchFields: g.field({ type: g.nonNull(g.list(g.nonNull(g.String))) }),
    initialSort: g.field({ type: KeystoneAdminUISort }),
    isSingleton: g.field({ type: g.nonNull(g.Boolean) }),
    hideNavigation: g.field({ type: g.nonNull(g.Boolean) }),
    hideCreate: g.field({ type: g.nonNull(g.Boolean) }),
    hideDelete: g.field({ type: g.nonNull(g.Boolean) }),
  },
})

const adminMeta = g.object<AdminMetaSource>()({
  name: 'KeystoneAdminMeta',
  fields: {
    lists: g.field({
      type: g.nonNull(g.list(g.nonNull(KeystoneAdminUIListMeta))),
    }),
    list: g.field({
      type: KeystoneAdminUIListMeta,
      args: { key: g.arg({ type: g.nonNull(g.String) }) },
      resolve(source, { key }) {
        return source.listsByKey[key]
      },
    }),
  },
})

export const KeystoneMeta = g.object<{ adminMeta: AdminMetaSource }>()({
  name: 'KeystoneMeta',
  fields: {
    adminMeta: g.field({
      type: g.nonNull(adminMeta),
      async resolve({ adminMeta }, _, context) {
        const isAllowed = await adminMeta.isAccessAllowed(context)
        if (isAllowed) return adminMeta

        // TODO: we need better errors
        throw new Error('Access denied')
      },
    }),
  },
})
