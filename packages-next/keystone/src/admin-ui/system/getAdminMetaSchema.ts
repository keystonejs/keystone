import { InitialisedList } from '@keystone-next/keystone/src/lib/core/types-for-lists';
import { types as tsgqlTypesFromTypesPkg } from '@keystone-next/types';
import {
  KeystoneContext,
  KeystoneConfig,
  AdminMetaRootVal,
  ListMetaRootVal,
  FieldMetaRootVal,
} from '@keystone-next/types';
import { bindTypesToContext } from '@ts-gql/schema';
import { GraphQLSchema, GraphQLObjectType } from 'graphql';

const types = bindTypesToContext<KeystoneContext | { isAdminUIBuildProcess: true }>();

export function getAdminMetaSchema({
  config,
  schema,
  lists,
  adminMeta: adminMetaRoot,
}: {
  adminMeta: AdminMetaRootVal;
  config: KeystoneConfig;
  lists: Record<string, InitialisedList>;
  schema: GraphQLSchema;
}) {
  const isAccessAllowed =
    config.session === undefined
      ? undefined
      : config.ui?.isAccessAllowed ?? (({ session }) => session !== undefined);
  const jsonScalar = tsgqlTypesFromTypesPkg.JSON;

  const KeystoneAdminUIFieldMeta = types.object<FieldMetaRootVal>()({
    name: 'KeystoneAdminUIFieldMeta',
    fields: {
      path: types.field({ type: types.nonNull(types.String) }),
      label: types.field({ type: types.nonNull(types.String) }),
      isOrderable: types.field({
        type: types.nonNull(types.Boolean),
      }),
      fieldMeta: types.field({ type: jsonScalar }),
      viewsIndex: types.field({ type: types.nonNull(types.Int) }),
      customViewsIndex: types.field({ type: types.Int }),
      createView: types.field({
        resolve(rootVal) {
          return { fieldPath: rootVal.path, listKey: rootVal.listKey };
        },
        type: types.nonNull(
          types.object<FieldIdentifier>()({
            name: 'KeystoneAdminUIFieldMetaCreateView',
            fields: {
              fieldMode: types.field({
                type: types.nonNull(
                  types.enum({
                    name: 'KeystoneAdminUIFieldMetaCreateViewFieldMode',
                    values: types.enumValues(['edit', 'hidden']),
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
      listView: types.field({
        resolve(rootVal) {
          return { fieldPath: rootVal.path, listKey: rootVal.listKey };
        },
        type: types.nonNull(
          types.object<FieldIdentifier>()({
            name: 'KeystoneAdminUIFieldMetaListView',
            fields: {
              fieldMode: types.field({
                type: types.nonNull(
                  types.enum({
                    name: 'KeystoneAdminUIFieldMetaListViewFieldMode',
                    values: types.enumValues(['read', 'hidden']),
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
      itemView: types.field({
        args: {
          id: types.arg({
            type: types.nonNull(types.ID),
          }),
        },
        resolve(rootVal, args) {
          return { fieldPath: rootVal.path, listKey: rootVal.listKey, itemId: args.id };
        },
        type: types.object<FieldIdentifier & { itemId: string }>()({
          name: 'KeystoneAdminUIFieldMetaItemView',
          fields: {
            fieldMode: types.field({
              type: types.nonNull(
                types.enum({
                  name: 'KeystoneAdminUIFieldMetaItemViewFieldMode',
                  values: types.enumValues(['edit', 'read', 'hidden']),
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
    },
  });

  const KeystoneAdminUISort = types.object<NonNullable<ListMetaRootVal['initialSort']>>()({
    name: 'KeystoneAdminUISort',
    fields: {
      field: types.field({ type: types.nonNull(types.String) }),
      direction: types.field({
        type: types.nonNull(
          types.enum({
            name: 'KeystoneAdminUISortDirection',
            values: types.enumValues(['ASC', 'DESC']),
          })
        ),
      }),
    },
  });

  const KeystoneAdminUIListMeta = types.object<ListMetaRootVal>()({
    name: 'KeystoneAdminUIListMeta',
    fields: {
      key: types.field({ type: types.nonNull(types.String) }),
      itemQueryName: types.field({
        type: types.nonNull(types.String),
      }),
      listQueryName: types.field({
        type: types.nonNull(types.String),
      }),
      hideCreate: types.field({
        type: types.nonNull(types.Boolean),
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
      hideDelete: types.field({
        type: types.nonNull(types.Boolean),
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
      path: types.field({ type: types.nonNull(types.String) }),
      label: types.field({ type: types.nonNull(types.String) }),
      singular: types.field({ type: types.nonNull(types.String) }),
      plural: types.field({ type: types.nonNull(types.String) }),
      description: types.field({ type: types.String }),
      initialColumns: types.field({
        type: types.nonNull(types.list(types.nonNull(types.String))),
      }),
      pageSize: types.field({ type: types.nonNull(types.Int) }),
      labelField: types.field({ type: types.nonNull(types.String) }),
      fields: types.field({
        type: types.nonNull(types.list(types.nonNull(KeystoneAdminUIFieldMeta))),
      }),
      initialSort: types.field({ type: KeystoneAdminUISort }),
      isHidden: types.field({
        type: types.nonNull(types.Boolean),
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

  const adminMeta = types.object<AdminMetaRootVal>()({
    name: 'KeystoneAdminMeta',
    fields: {
      enableSignout: types.field({
        type: types.nonNull(types.Boolean),
      }),
      enableSessionItem: types.field({
        type: types.nonNull(types.Boolean),
      }),
      lists: types.field({
        type: types.nonNull(types.list(types.nonNull(KeystoneAdminUIListMeta))),
      }),
      list: types.field({
        type: KeystoneAdminUIListMeta,
        args: {
          key: types.arg({
            type: types.nonNull(types.String),
          }),
        },
        resolve(rootVal, { key }) {
          return rootVal.listsByKey[key];
        },
      }),
    },
  });

  const KeystoneMeta = types.nonNull(
    types.object<{ adminMeta: AdminMetaRootVal }>()({
      name: 'KeystoneMeta',
      fields: {
        adminMeta: types.field({
          type: types.nonNull(adminMeta),
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
  const schemaConfig = schema.toConfig();
  const queryTypeConfig = schema.getQueryType()!.toConfig();
  return new GraphQLSchema({
    ...schemaConfig,
    // TODO: fix the fact that this would be broken if types used the Query type
    types: schemaConfig.types.filter(x => x.name !== 'Query'),
    query: new GraphQLObjectType({
      ...queryTypeConfig,
      fields: () => ({
        ...(typeof queryTypeConfig.fields === 'function'
          ? queryTypeConfig.fields()
          : queryTypeConfig.fields),
        keystone: {
          type: KeystoneMeta.graphQLType,
          resolve() {
            return {};
          },
        },
      }),
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

// function collectReferencedTypes(
//   type: GraphQLType,
//   typesFound: Map<string, GraphQLNamedType>
// ): void {
//   const namedType = getNamedType(type);
//   const expectedType = typesFound.get(namedType.name);
//   if (namedType.name === 'JSON') {
//     debugger;
//   }
//   if (expectedType === namedType) {
//     return;
//   }
//   if (expectedType !== undefined) {
//     debugger;
//   }

//   typesFound.set(namedType.name, namedType);
//   if (isUnionType(namedType)) {
//     for (const memberType of namedType.getTypes()) {
//       collectReferencedTypes(memberType, typesFound);
//     }
//   } else if (isObjectType(namedType) || isInterfaceType(namedType)) {
//     for (const interfaceType of namedType.getInterfaces()) {
//       collectReferencedTypes(interfaceType, typesFound);
//     }

//     for (const field of Object.values(namedType.getFields())) {
//       collectReferencedTypes(field.type, typesFound);
//       for (const arg of field.args) {
//         collectReferencedTypes(arg.type, typesFound);
//       }
//     }
//   } else if (isInputObjectType(namedType)) {
//     for (const field of Object.values(namedType.getFields())) {
//       collectReferencedTypes(field.type, typesFound);
//     }
//   }
// }
