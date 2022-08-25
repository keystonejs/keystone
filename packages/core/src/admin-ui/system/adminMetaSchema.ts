import { GraphQLResolveInfo } from 'graphql';
import { ScalarType, EnumType, EnumValue } from '@graphql-ts/schema';
import {
  QueryMode,
  KeystoneContext,
  AdminMetaRootVal,
  ListMetaRootVal,
  FieldMetaRootVal,
  BaseItem,
  MaybePromise,
} from '../../types';
import { graphql as graphqlBoundToKeystoneContext } from '../..';
import { assertUnhandledSingletonCase } from '../../lib/utils';

type Context = KeystoneContext | { isAdminUIBuildProcess: true };

const graphql = {
  ...graphqlBoundToKeystoneContext,
  ...graphqlBoundToKeystoneContext.bindGraphQLSchemaAPIToContext<Context>(),
};

const KeystoneAdminUIFieldMetaItemView = graphql.object<{
  fieldMode: () => MaybePromise<'edit' | 'read' | 'hidden' | null>;
}>()({
  name: 'KeystoneAdminUIFieldMetaItemView',
  fields: {
    fieldMode: graphql.field({
      type: graphql.enum({
        name: 'KeystoneAdminUIFieldMetaItemViewFieldMode',
        values: graphql.enumValues(['edit', 'read', 'hidden']),
      }),
    }),
  },
});

const itemViewArgs = {
  id: graphql.arg({
    type: graphql.ID,
  }),
};

const commonModelFieldMetaFields = graphql.fields<FieldMetaRootVal>()({
  path: graphql.field({ type: graphql.nonNull(graphql.String) }),
  label: graphql.field({ type: graphql.nonNull(graphql.String) }),
  description: graphql.field({ type: graphql.String }),
  fieldMeta: graphql.field({ type: graphql.JSON }),
  viewsIndex: graphql.field({ type: graphql.nonNull(graphql.Int) }),
  customViewsIndex: graphql.field({ type: graphql.Int }),
});

const fieldLevelNames = {
  list: 'KeystoneAdminUIListFieldMeta',
  singleton: 'KeystoneAdminUISingletonFieldMeta',
};

const KeystoneAdminUIModelFieldMeta = graphql.interface<FieldMetaRootVal>()({
  name: 'KeystoneAdminUIModelFieldMeta',
  resolveType: () => fieldLevelNames.list,
  fields: {
    ...commonModelFieldMetaFields,
    itemView: graphql.interfaceField({
      args: itemViewArgs,
      type: KeystoneAdminUIFieldMetaItemView,
    }),
  },
});

const KeystoneAdminUISingletonFieldMeta = graphql.object<FieldMetaRootVal>()({
  name: fieldLevelNames.singleton,
  interfaces: [KeystoneAdminUIModelFieldMeta],
  fields: {
    ...commonModelFieldMetaFields,
    itemView: graphql.field({
      args: itemViewArgs,
      type: KeystoneAdminUIFieldMetaItemView,
      resolve() {
        assertUnhandledSingletonCase();
      },
    }),
  },
});

const KeystoneAdminUIListFieldMeta = graphql.object<FieldMetaRootVal>()({
  name: fieldLevelNames.list,
  interfaces: [KeystoneAdminUIModelFieldMeta],
  fields: {
    path: commonModelFieldMetaFields.path,
    label: commonModelFieldMetaFields.label,
    description: commonModelFieldMetaFields.description,
    ...contextFunctionField('isOrderable', graphql.Boolean),
    ...contextFunctionField('isFilterable', graphql.Boolean),
    fieldMeta: commonModelFieldMetaFields.fieldMeta,
    viewsIndex: commonModelFieldMetaFields.viewsIndex,
    customViewsIndex: commonModelFieldMetaFields.customViewsIndex,
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
      args: {
        id: graphql.arg({
          type: graphql.ID,
        }),
      },
      type: KeystoneAdminUIFieldMetaItemView,
      resolve({ itemView: { fieldMode }, listKey }, { id: itemId = null }, context, info) {
        return {
          fieldMode: (): MaybePromise<'edit' | 'read' | 'hidden' | null> => {
            if (itemId !== null) {
              assertInRuntimeContext(context, info);
            }

            if (typeof fieldMode === 'string') {
              return fieldMode;
            }

            if (itemId === null) {
              return null;
            }

            // we need to re-assert this because typescript doesn't understand the relation between
            // rootVal.itemId !== null and the context being a runtime context
            assertInRuntimeContext(context, info);

            return fetchItemForItemViewFieldMode(context)(listKey, itemId).then(item => {
              if (item === null) {
                return 'hidden' as const;
              }
              return fieldMode({
                session: context.session,
                context,
                item,
              });
            });
          },
        };
      },
    }),
    search: graphql.field({ type: QueryMode }),
  },
});

const commonModelMetaFields = graphql.fields<ListMetaRootVal>()({
  key: graphql.field({ type: graphql.nonNull(graphql.String) }),
  path: graphql.field({ type: graphql.nonNull(graphql.String) }),
  label: graphql.field({ type: graphql.nonNull(graphql.String) }),
  singular: graphql.field({ type: graphql.nonNull(graphql.String) }),
  description: graphql.field({ type: graphql.String }),
  ...contextFunctionField('isHidden', graphql.Boolean),
});

const listLevelNames = {
  list: 'KeystoneAdminUIListMeta',
  singleton: 'KeystoneAdminUISingletonMeta',
};

const KeystoneAdminUIModelMeta = graphql.interface<ListMetaRootVal>()({
  name: 'KeystoneAdminUIModelMeta',
  resolveType: () => listLevelNames.list,
  fields: {
    ...commonModelMetaFields,
    fields: graphql.interfaceField({
      type: graphql.nonNull(graphql.list(graphql.nonNull(KeystoneAdminUIModelFieldMeta))),
    }),
  },
});

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
});

const KeystoneAdminUIListMeta = graphql.object<ListMetaRootVal>()({
  name: listLevelNames.list,
  interfaces: [KeystoneAdminUIModelMeta],
  fields: {
    key: commonModelMetaFields.key,
    graphqlPlural: graphql.field({
      type: graphql.nonNull(graphql.String),
      resolve: val => val.listQueryName,
    }),
    ...contextFunctionField('hideCreate', graphql.Boolean),
    ...contextFunctionField('hideDelete', graphql.Boolean),
    path: commonModelMetaFields.path,
    label: commonModelMetaFields.label,
    singular: commonModelMetaFields.singular,
    plural: graphql.field({ type: graphql.nonNull(graphql.String) }),
    description: commonModelMetaFields.description,
    initialColumns: graphql.field({
      type: graphql.nonNull(graphql.list(graphql.nonNull(graphql.String))),
    }),
    pageSize: graphql.field({ type: graphql.nonNull(graphql.Int) }),
    labelField: graphql.field({ type: graphql.nonNull(graphql.String) }),
    fields: graphql.field({
      type: graphql.nonNull(graphql.list(graphql.nonNull(KeystoneAdminUIListFieldMeta))),
    }),
    initialSort: graphql.field({ type: KeystoneAdminUISort }),
    isHidden: commonModelMetaFields.isHidden,
  },
});

const KeystoneAdminUISingletonMeta = graphql.object<ListMetaRootVal>()({
  name: listLevelNames.singleton,
  interfaces: [KeystoneAdminUIModelMeta],
  fields: {
    ...commonModelMetaFields,
    fields: graphql.field({
      type: graphql.nonNull(graphql.list(graphql.nonNull(KeystoneAdminUISingletonFieldMeta))),
    }),
  },
});

export const adminMetaTypes = [
  KeystoneAdminUIListMeta.graphQLType,
  KeystoneAdminUISingletonMeta.graphQLType,
  KeystoneAdminUIModelMeta.graphQLType,
  KeystoneAdminUIModelFieldMeta.graphQLType,
];

const adminMeta = graphql.object<AdminMetaRootVal>()({
  name: 'KeystoneAdminMeta',
  fields: {
    models: graphql.field({
      type: graphql.nonNull(graphql.list(graphql.nonNull(KeystoneAdminUIModelMeta))),
      resolve: val => val.lists,
    }),
    model: graphql.field({
      type: KeystoneAdminUIModelMeta,
      args: { key: graphql.arg({ type: graphql.nonNull(graphql.String) }) },
      resolve(rootVal, { key }) {
        return rootVal.listsByKey[key];
      },
    }),
  },
});

export const KeystoneMeta = graphql.object<{ adminMeta: AdminMetaRootVal }>()({
  name: 'KeystoneMeta',
  fields: {
    adminMeta: graphql.field({
      type: graphql.nonNull(adminMeta),
      resolve({ adminMeta }, args, context) {
        if ('isAdminUIBuildProcess' in context || adminMeta.isAccessAllowed === undefined) {
          return adminMeta;
        }
        return Promise.resolve(adminMeta.isAccessAllowed(context)).then(isAllowed => {
          if (isAllowed) {
            return adminMeta;
          }
          // TODO: ughhhhhh, we really need to talk about errors.
          // mostly unrelated to above: error or return null here(+ make field nullable)?s
          throw new Error('Access denied');
        });
      },
    }),
  },
});

const fetchItemForItemViewFieldMode = extendContext(context => {
  type ListKey = string;
  type ItemId = string;
  const lists = new Map<ListKey, Map<ItemId, Promise<BaseItem | null>>>();
  return (listKey: ListKey, id: ItemId) => {
    if (!lists.has(listKey)) {
      lists.set(listKey, new Map());
    }
    const items = lists.get(listKey)!;
    if (items.has(id)) {
      return items.get(id)!;
    }
    let promise = context.db[listKey].findOne({ where: { id } });
    items.set(id, promise);
    return promise;
  };
});

function extendContext<T>(cb: (context: KeystoneContext) => T) {
  const cache = new WeakMap<KeystoneContext, T>();
  return (context: KeystoneContext) => {
    if (cache.has(context)) {
      return cache.get(context)!;
    }
    const result = cb(context);
    cache.set(context, result);
    return result;
  };
}

function assertInRuntimeContext(
  context: KeystoneContext | { isAdminUIBuildProcess: true },
  info: GraphQLResolveInfo
): asserts context is KeystoneContext {
  if ('isAdminUIBuildProcess' in context) {
    throw new Error(
      `${info.parentType}.${info.fieldName} cannot be resolved during the build process`
    );
  }
}

// TypeScript doesn't infer a mapped type when using a computed property that's a type parameter
function objectFromKeyVal<Key extends string, Val>(key: Key, val: Val): { [_ in Key]: Val } {
  return { [key]: val } as { [_ in Key]: Val };
}

function contextFunctionField<Key extends string, Type extends string | boolean>(
  key: Key,
  type: ScalarType<Type> | EnumType<Record<string, EnumValue<Type>>>
) {
  type Source = { [_ in Key]: (context: KeystoneContext) => MaybePromise<Type> };
  return objectFromKeyVal(
    key,
    graphql.field({
      type: graphql.nonNull(type),
      resolve(source: Source, args, context, info) {
        assertInRuntimeContext(context, info);
        return source[key](context);
      },
    })
  );
}
