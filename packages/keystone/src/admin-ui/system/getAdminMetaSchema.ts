import { JSONValue, schema as schemaAPIFromTypesPkg } from '@keystone-next/types';
import {
  KeystoneContext,
  KeystoneConfig,
  AdminMetaRootVal,
  ListMetaRootVal,
  FieldMetaRootVal,
} from '@keystone-next/types';
import { GraphQLSchema, GraphQLObjectType, assertScalarType } from 'graphql';
import { InitialisedList } from '../../lib/core/types-for-lists';

const schema = {
  ...schemaAPIFromTypesPkg,
  ...schemaAPIFromTypesPkg.bindSchemaAPIToContext<
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
    ? schema.scalar<JSONValue>(assertScalarType(jsonScalarType))
    : schemaAPIFromTypesPkg.JSON;

  const KeystoneAdminUIFieldMeta = schema.object<FieldMetaRootVal>()({
    name: 'KeystoneAdminUIFieldMeta',
    fields: {
      path: schema.field({ type: schema.nonNull(schema.String) }),
      label: schema.field({ type: schema.nonNull(schema.String) }),
      isOrderable: schema.field({
        type: schema.nonNull(schema.Boolean),
      }),
      fieldMeta: schema.field({ type: jsonScalar }),
      viewsIndex: schema.field({ type: schema.nonNull(schema.Int) }),
      customViewsIndex: schema.field({ type: schema.Int }),
      createView: schema.field({
        resolve(rootVal) {
          return { fieldPath: rootVal.path, listKey: rootVal.listKey };
        },
        type: schema.nonNull(
          schema.object<FieldIdentifier>()({
            name: 'KeystoneAdminUIFieldMetaCreateView',
            fields: {
              fieldMode: schema.field({
                type: schema.nonNull(
                  schema.enum({
                    name: 'KeystoneAdminUIFieldMetaCreateViewFieldMode',
                    values: schema.enumValues(['edit', 'hidden']),
                  })
                ),
                async resolve(rootVal, args, context) {
                  if ('isAdminUIBuildProcess' in context) {
                    throw new Error(
                      'KeystoneAdminUIFieldMetaCreateView.fieldMode cannot be resolved during the build process'
                    );
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
      listView: schema.field({
        resolve(rootVal) {
          return { fieldPath: rootVal.path, listKey: rootVal.listKey };
        },
        type: schema.nonNull(
          schema.object<FieldIdentifier>()({
            name: 'KeystoneAdminUIFieldMetaListView',
            fields: {
              fieldMode: schema.field({
                type: schema.nonNull(
                  schema.enum({
                    name: 'KeystoneAdminUIFieldMetaListViewFieldMode',
                    values: schema.enumValues(['read', 'hidden']),
                  })
                ),
                async resolve(rootVal, args, context) {
                  if ('isAdminUIBuildProcess' in context) {
                    throw new Error(
                      'KeystoneAdminUIFieldMetaListView.fieldMode cannot be resolved during the build process'
                    );
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
      itemView: schema.field({
        args: {
          id: schema.arg({
            type: schema.nonNull(schema.ID),
          }),
        },
        resolve(rootVal, args) {
          return { fieldPath: rootVal.path, listKey: rootVal.listKey, itemId: args.id };
        },
        type: schema.object<FieldIdentifier & { itemId: string }>()({
          name: 'KeystoneAdminUIFieldMetaItemView',
          fields: {
            fieldMode: schema.field({
              type: schema.nonNull(
                schema.enum({
                  name: 'KeystoneAdminUIFieldMetaItemViewFieldMode',
                  values: schema.enumValues(['edit', 'read', 'hidden']),
                })
              ),
              async resolve(rootVal, args, context) {
                if ('isAdminUIBuildProcess' in context) {
                  throw new Error(
                    'KeystoneAdminUIFieldMetaItemView.fieldMode cannot be resolved during the build process'
                  );
                }
                const item = await context
                  .sudo()
                  .db.lists[rootVal.listKey].findOne({ where: { id: rootVal.itemId } });
                const listConfig = config.lists[rootVal.listKey];
                const sessionFunction =
                  lists[rootVal.listKey].fields[rootVal.fieldPath].ui?.itemView?.fieldMode ??
                  listConfig.ui?.itemView?.defaultFieldMode;
                return runMaybeFunction(sessionFunction, 'edit', {
                  session: context.session,
                  item,
                });
              },
            }),
          },
        }),
      }),
      search: schema.field({
        type: schema.enum({
          name: 'KeystoneAdminUIFieldMetaSearchMode',
          values: schema.enumValues(['sensitive', 'insensitive']),
        }),
      }),
    },
  });

  const KeystoneAdminUISort = schema.object<NonNullable<ListMetaRootVal['initialSort']>>()({
    name: 'KeystoneAdminUISort',
    fields: {
      field: schema.field({ type: schema.nonNull(schema.String) }),
      direction: schema.field({
        type: schema.nonNull(
          schema.enum({
            name: 'KeystoneAdminUISortDirection',
            values: schema.enumValues(['ASC', 'DESC']),
          })
        ),
      }),
    },
  });

  const KeystoneAdminUIListMeta = schema.object<ListMetaRootVal>()({
    name: 'KeystoneAdminUIListMeta',
    fields: {
      key: schema.field({ type: schema.nonNull(schema.String) }),
      itemQueryName: schema.field({
        type: schema.nonNull(schema.String),
      }),
      listQueryName: schema.field({
        type: schema.nonNull(schema.String),
      }),
      hideCreate: schema.field({
        type: schema.nonNull(schema.Boolean),
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
      hideDelete: schema.field({
        type: schema.nonNull(schema.Boolean),
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
      path: schema.field({ type: schema.nonNull(schema.String) }),
      label: schema.field({ type: schema.nonNull(schema.String) }),
      singular: schema.field({ type: schema.nonNull(schema.String) }),
      plural: schema.field({ type: schema.nonNull(schema.String) }),
      description: schema.field({ type: schema.String }),
      initialColumns: schema.field({
        type: schema.nonNull(schema.list(schema.nonNull(schema.String))),
      }),
      pageSize: schema.field({ type: schema.nonNull(schema.Int) }),
      labelField: schema.field({ type: schema.nonNull(schema.String) }),
      fields: schema.field({
        type: schema.nonNull(schema.list(schema.nonNull(KeystoneAdminUIFieldMeta))),
      }),
      initialSort: schema.field({ type: KeystoneAdminUISort }),
      isHidden: schema.field({
        type: schema.nonNull(schema.Boolean),
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

  const adminMeta = schema.object<AdminMetaRootVal>()({
    name: 'KeystoneAdminMeta',
    fields: {
      enableSignout: schema.field({
        type: schema.nonNull(schema.Boolean),
      }),
      enableSessionItem: schema.field({
        type: schema.nonNull(schema.Boolean),
      }),
      lists: schema.field({
        type: schema.nonNull(schema.list(schema.nonNull(KeystoneAdminUIListMeta))),
      }),
      list: schema.field({
        type: KeystoneAdminUIListMeta,
        args: {
          key: schema.arg({
            type: schema.nonNull(schema.String),
          }),
        },
        resolve(rootVal, { key }) {
          return rootVal.listsByKey[key];
        },
      }),
    },
  });

  const KeystoneMeta = schema.nonNull(
    schema.object<{ adminMeta: AdminMetaRootVal }>()({
      name: 'KeystoneMeta',
      fields: {
        adminMeta: schema.field({
          type: schema.nonNull(adminMeta),
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
