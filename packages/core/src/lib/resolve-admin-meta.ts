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
import { graphql as graphqlBoundToKeystoneContext } from '../types/schema'
import type {
  AdminMetaRootVal,
  FieldGroupMetaRootVal,
  FieldMetaRootVal,
  ListMetaRootVal,
} from './create-admin-meta'

const graphql = {
  ...graphqlBoundToKeystoneContext,
  ...graphqlBoundToKeystoneContext.bindGraphQLSchemaAPIToContext<Context>(),
}

const KeystoneAdminUIFieldMeta = graphql.object<FieldMetaRootVal>()({
  name: 'KeystoneAdminUIFieldMeta',
  fields: {
    path: graphql.field({ type: graphql.nonNull(graphql.String) }),
    label: graphql.field({ type: graphql.nonNull(graphql.String) }),
    description: graphql.field({ type: graphql.String }),
    ...contextFunctionField('isOrderable', graphql.Boolean),
    ...contextFunctionField('isFilterable', graphql.Boolean),
    isNonNull: graphql.field({
      type: graphql.list(
        graphql.nonNull(
          graphql.enum({
            name: 'KeystoneAdminUIFieldMetaIsNonNull',
            values: graphql.enumValues(['read', 'create', 'update']),
          })
        )
      ),
    }),
    fieldMeta: graphql.field({ type: graphql.JSON }),
    viewsIndex: graphql.field({ type: graphql.nonNull(graphql.Int) }),
    customViewsIndex: graphql.field({ type: graphql.Int }),
    createView: graphql.field({
      type: graphql.nonNull(
        graphql.object<FieldMetaRootVal['createView']>()({
          name: 'KeystoneAdminUIFieldMetaCreateView',
          fields: contextFunctionField(
            'fieldMode',
            graphql.enum({
              name: 'KeystoneAdminUIFieldMetaCreateViewFieldMode',
              values: graphql.enumValues(['edit', 'hidden']),
            })
          ),
        })
      ),
    }),
    listView: graphql.field({
      type: graphql.nonNull(
        graphql.object<FieldMetaRootVal['listView']>()({
          name: 'KeystoneAdminUIFieldMetaListView',
          fields: contextFunctionField(
            'fieldMode',
            graphql.enum({
              name: 'KeystoneAdminUIFieldMetaListViewFieldMode',
              values: graphql.enumValues(['read', 'hidden']),
            })
          ),
        })
      ),
    }),
    itemView: graphql.field({
      args: { id: graphql.arg({ type: graphql.ID, }) },
      resolve: ({ itemView, listKey }, { id }) => ({
        listKey,
        fieldMode: itemView.fieldMode,
        itemId: id ?? null,
        fieldPosition: itemView.fieldPosition,
      }),
      type: graphql.object<{
        listKey: string
        fieldMode: FieldMetaRootVal['itemView']['fieldMode']
        fieldPosition: FieldMetaRootVal['itemView']['fieldPosition']
        itemId: string | null
      }>()({
        name: 'KeystoneAdminUIFieldMetaItemView',
        fields: {
          fieldMode: graphql.field({
            type: graphql.enum({
              name: 'KeystoneAdminUIFieldMetaItemViewFieldMode',
              values: graphql.enumValues(['edit', 'read', 'hidden']),
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
          fieldPosition: graphql.field({
            type: graphql.enum({
              name: 'KeystoneAdminUIFieldMetaItemViewFieldPosition',
              values: graphql.enumValues(['form', 'sidebar']),
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
    search: graphql.field({
      type: QueryMode,
    }),
  },
})

const KeystoneAdminUIFieldGroupMeta = graphql.object<FieldGroupMetaRootVal>()({
  name: 'KeystoneAdminUIFieldGroupMeta',
  fields: {
    label: graphql.field({ type: graphql.nonNull(graphql.String) }),
    description: graphql.field({ type: graphql.String }),
    fields: graphql.field({
      type: graphql.nonNull(graphql.list(graphql.nonNull(KeystoneAdminUIFieldMeta))),
    }),
  },
})

const KeystoneAdminUISort = graphql.object<NonNullable<ListMetaRootVal['initialSort']>>()({
  name: 'KeystoneAdminUISort',
  fields: {
    field: graphql.field({ type: graphql.nonNull(graphql.String) }),
    direction: graphql.field({
      type: graphql.nonNull(
        graphql.enum({
          name: 'KeystoneAdminUISortDirection',
          values: graphql.enumValues(['ASC', 'DESC']),
        })
      ),
    }),
  },
})

const KeystoneAdminUIGraphQLNames = graphql.object<GraphQLNames>()({
  name: 'KeystoneAdminUIGraphQLNames',
  fields: {
    outputTypeName: graphql.field({ type: graphql.nonNull(graphql.String) }),
    whereInputName: graphql.field({ type: graphql.nonNull(graphql.String) }),
    whereUniqueInputName: graphql.field({ type: graphql.nonNull(graphql.String) }),

    // create
    createInputName: graphql.field({ type: graphql.nonNull(graphql.String) }),
    createMutationName: graphql.field({ type: graphql.nonNull(graphql.String) }),
    createManyMutationName: graphql.field({ type: graphql.nonNull(graphql.String) }),
    relateToOneForCreateInputName: graphql.field({ type: graphql.nonNull(graphql.String) }),
    relateToManyForCreateInputName: graphql.field({ type: graphql.nonNull(graphql.String) }),

    // read
    itemQueryName: graphql.field({ type: graphql.nonNull(graphql.String) }),
    listOrderName: graphql.field({ type: graphql.nonNull(graphql.String) }),
    listQueryCountName: graphql.field({ type: graphql.nonNull(graphql.String) }),
    listQueryName: graphql.field({ type: graphql.nonNull(graphql.String) }),

    // update
    updateInputName: graphql.field({ type: graphql.nonNull(graphql.String) }),
    updateMutationName: graphql.field({ type: graphql.nonNull(graphql.String) }),
    updateManyInputName: graphql.field({ type: graphql.nonNull(graphql.String) }),
    updateManyMutationName: graphql.field({ type: graphql.nonNull(graphql.String) }),
    relateToOneForUpdateInputName: graphql.field({ type: graphql.nonNull(graphql.String) }),
    relateToManyForUpdateInputName: graphql.field({ type: graphql.nonNull(graphql.String) }),

    // delete
    deleteMutationName: graphql.field({ type: graphql.nonNull(graphql.String) }),
    deleteManyMutationName: graphql.field({ type: graphql.nonNull(graphql.String) }),
  }
})

const KeystoneAdminUIGraphQL = graphql.object<any>()({
  name: 'KeystoneAdminUIGraphQL',
  fields: {
    names: graphql.field({ type: graphql.nonNull(KeystoneAdminUIGraphQLNames) }),
  }
})

const KeystoneAdminUIListMeta = graphql.object<ListMetaRootVal>()({
  name: 'KeystoneAdminUIListMeta',
  fields: {
    key: graphql.field({ type: graphql.nonNull(graphql.String) }),
    path: graphql.field({ type: graphql.nonNull(graphql.String) }),
    description: graphql.field({ type: graphql.String }),

    label: graphql.field({ type: graphql.nonNull(graphql.String) }),
    labelField: graphql.field({ type: graphql.nonNull(graphql.String) }),
    singular: graphql.field({ type: graphql.nonNull(graphql.String) }),
    plural: graphql.field({ type: graphql.nonNull(graphql.String) }),

    fields: graphql.field({ type: graphql.nonNull(graphql.list(graphql.nonNull(KeystoneAdminUIFieldMeta))), }),
    groups: graphql.field({ type: graphql.nonNull(graphql.list(graphql.nonNull(KeystoneAdminUIFieldGroupMeta))), }),
    graphql: graphql.field({ type: graphql.nonNull(KeystoneAdminUIGraphQL) }),

    pageSize: graphql.field({ type: graphql.nonNull(graphql.Int) }),
    initialColumns: graphql.field({ type: graphql.nonNull(graphql.list(graphql.nonNull(graphql.String))), }),
    initialSearchFields: graphql.field({ type: graphql.nonNull(graphql.list(graphql.nonNull(graphql.String))), }),
    initialSort: graphql.field({ type: KeystoneAdminUISort }),
    isSingleton: graphql.field({ type: graphql.nonNull(graphql.Boolean) }),

    ...contextFunctionField('hideNavigation', graphql.Boolean),
    ...contextFunctionField('hideCreate', graphql.Boolean),
    ...contextFunctionField('hideDelete', graphql.Boolean),
  },
})

const adminMeta = graphql.object<AdminMetaRootVal>()({
  name: 'KeystoneAdminMeta',
  fields: {
    lists: graphql.field({
      type: graphql.nonNull(graphql.list(graphql.nonNull(KeystoneAdminUIListMeta))),
    }),
    list: graphql.field({
      type: KeystoneAdminUIListMeta,
      args: { key: graphql.arg({ type: graphql.nonNull(graphql.String) }) },
      resolve (rootVal, { key }) {
        return rootVal.listsByKey[key]
      },
    }),
  },
})

export const KeystoneMeta = graphql.object<{ adminMeta: AdminMetaRootVal }>()({
  name: 'KeystoneMeta',
  fields: {
    adminMeta: graphql.field({
      type: graphql.nonNull(adminMeta),
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
    [key]: graphql.field({
      type: graphql.nonNull(type),
      resolve (source: {
        [_ in Key]: (context: Context) => MaybePromise<Type>
      }, args, context, info) {
        return source[key](context)
      },
    })
  }
}
