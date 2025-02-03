import type {
  EnumType,
  EnumValue,
  ScalarType,
} from '@graphql-ts/schema'
import type {
  BaseItem,
  KeystoneContext as Context,
  MaybePromise
} from '../types'
import type {
  GraphQLNames,
} from '../types/utils'
import { QueryMode } from '../types'
import { g as graphqlBoundToKeystoneContext } from '../types/schema'
import type {
  AdminMetaRootVal,
  FieldGroupMetaRootVal,
  FieldMetaRootVal,
  ListMetaRootVal,
} from './create-admin-meta'

const g = {
  ...graphqlBoundToKeystoneContext,
  ...graphqlBoundToKeystoneContext.bindGraphQLSchemaAPIToContext<Context>(),
}

const KeystoneAdminUIFieldMeta = g.object<FieldMetaRootVal>()({
  name: 'KeystoneAdminUIFieldMeta',
  fields: {
    path: g.field({ type: g.nonNull(g.String) }),
    label: g.field({ type: g.nonNull(g.String) }),
    description: g.field({ type: g.String }),
    ...contextFunctionField('isOrderable', g.Boolean),
    ...contextFunctionField('isFilterable', g.Boolean),
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
        g.object<FieldMetaRootVal['createView']>()({
          name: 'KeystoneAdminUIFieldMetaCreateView',
          fields: contextFunctionField(
            'fieldMode',
            g.enum({
              name: 'KeystoneAdminUIFieldMetaCreateViewFieldMode',
              values: g.enumValues(['edit', 'hidden']),
            })
          ),
        })
      ),
    }),
    listView: g.field({
      type: g.nonNull(
        g.object<FieldMetaRootVal['listView']>()({
          name: 'KeystoneAdminUIFieldMetaListView',
          fields: contextFunctionField(
            'fieldMode',
            g.enum({
              name: 'KeystoneAdminUIFieldMetaListViewFieldMode',
              values: g.enumValues(['read', 'hidden']),
            })
          ),
        })
      ),
    }),
    itemView: g.field({
      args: { id: g.arg({ type: g.ID, }) },
      resolve: ({ itemView, listKey }, { id }) => ({
        listKey,
        fieldMode: itemView.fieldMode,
        itemId: id ?? null,
        fieldPosition: itemView.fieldPosition,
      }),
      type: g.object<{
        listKey: string
        fieldMode: FieldMetaRootVal['itemView']['fieldMode']
        fieldPosition: FieldMetaRootVal['itemView']['fieldPosition']
        itemId: string | null
      }>()({
        name: 'KeystoneAdminUIFieldMetaItemView',
        fields: {
          fieldMode: g.field({
            type: g.enum({
              name: 'KeystoneAdminUIFieldMetaItemViewFieldMode',
              values: g.enumValues(['edit', 'read', 'hidden']),
            }),
            async resolve ({ fieldMode, itemId, listKey }, args, context, info) {
              if (typeof fieldMode !== 'function') return fieldMode

              const item = itemId ? (await fetchItemForItemViewFieldMode(context)(listKey, itemId)) : null
              return fieldMode({
                session: context.session,
                context,
                item,
              })
            },
          }),
          fieldPosition: g.field({
            type: g.enum({
              name: 'KeystoneAdminUIFieldMetaItemViewFieldPosition',
              values: g.enumValues(['form', 'sidebar']),
            }),
            async resolve ({ fieldPosition, itemId, listKey }, args, context, info) {
              if (typeof fieldPosition !== 'function') return fieldPosition

              const item = itemId ? (await fetchItemForItemViewFieldMode(context)(listKey, itemId)) : null
              return fieldPosition({
                session: context.session,
                context,
                item,
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

const KeystoneAdminUIFieldGroupMeta = g.object<FieldGroupMetaRootVal>()({
  name: 'KeystoneAdminUIFieldGroupMeta',
  fields: {
    label: g.field({ type: g.nonNull(g.String) }),
    description: g.field({ type: g.String }),
    fields: g.field({
      type: g.nonNull(g.list(g.nonNull(KeystoneAdminUIFieldMeta))),
    }),
  },
})

const KeystoneAdminUISort = g.object<NonNullable<ListMetaRootVal['initialSort']>>()({
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
  }
})

const KeystoneAdminUIGraphQL = g.object<any>()({
  name: 'KeystoneAdminUIGraphQL',
  fields: {
    names: g.field({ type: g.nonNull(KeystoneAdminUIGraphQLNames) }),
  }
})

const KeystoneAdminUIListMeta = g.object<ListMetaRootVal>()({
  name: 'KeystoneAdminUIListMeta',
  fields: {
    key: g.field({ type: g.nonNull(g.String) }),
    path: g.field({ type: g.nonNull(g.String) }),
    description: g.field({ type: g.String }),

    label: g.field({ type: g.nonNull(g.String) }),
    labelField: g.field({ type: g.nonNull(g.String) }),
    singular: g.field({ type: g.nonNull(g.String) }),
    plural: g.field({ type: g.nonNull(g.String) }),

    fields: g.field({ type: g.nonNull(g.list(g.nonNull(KeystoneAdminUIFieldMeta))), }),
    groups: g.field({ type: g.nonNull(g.list(g.nonNull(KeystoneAdminUIFieldGroupMeta))), }),
    graphql: g.field({ type: g.nonNull(KeystoneAdminUIGraphQL) }),

    pageSize: g.field({ type: g.nonNull(g.Int) }),
    initialColumns: g.field({ type: g.nonNull(g.list(g.nonNull(g.String))), }),
    initialSearchFields: g.field({ type: g.nonNull(g.list(g.nonNull(g.String))), }),
    initialSort: g.field({ type: KeystoneAdminUISort }),
    isSingleton: g.field({ type: g.nonNull(g.Boolean) }),

    ...contextFunctionField('hideNavigation', g.Boolean),
    ...contextFunctionField('hideCreate', g.Boolean),
    ...contextFunctionField('hideDelete', g.Boolean),
  },
})

const adminMeta = g.object<AdminMetaRootVal>()({
  name: 'KeystoneAdminMeta',
  fields: {
    lists: g.field({
      type: g.nonNull(g.list(g.nonNull(KeystoneAdminUIListMeta))),
    }),
    list: g.field({
      type: KeystoneAdminUIListMeta,
      args: { key: g.arg({ type: g.nonNull(g.String) }) },
      resolve (rootVal, { key }) {
        return rootVal.listsByKey[key]
      },
    }),
  },
})

export const KeystoneMeta = g.object<{ adminMeta: AdminMetaRootVal }>()({
  name: 'KeystoneMeta',
  fields: {
    adminMeta: g.field({
      type: g.nonNull(adminMeta),
      resolve ({ adminMeta }, args, context, info) {
        return Promise.resolve(adminMeta.isAccessAllowed(context)).then(isAllowed => {
          if (isAllowed) return adminMeta

          // TODO: we need better errors
          throw new Error('Access denied')
        })
      },
    }),
  },
})

const fetchItemForItemViewFieldMode = extendContext(context => {
  type ListKey = string
  type ItemId = string
  const lists = new Map<ListKey, Map<ItemId, Promise<BaseItem | null>>>()
  return (listKey: ListKey, id: ItemId) => {
    if (!lists.has(listKey)) {
      lists.set(listKey, new Map())
    }
    const items = lists.get(listKey)!
    if (items.has(id)) return items.get(id)!

    const promise = context.db[listKey].findOne({ where: { id } })
    items.set(id, promise)
    return promise
  }
})

function extendContext<T> (cb: (context: Context) => T) {
  const cache = new WeakMap<Context, T>()
  return (context: Context) => {
    if (cache.has(context)) return cache.get(context)!
    const result = cb(context)
    cache.set(context, result)
    return result
  }
}

function contextFunctionField<Key extends string, Type extends string | boolean> (
  key: Key,
  type: ScalarType<Type> | EnumType<Record<string, EnumValue<Type>>>
) {
  return {
    [key]: g.field({
      type: g.nonNull(type),
      resolve (source: {
        [_ in Key]: (context: Context) => MaybePromise<Type>
      }, args, context, info) {
        return source[key](context)
      },
    })
  }
}
