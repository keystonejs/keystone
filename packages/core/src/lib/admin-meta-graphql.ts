import type { BaseItem } from '../types'
import { QueryMode } from '../types'
import { g } from '../types/schema'
import type { GraphQLNames } from '../types/utils'
import type { AdminMetaSource, FieldMetaSource, ListMetaSource } from './admin-meta'

const KeystoneAdminUIFieldMeta = g.object<FieldMetaSource>()({
  name: 'KeystoneAdminUIFieldMeta',
  fields: {
    key: g.field({ type: g.nonNull(g.String) }),
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
    itemView: g.field({
      resolve: ({ listKey, fieldKey, itemView, item, itemField }) => {
        return {
          listKey,
          fieldKey,
          ...itemView,
          item,
          itemField,
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
                listKey,
                fieldKey,
                item,
                itemField,
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
                listKey,
                fieldKey,
                item,
                itemField,
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
                listKey,
                fieldKey,
                item,
                itemField,
              })
            },
          }),
        },
      }),
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
    search: g.field({
      type: QueryMode,
    }),
  },
})

const KeystoneAdminUIFieldGroupMeta = g.object<{
  label: string
  description: string | null
  fields: FieldMetaSource[]
}>()({
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
    label: g.field({ type: g.nonNull(g.String) }),
    singular: g.field({ type: g.nonNull(g.String) }),
    plural: g.field({ type: g.nonNull(g.String) }),
    path: g.field({ type: g.nonNull(g.String) }),

    labelField: g.field({ type: g.nonNull(g.String) }),
    fields: g.field({ type: g.nonNull(g.list(g.nonNull(KeystoneAdminUIFieldMeta))) }),
    groups: g.field({ type: g.nonNull(g.list(g.nonNull(KeystoneAdminUIFieldGroupMeta))) }),
    graphql: g.field({ type: g.nonNull(KeystoneAdminUIGraphQL) }),

    pageSize: g.field({ type: g.nonNull(g.Int) }),
    initialColumns: g.field({ type: g.nonNull(g.list(g.nonNull(g.String))) }),
    initialSearchFields: g.field({ type: g.nonNull(g.list(g.nonNull(g.String))) }),
    initialSort: g.field({ type: KeystoneAdminUISort }),
    initialFilter: g.field({ type: g.JSON }),
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
      args: {
        key: g.arg({ type: g.nonNull(g.String) }),
        itemId: g.arg({ type: g.ID }),
      },
      async resolve(source, { key, itemId }, context) {
        if (itemId === null || itemId === undefined) {
          return {
            ...source.listsByKey[key],
            item: null,
          }
        }
        const item = await context.db[key].findOne({ where: { id: itemId } })
        if (!item) return null
        return {
          ...source.listsByKey[key],
          item,
        }
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
