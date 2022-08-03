import {
  QueryMode,
  KeystoneContext,
  KeystoneConfig,
  AdminMetaRootVal,
  ListMetaRootVal,
  FieldMetaRootVal,
  BaseItem,
  ModelMetaRootVal,
} from '../../types';
import { graphql as graphqlBoundToKeystoneContext } from '../..';

import { InitialisedModel } from '../../lib/core/types-for-lists';
import { assertUnhandledSingletonCase } from '../../lib/utils';

const graphql = {
  ...graphqlBoundToKeystoneContext,
  ...graphqlBoundToKeystoneContext.bindGraphQLSchemaAPIToContext<
    KeystoneContext | { isAdminUIBuildProcess: true }
  >(),
};

export function getAdminMetaSchema({
  config,
  models,
  adminMeta: adminMetaRoot,
}: {
  adminMeta: AdminMetaRootVal;
  config: KeystoneConfig;
  models: Record<string, InitialisedModel>;
}) {
  const isAccessAllowed =
    config.ui?.isAccessAllowed ??
    (config.session === undefined ? undefined : ({ session }) => session !== undefined);
  const jsonScalar = graphqlBoundToKeystoneContext.JSON;

  const KeystoneAdminUIFieldMeta = graphql.object<FieldMetaRootVal>()({
    name: 'KeystoneAdminUIFieldMeta',
    fields: {
      path: graphql.field({ type: graphql.nonNull(graphql.String) }),
      label: graphql.field({ type: graphql.nonNull(graphql.String) }),
      description: graphql.field({ type: graphql.String }),
      isOrderable: graphql.field({
        type: graphql.nonNull(graphql.Boolean),
        resolve(rootVal, args, context) {
          if ('isAdminUIBuildProcess' in context) {
            throw new Error(
              'KeystoneAdminUIFieldMeta.isOrderable cannot be resolved during the build process'
            );
          }
          if (!models[rootVal.modelKey].fields[rootVal.path].input?.orderBy) {
            return false;
          }
          const isOrderable =
            models[rootVal.modelKey].fields[rootVal.path].graphql.isEnabled.orderBy;
          if (typeof isOrderable === 'function') {
            return isOrderable({
              context,
              fieldKey: rootVal.path,
              modelKey: rootVal.modelKey,
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
          if (!models[rootVal.modelKey].fields[rootVal.path].input?.where) {
            return false;
          }
          const isFilterable =
            models[rootVal.modelKey].fields[rootVal.path].graphql.isEnabled.filter;
          if (typeof isFilterable === 'function') {
            return isFilterable({
              context,
              fieldKey: rootVal.path,
              modelKey: rootVal.modelKey,
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
          return { fieldPath: rootVal.path, modelKey: rootVal.modelKey };
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
                  if (
                    !models[rootVal.modelKey].fields[rootVal.fieldPath].graphql.isEnabled.create
                  ) {
                    return 'hidden';
                  }
                  const modelConfig = config.models[rootVal.modelKey];
                  if (modelConfig.kind === 'singleton') {
                    assertUnhandledSingletonCase();
                  }
                  const sessionFunction =
                    models[rootVal.modelKey].fields[rootVal.fieldPath].ui?.createView?.fieldMode ??
                    modelConfig.ui?.createView?.defaultFieldMode;
                  return runMaybeFunction(sessionFunction, 'edit', {
                    session: context.session,
                    context,
                  });
                },
              }),
            },
          })
        ),
      }),
      listView: graphql.field({
        resolve(rootVal) {
          return { fieldPath: rootVal.path, modelKey: rootVal.modelKey };
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
                  if (!models[rootVal.modelKey].fields[rootVal.fieldPath].graphql.isEnabled.read) {
                    return 'hidden';
                  }

                  const model = models[rootVal.modelKey];
                  const modelConfig = config.models[rootVal.modelKey];

                  if (model.kind === 'singleton' || modelConfig.kind === 'singleton') {
                    assertUnhandledSingletonCase();
                  }

                  const sessionFunction =
                    model.fields[rootVal.fieldPath].ui?.listView?.fieldMode ??
                    modelConfig.ui?.listView?.defaultFieldMode;
                  return runMaybeFunction(sessionFunction, 'read', {
                    session: context.session,
                    context,
                  });
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
          return {
            fieldPath: rootVal.path,
            modelKey: rootVal.modelKey,
            itemId: args.id ?? null,
          };
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
                if (!models[rootVal.modelKey].fields[rootVal.fieldPath].graphql.isEnabled.read) {
                  return 'hidden';
                } else if (
                  !models[rootVal.modelKey].fields[rootVal.fieldPath].graphql.isEnabled.update
                ) {
                  return 'read';
                }
                const modelConfig = config.models[rootVal.modelKey];

                const sessionFunction =
                  models[rootVal.modelKey].fields[rootVal.fieldPath].ui?.itemView?.fieldMode ??
                  modelConfig.ui?.itemView?.defaultFieldMode ??
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
                  rootVal.modelKey,
                  rootVal.itemId
                ).then(item => {
                  if (item === null) {
                    return 'hidden' as const;
                  }
                  return runMaybeFunction(sessionFunction, 'edit', {
                    session: context.session,
                    context,
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
        type: QueryMode,
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
  const commonListMetaFields = graphql.fields<ModelMetaRootVal>()({
    key: graphql.field({ type: graphql.nonNull(graphql.String) }),
    path: graphql.field({ type: graphql.nonNull(graphql.String) }),
    label: graphql.field({ type: graphql.nonNull(graphql.String) }),
    singular: graphql.field({ type: graphql.nonNull(graphql.String) }),
    description: graphql.field({ type: graphql.String }),
    fields: graphql.field({
      type: graphql.nonNull(graphql.list(graphql.nonNull(KeystoneAdminUIFieldMeta))),
    }),
    isHidden: graphql.field({
      type: graphql.nonNull(graphql.Boolean),
      resolve(rootVal, args, context) {
        if ('isAdminUIBuildProcess' in context) {
          throw new Error(
            'KeystoneAdminUISchemaMeta.isHidden cannot be resolved during the build process'
          );
        }
        const modelConfig = config.models[rootVal.key];
        return runMaybeFunction(modelConfig.ui?.isHidden, false, {
          session: context.session,
          context,
        });
      },
    }),
  });

  const names = {
    list: 'KeystoneAdminUIListMeta',
    singleton: 'KeystoneAdminUISingletonMeta',
  };

  const KeystoneAdminUIModelMeta = graphql.interface<ModelMetaRootVal>()({
    name: 'KeystoneAdminUISchemaMeta',
    fields: commonListMetaFields,
    resolveType: value => names[value.kind],
  });

  const KeystoneAdminUIListMeta = graphql.object<ListMetaRootVal>()({
    name: names.list,
    interfaces: [KeystoneAdminUIModelMeta],
    fields: {
      ...commonListMetaFields,
      graphqlPlural: graphql.field({
        type: graphql.nonNull(graphql.String),
      }),
      plural: graphql.field({ type: graphql.nonNull(graphql.String) }),
      hideCreate: graphql.field({
        type: graphql.nonNull(graphql.Boolean),
        resolve(rootVal, args, context) {
          if ('isAdminUIBuildProcess' in context) {
            throw new Error(
              'KeystoneAdminUISchemaMeta.hideCreate cannot be resolved during the build process'
            );
          }
          const modelConfig = config.models[rootVal.key];
          return runMaybeFunction(
            modelConfig.kind === 'list' && modelConfig.ui?.hideCreate,
            false,
            {
              session: context.session,
              context,
            }
          );
        },
      }),
      hideDelete: graphql.field({
        type: graphql.nonNull(graphql.Boolean),
        resolve(rootVal, args, context) {
          if ('isAdminUIBuildProcess' in context) {
            throw new Error(
              'KeystoneAdminUISchemaMeta.hideDelete cannot be resolved during the build process'
            );
          }
          const modelConfig = config.models[rootVal.key];
          if (modelConfig.kind === 'singleton') {
            assertUnhandledSingletonCase();
          }
          return runMaybeFunction(modelConfig.ui?.hideDelete, false, {
            session: context.session,
            context,
          });
        },
      }),
      initialColumns: graphql.field({
        type: graphql.nonNull(graphql.list(graphql.nonNull(graphql.String))),
      }),
      pageSize: graphql.field({ type: graphql.nonNull(graphql.Int) }),
      labelField: graphql.field({ type: graphql.nonNull(graphql.String) }),
      initialSort: graphql.field({ type: KeystoneAdminUISort }),
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
      models: graphql.field({
        type: graphql.nonNull(graphql.list(graphql.nonNull(KeystoneAdminUIModelMeta))),
      }),
      model: graphql.field({
        type: KeystoneAdminUIModelMeta,
        args: {
          key: graphql.arg({
            type: graphql.nonNull(graphql.String),
          }),
        },
        resolve(rootVal, { key }) {
          return rootVal.modelByKey[key];
        },
      }),
    },
  });

  const KeystoneMeta = graphql.nonNull(
    graphql.object<{}>()({
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
  return {
    types: [KeystoneAdminUIListMeta],
    fields: {
      keystone: graphql.field({
        type: KeystoneMeta,
        resolve() {
          return {};
        },
      }),
    },
  };
}

type FieldIdentifier = { modelKey: string; fieldPath: string };

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
