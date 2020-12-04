import { mergeSchemas } from '@graphql-tools/merge';
import { GraphQLSchema } from 'graphql';
import { gql } from '../apollo';
import { StaticAdminMetaQueryWithoutTypeNames } from '../admin-meta-graphql';
import { KeystoneSystem, KeystoneContext } from '@keystone-next/types';

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
    customViews: Int
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
  graphQLSchema,
  config,
}: {
  adminMeta: KeystoneSystem['adminMeta'];
  config: KeystoneSystem['config'];
  graphQLSchema: GraphQLSchema;
}) {
  type AdminMeta = StaticAdminMetaQueryWithoutTypeNames['keystone']['adminMeta'];
  type ListMetaRootVal = AdminMeta['lists'][number];
  type FieldMetaRootVal = AdminMeta['lists'][number]['fields'][number];
  type ListByKey = Record<string, ListMetaRootVal>;
  const lists: AdminMeta['lists'] = Object.values(adminMeta.lists).map(
    ({ gqlNames, fields, ...list }) => {
      return {
        ...list,
        itemQueryName: gqlNames.itemQueryName,
        listQueryName: gqlNames.listQueryName.replace('all', ''),
        fields: Object.keys(fields)
          .filter(
            fieldPath => config.lists[list.key].fields[fieldPath].config.access?.read !== false
          )
          .map(fieldPath => {
            return {
              path: fieldPath,
              listKey: list.key,
              ...fields[fieldPath],
            };
          }),
      };
    }
  );
  const listsByKey: ListByKey = {};
  for (const list of lists) {
    listsByKey[list.key] = list;
  }
  type StaticAdminMeta = AdminMeta & { listsByKey: ListByKey };
  const staticAdminMeta: StaticAdminMeta = { ...adminMeta, lists, listsByKey };

  const isAccessAllowed =
    config.session === undefined
      ? undefined
      : config.ui?.isAccessAllowed ?? (({ session }) => session !== undefined);

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
        adminMeta(
          rootVal: any,
          args: any,
          context: { isAdminUIBuildProcess: true } | KeystoneContext
        ) {
          if ('isAdminUIBuildProcess' in context || isAccessAllowed === undefined) {
            return staticAdminMeta;
          }
          return Promise.resolve(isAccessAllowed({ session: context.session })).then(isAllowed => {
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
          return runMaybeFunction(config.lists[rootVal.key].ui?.isHidden, false, { session });
        },
        hideDelete(rootVal: ListMetaRootVal, args: any, { session }: any) {
          return runMaybeFunction(config.lists[rootVal.key].ui?.hideDelete, false, {
            session,
          });
        },
        hideCreate(rootVal: ListMetaRootVal, args: any, { session }: any) {
          return runMaybeFunction(config.lists[rootVal.key].ui?.hideCreate, false, {
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
            config.lists[rootVal.listKey].fields[rootVal.fieldPath].config.ui?.createView
              ?.fieldMode ?? config.lists[rootVal.listKey].ui?.createView?.defaultFieldMode,
            'edit',
            { session }
          );
        },
      },
      KeystoneAdminUIFieldMetaListView: {
        fieldMode(rootVal: FieldIdentifier, args: any, { session }: any) {
          return runMaybeFunction(
            config.lists[rootVal.listKey].fields[rootVal.fieldPath].config.ui?.listView
              ?.fieldMode ?? config.lists[rootVal.listKey].ui?.listView?.defaultFieldMode,
            'read',
            { session }
          );
        },
      },
      KeystoneAdminUIFieldMetaItemView: {
        async fieldMode(
          rootVal: FieldIdentifier & { itemId: string },
          args: any,
          { lists, session }: any
        ) {
          const item = await lists[rootVal.listKey].findOne({ where: { id: rootVal.itemId } });

          return runMaybeFunction(
            config.lists[rootVal.listKey].fields[rootVal.fieldPath].config.ui?.itemView
              ?.fieldMode ?? config.lists[rootVal.listKey].ui?.itemView?.defaultFieldMode,
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
