import { mergeSchemas } from '@graphql-tools/merge';
import { GraphQLSchema } from 'graphql';
import { gql } from '../apollo';
import { StaticAdminMetaQueryWithoutTypeNames } from '../admin-meta-graphql';
import { Keystone } from '@keystone-next/types';

let typeDefs = gql`
  type Query {
    keystone: KeystoneMeta!
  }
  type KeystoneMeta {
    adminMeta: KeystoneAdminMeta!
  }

  type KeystoneAdminMeta {
    enableSignout: Boolean!
    enableSessionItem: Boolean!
    lists: [KeystoneAdminUIListMeta!]!
    list(key: String!): KeystoneAdminUIListMeta
  }

  type KeystoneAdminUIListMeta {
    key: String!
    itemQueryName: String!
    listQueryName: String!
    hideCreate: Boolean!
    hideDelete: Boolean!
    path: String!
    label: String!
    singular: String!
    plural: String!
    description: String
    initialColumns: [String!]!
    pageSize: Int!
    labelField: String!
    fields: [KeystoneAdminUIFieldMeta!]!
    initialSort: KeystoneAdminUISort
    isHidden: Boolean!
  }

  type KeystoneAdminUISort {
    field: String!
    direction: KeystoneAdminUISortDirection!
  }

  type KeystoneAdminUIFieldMeta {
    path: String!
    label: String!
    isOrderable: Boolean!
    fieldMeta: JSON
    views: Int!
    createView: KeystoneAdminUIFieldMetaCreateView!
    listView: KeystoneAdminUIFieldMetaListView!
    itemView(id: ID!): KeystoneAdminUIFieldMetaItemView
  }

  type KeystoneAdminUIFieldMetaCreateView {
    fieldMode: KeystoneAdminUIFieldMetaCreateViewFieldMode!
  }
  type KeystoneAdminUIFieldMetaListView {
    fieldMode: KeystoneAdminUIFieldMetaListViewFieldMode!
  }
  type KeystoneAdminUIFieldMetaItemView {
    fieldMode: KeystoneAdminUIFieldMetaItemViewFieldMode!
  }

  enum KeystoneAdminUIFieldMetaCreateViewFieldMode {
    edit
    hidden
  }
  enum KeystoneAdminUIFieldMetaListViewFieldMode {
    read
    hidden
  }
  enum KeystoneAdminUIFieldMetaItemViewFieldMode {
    edit
    read
    hidden
  }
  enum KeystoneAdminUISortDirection {
    ASC
    DESC
  }
`;

export function adminMetaSchemaExtension({
  adminMeta,
  isAccessAllowed,
  graphQLSchema,
  config,
}: {
  adminMeta: Keystone['adminMeta'];
  config: Keystone['config'];
  graphQLSchema: GraphQLSchema;
  isAccessAllowed: undefined | ((args: { session: any }) => boolean | Promise<boolean>);
}) {
  const lists: StaticAdminMetaQueryWithoutTypeNames['keystone']['adminMeta']['lists'] = Object.values(
    adminMeta.lists
  ).map(({ gqlNames, fields, ...list }) => {
    return {
      ...list,
      itemQueryName: gqlNames.itemQueryName,
      listQueryName: gqlNames.listQueryName.replace('all', ''),
      fields: Object.keys(fields).map(fieldPath => {
        return {
          path: fieldPath,
          listKey: list.key,
          ...fields[fieldPath],
        };
      }),
    };
  });
  const listsByKey: Record<
    string,
    StaticAdminMetaQueryWithoutTypeNames['keystone']['adminMeta']['lists'][number]
  > = {};
  for (const list of lists) {
    listsByKey[list.key] = list;
  }
  const staticAdminMeta: StaticAdminMetaQueryWithoutTypeNames['keystone']['adminMeta'] & {
    listsByKey: typeof listsByKey;
  } = {
    ...adminMeta,
    lists,
    listsByKey,
  };

  type ListMetaRootVal = typeof staticAdminMeta['lists'][number];
  type FieldMetaRootVal = ListMetaRootVal['fields'][number];

  return mergeSchemas({
    schemas: [graphQLSchema],
    typeDefs,
    resolvers: {
      Query: {
        keystone() {
          return {};
        },
      },
      KeystoneMeta: {
        adminMeta(rootVal: any, args: any, ctx: any) {
          if (ctx.isAdminUIBuildProcess || isAccessAllowed === undefined) {
            return staticAdminMeta;
          }
          return Promise.resolve(isAccessAllowed({ session: ctx.session })).then(isAllowed => {
            if (isAllowed) {
              return staticAdminMeta;
            }
            // TODO: ughhhhhh, we really need to talk about errors.
            // mostly unrelated to above: error or return null here(+ make field nullable)?s
            throw new Error('Access denied');
          });
        },
      },
      KeystoneAdminMeta: {
        list(rootVal: typeof staticAdminMeta, args: { key: string }) {
          return rootVal.listsByKey[args.key];
        },
      },
      KeystoneAdminUIListMeta: {
        isHidden(rootVal: ListMetaRootVal, args: any, { session }: any) {
          return runMaybeFunction(config.lists[rootVal.key].admin?.isHidden, false, { session });
        },
        hideDelete(rootVal: ListMetaRootVal, args: any, { session }: any) {
          return runMaybeFunction(config.lists[rootVal.key].admin?.hideDelete, false, {
            session,
          });
        },
        hideCreate(rootVal: ListMetaRootVal, args: any, { session }: any) {
          return runMaybeFunction(config.lists[rootVal.key].admin?.hideCreate, false, {
            session,
          });
        },
      },
      KeystoneAdminUIFieldMeta: {
        createView(rootVal: FieldMetaRootVal): FieldIdentifier {
          return {
            fieldPath: rootVal.path,
            listKey: rootVal.listKey,
          };
        },
        listView(rootVal: FieldMetaRootVal): FieldIdentifier {
          return {
            fieldPath: rootVal.path,
            listKey: rootVal.listKey,
          };
        },
        itemView(
          rootVal: FieldMetaRootVal,
          args: { id: string }
        ): FieldIdentifier & { itemId: string } {
          return {
            listKey: rootVal.listKey,
            fieldPath: rootVal.path,
            itemId: args.id,
          };
        },
      },
      KeystoneAdminUIFieldMetaCreateView: {
        fieldMode(rootVal: FieldIdentifier, args: any, { session }: any) {
          return runMaybeFunction(
            config.lists[rootVal.listKey].fields[rootVal.fieldPath].config.admin?.createView
              ?.fieldMode ?? config.lists[rootVal.listKey].admin?.createView?.defaultFieldMode,
            'edit',
            { session }
          );
        },
      },
      KeystoneAdminUIFieldMetaListView: {
        fieldMode(rootVal: FieldIdentifier, args: any, { session }: any) {
          return runMaybeFunction(
            config.lists[rootVal.listKey].fields[rootVal.fieldPath].config.admin?.listView
              ?.fieldMode ?? config.lists[rootVal.listKey].admin?.listView?.defaultFieldMode,
            'read',
            { session }
          );
        },
      },
      KeystoneAdminUIFieldMetaItemView: {
        async fieldMode(
          rootVal: FieldIdentifier & { itemId: string },
          args: any,
          { crud, session }: any
        ) {
          const item = await crud[rootVal.listKey].findOne({ where: { id: rootVal.itemId } });

          return runMaybeFunction(
            config.lists[rootVal.listKey].fields[rootVal.fieldPath].config.admin?.itemView
              ?.fieldMode ?? config.lists[rootVal.listKey].admin?.itemView?.defaultFieldMode,
            'edit',
            { session, item }
          );
        },
      },
    },
  });
}

type FieldIdentifier = { listKey: string; fieldPath: string };

type NoInfer<T> = T & { [K in keyof T]: T[K] };

function runMaybeFunction<Return extends string | boolean>(
  sessionFunction: Return | ((args: any) => Return | Promise<Return>) | undefined,
  defaultValue: NoInfer<Return>,
  args: any
): Return | Promise<Return> {
  if (typeof sessionFunction === 'function') {
    return sessionFunction(args);
  }
  if (typeof sessionFunction === 'undefined') {
    return defaultValue;
  }
  return sessionFunction;
}
