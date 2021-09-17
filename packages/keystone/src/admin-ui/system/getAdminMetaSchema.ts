import { GraphQLSchema, GraphQLObjectType, assertScalarType, assertEnumType } from 'graphql';
import {
  JSONValue,
  QueryMode,
  graphql as graphqlBoundToKeystoneContext,
  KeystoneContext,
  KeystoneConfig,
  AdminMetaRootVal,
  ListMetaRootVal,
  FieldMetaRootVal,
  ItemRootValue,
} from '../../types';
import { InitialisedList } from '../../lib/core/types-for-lists';

const graphql = {
  ...graphqlBoundToKeystoneContext,
  ...graphqlBoundToKeystoneContext.bindGraphQLSchemaAPIToContext<
    KeystoneContext | { isAdminUIBuildProcess: true }
  >(),
};

export function getAdminMetaSchema({
  config,
  graphQLSchema,
  lists,
  adminMeta: adminMetaRoot,
}: {
  adminMeta: AdminMetaRootVal;
  config: KeystoneConfig;
  lists: Record<string, InitialisedList>;
  graphQLSchema: GraphQLSchema;
}) {
  const isAccessAllowed =
    config.session === undefined
      ? undefined
      : config.ui?.isAccessAllowed ?? (({ session }) => session !== undefined);
  const jsonScalarType = graphQLSchema.getType('JSON');
  const jsonScalar = jsonScalarType
    ? graphql.scalar<JSONValue>(assertScalarType(jsonScalarType))
    : graphqlBoundToKeystoneContext.JSON;
  const queryModeEnumType = graphQLSchema.getType('QueryMode');
  const queryModeEnum = queryModeEnumType
    ? { ...QueryMode, graphQLType: assertEnumType(graphQLSchema.getType('QueryMode')) }
    : QueryMode;

  const KeystoneAdminUIFieldMeta = graphql.object<FieldMetaRootVal>()({
    name: 'KeystoneAdminUIFieldMeta',
    fields: {
      path: graphql.field({ type: graphql.nonNull(graphql.String) }),
      label: graphql.field({ type: graphql.nonNull(graphql.String) }),
      isOrderable: graphql.field({
        type: graphql.nonNull(graphql.Boolean),
        resolve(rootVal, args, context) {
          if ('isAdminUIBuildProcess' in context) {
            throw new Error(
              'KeystoneAdminUIFieldMeta.isOrderable cannot be resolved during the build process'
            );
          }
          const isOrderable = lists[rootVal.listKey].fields[rootVal.path].graphql.isEnabled.orderBy;
          if (typeof isOrderable === 'function') {
            return isOrderable({
              context,
              fieldKey: rootVal.path,
              listKey: rootVal.listKey,
              session: context.session,
            });
          }
          return isOrderable;
        },
      }),
      isFilterable: graphql.field({
        type: graphql.nonNull(graphql.Boolean),
        resolve(rootVal, args, context) {
          if ('isAdminUIBuildProcess' in context) {
            throw new Error(
              'KeystoneAdminUIFieldMeta.isOrderable cannot be resolved during the build process'
            );
          }
          const isFilterable = lists[rootVal.listKey].fields[rootVal.path].graphql.isEnabled.filter;
          if (typeof isFilterable === 'function') {
            return isFilterable({
              context,
              fieldKey: rootVal.path,
              listKey: rootVal.listKey,
              session: context.session,
            });
          }
          return isFilterable ?? false;
        },
      }),
      fieldMeta: graphql.field({ type: jsonScalar }),
      viewsIndex: graphql.field({ type: graphql.nonNull(graphql.Int) }),
      customViewsIndex: graphql.field({ type: graphql.Int }),
      createView: graphql.field({
        resolve(rootVal) {
          return { fieldPath: rootVal.path, listKey: rootVal.listKey };
        },
        type: graphql.nonNull(
          graphql.object<FieldIdentifier>()({
            name: 'KeystoneAdminUIFieldMetaCreateView',
            fields: {
              fieldMode: graphql.field({
                type: graphql.nonNull(
                  graphql.enum({
                    name: 'KeystoneAdminUIFieldMetaCreateViewFieldMode',
                    values: graphql.enumValues(['edit', 'hidden']),
                  })
                ),
                async resolve(rootVal, args, context) {
                  if ('isAdminUIBuildProcess' in context) {
                    throw new Error(
                      'KeystoneAdminUIFieldMetaCreateView.fieldMode cannot be resolved during the build process'
                    );
                  }
                  if (!lists[rootVal.listKey].fields[rootVal.fieldPath].graphql.isEnabled.create) {
                    return 'hidden';
                  }
                  const listConfig = config.lists[rootVal.listKey];
                  const sessionFunction =
                    lists[rootVal.listKey].fields[rootVal.fieldPath].ui?.createView?.fieldMode ??
                    listConfig.ui?.createView?.defaultFieldMode;
                  return runMaybeFunction(sessionFunction, 'edit', { session: context.session });
                },
              }),
            },
          })
        ),
      }),
      listView: graphql.field({
        resolve(rootVal) {
          return { fieldPath: rootVal.path, listKey: rootVal.listKey };
        },
        type: graphql.nonNull(
          graphql.object<FieldIdentifier>()({
            name: 'KeystoneAdminUIFieldMetaListView',
            fields: {
              fieldMode: graphql.field({
                type: graphql.nonNull(
                  graphql.enum({
                    name: 'KeystoneAdminUIFieldMetaListViewFieldMode',
                    values: graphql.enumValues(['read', 'hidden']),
                  })
                ),
                async resolve(rootVal, args, context) {
                  if ('isAdminUIBuildProcess' in context) {
                    throw new Error(
                      'KeystoneAdminUIFieldMetaListView.fieldMode cannot be resolved during the build process'
                    );
                  }
                  if (!lists[rootVal.listKey].fields[rootVal.fieldPath].graphql.isEnabled.read) {
                    return 'hidden';
                  }
                  const listConfig = config.lists[rootVal.listKey];
                  const sessionFunction =
                    lists[rootVal.listKey].fields[rootVal.fieldPath].ui?.listView?.fieldMode ??
                    listConfig.ui?.listView?.defaultFieldMode;
                  return runMaybeFunction(sessionFunction, 'read', { session: context.session });
                },
              }),
            },
          })
        ),
      }),
      itemView: graphql.field({
        args: {
          id: graphql.arg({
            type: graphql.ID,
          }),
        },
        resolve(rootVal, args) {
          return { fieldPath: rootVal.path, listKey: rootVal.listKey, itemId: args.id ?? null };
        },
        type: graphql.object<FieldIdentifier & { itemId: string | null }>()({
          name: 'KeystoneAdminUIFieldMetaItemView',
          fields: {
            fieldMode: graphql.field({
              type: graphql.enum({
                name: 'KeystoneAdminUIFieldMetaItemViewFieldMode',
                values: graphql.enumValues(['edit', 'read', 'hidden']),
              }),
              resolve(rootVal, args, context) {
                if ('isAdminUIBuildProcess' in context && rootVal.itemId !== null) {
                  throw new Error(
                    'KeystoneAdminUIFieldMetaItemView.fieldMode cannot be resolved during the build process if an id is provided'
                  );
                }
                if (!lists[rootVal.listKey].fields[rootVal.fieldPath].graphql.isEnabled.read) {
                  return 'hidden';
                } else if (
                  !lists[rootVal.listKey].fields[rootVal.fieldPath].graphql.isEnabled.update
                ) {
                  return 'read';
                }
                const listConfig = config.lists[rootVal.listKey];

                const sessionFunction =
                  lists[rootVal.listKey].fields[rootVal.fieldPath].ui?.itemView?.fieldMode ??
                  listConfig.ui?.itemView?.defaultFieldMode ??
                  'edit';
                if (typeof sessionFunction === 'string') {
                  return sessionFunction;
                }

                if (rootVal.itemId === null) {
                  return null;
                }

                fakeAssert<KeystoneContext>(context);

                // uhhh, for some reason TypeScript only understands this if it's assigned
                // to a variable and then returned
                let ret = fetchItemForItemViewFieldMode(context)(
                  rootVal.listKey,
                  rootVal.itemId
                ).then(item => {
                  if (item === null) {
                    return 'hidden' as const;
                  }
                  return runMaybeFunction(sessionFunction, 'edit', {
                    session: context.session,
                    item,
                  });
                });
                return ret;
              },
            }),
          },
        }),
      }),
      search: graphql.field({
        type: queryModeEnum,
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
    name: 'KeystoneAdminUIListMeta',
    fields: {
      key: graphql.field({ type: graphql.nonNull(graphql.String) }),
      itemQueryName: graphql.field({
        type: graphql.nonNull(graphql.String),
      }),
      listQueryName: graphql.field({
        type: graphql.nonNull(graphql.String),
      }),
      hideCreate: graphql.field({
        type: graphql.nonNull(graphql.Boolean),
        resolve(rootVal, args, context) {
          if ('isAdminUIBuildProcess' in context) {
            throw new Error(
              'KeystoneAdminUIListMeta.hideCreate cannot be resolved during the build process'
            );
          }
          const listConfig = config.lists[rootVal.key];
          return runMaybeFunction(listConfig.ui?.hideCreate, false, { session: context.session });
        },
      }),
      hideDelete: graphql.field({
        type: graphql.nonNull(graphql.Boolean),
        resolve(rootVal, args, context) {
          if ('isAdminUIBuildProcess' in context) {
            throw new Error(
              'KeystoneAdminUIListMeta.hideDelete cannot be resolved during the build process'
            );
          }
          const listConfig = config.lists[rootVal.key];
          return runMaybeFunction(listConfig.ui?.hideDelete, false, { session: context.session });
        },
      }),
      path: graphql.field({ type: graphql.nonNull(graphql.String) }),
      label: graphql.field({ type: graphql.nonNull(graphql.String) }),
      singular: graphql.field({ type: graphql.nonNull(graphql.String) }),
      plural: graphql.field({ type: graphql.nonNull(graphql.String) }),
      description: graphql.field({ type: graphql.String }),
      initialColumns: graphql.field({
        type: graphql.nonNull(graphql.list(graphql.nonNull(graphql.String))),
      }),
      pageSize: graphql.field({ type: graphql.nonNull(graphql.Int) }),
      labelField: graphql.field({ type: graphql.nonNull(graphql.String) }),
      fields: graphql.field({
        type: graphql.nonNull(graphql.list(graphql.nonNull(KeystoneAdminUIFieldMeta))),
      }),
      initialSort: graphql.field({ type: KeystoneAdminUISort }),
      isHidden: graphql.field({
        type: graphql.nonNull(graphql.Boolean),
        resolve(rootVal, args, context) {
          if ('isAdminUIBuildProcess' in context) {
            throw new Error(
              'KeystoneAdminUIListMeta.isHidden cannot be resolved during the build process'
            );
          }
          const listConfig = config.lists[rootVal.key];
          return runMaybeFunction(listConfig.ui?.isHidden, false, { session: context.session });
        },
      }),
    },
  });

  const adminMeta = graphql.object<AdminMetaRootVal>()({
    name: 'KeystoneAdminMeta',
    fields: {
      enableSignout: graphql.field({
        type: graphql.nonNull(graphql.Boolean),
      }),
      enableSessionItem: graphql.field({
        type: graphql.nonNull(graphql.Boolean),
      }),
      lists: graphql.field({
        type: graphql.nonNull(graphql.list(graphql.nonNull(KeystoneAdminUIListMeta))),
      }),
      list: graphql.field({
        type: KeystoneAdminUIListMeta,
        args: {
          key: graphql.arg({
            type: graphql.nonNull(graphql.String),
          }),
        },
        resolve(rootVal, { key }) {
          return rootVal.listsByKey[key];
        },
      }),
    },
  });

  const KeystoneMeta = graphql.nonNull(
    graphql.object<{ adminMeta: AdminMetaRootVal }>()({
      name: 'KeystoneMeta',
      fields: {
        adminMeta: graphql.field({
          type: graphql.nonNull(adminMeta),
          resolve(rootVal, args, context) {
            if ('isAdminUIBuildProcess' in context || isAccessAllowed === undefined) {
              return adminMetaRoot;
            }
            return Promise.resolve(isAccessAllowed(context)).then(isAllowed => {
              if (isAllowed) {
                return adminMetaRoot;
              }
              // TODO: ughhhhhh, we really need to talk about errors.
              // mostly unrelated to above: error or return null here(+ make field nullable)?s
              throw new Error('Access denied');
            });
          },
        }),
      },
    })
  );
  const schemaConfig = graphQLSchema.toConfig();
  const queryTypeConfig = graphQLSchema.getQueryType()!.toConfig();
  return new GraphQLSchema({
    ...schemaConfig,
    types: schemaConfig.types.filter(x => x.name !== 'Query'),
    query: new GraphQLObjectType({
      ...queryTypeConfig,
      fields: {
        ...queryTypeConfig.fields,
        keystone: {
          type: KeystoneMeta.graphQLType,
          resolve() {
            return {};
          },
        },
      },
    }),
  });
}

type FieldIdentifier = { listKey: string; fieldPath: string };

type NoInfer<T> = T & { [K in keyof T]: T[K] };

function runMaybeFunction<Return extends string | boolean, T>(
  sessionFunction: Return | ((args: T) => Return | Promise<Return>) | undefined,
  defaultValue: NoInfer<Return>,
  args: T
): Return | Promise<Return> {
  if (typeof sessionFunction === 'function') {
    return sessionFunction(args);
  }
  if (typeof sessionFunction === 'undefined') {
    return defaultValue;
  }
  return sessionFunction;
}

function fakeAssert<T>(val: any): asserts val is T {}

const fetchItemForItemViewFieldMode = extendContext(context => {
  type ListKey = string;
  type ItemId = string;
  const lists = new Map<ListKey, Map<ItemId, Promise<ItemRootValue | null>>>();
  return (listKey: ListKey, id: ItemId) => {
    if (!lists.has(listKey)) {
      lists.set(listKey, new Map());
    }
    const items = lists.get(listKey)!;
    if (items.has(id)) {
      return items.get(id)!;
    }
    let promise = context.db.lists[listKey].findOne({ where: { id } });
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
