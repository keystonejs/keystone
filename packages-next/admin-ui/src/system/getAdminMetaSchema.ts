import { gql } from '../apollo';
import { createAdminMeta } from './createAdminMeta';
import {
  KeystoneContext,
  KeystoneConfig,
  BaseKeystone,
  AdminMetaRootVal,
  ListMetaRootVal,
  FieldMetaRootVal,
} from '@keystone-next/types';

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
    viewsHash: String!
    customViewsHash: String
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

export function getAdminMetaSchema({
  keystone,
  config,
}: {
  keystone: BaseKeystone;
  config: KeystoneConfig;
}) {
  const adminMetaRoot = createAdminMeta(config, keystone);

  const isAccessAllowed =
    config.session === undefined
      ? undefined
      : config.ui?.isAccessAllowed ?? (({ session }) => session !== undefined);

  return {
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
      },
      KeystoneAdminMeta: {
        list(rootVal: AdminMetaRootVal, args: { key: string }) {
          return rootVal.listsByKey[args.key];
        },
      },
      KeystoneAdminUIListMeta: {
        isHidden(rootVal: ListMetaRootVal, args: any, { session }: KeystoneContext) {
          const listConfig = config.lists[rootVal.key];
          return runMaybeFunction(listConfig.ui?.isHidden, false, { session });
        },
        hideDelete(rootVal: ListMetaRootVal, args: any, { session }: KeystoneContext) {
          const listConfig = config.lists[rootVal.key];
          return runMaybeFunction(listConfig.ui?.hideDelete, false, { session });
        },
        hideCreate(rootVal: ListMetaRootVal, args: any, { session }: KeystoneContext) {
          const listConfig = config.lists[rootVal.key];
          return runMaybeFunction(listConfig.ui?.hideCreate, false, { session });
        },
      },
      KeystoneAdminUIFieldMeta: {
        createView(rootVal: FieldMetaRootVal): FieldIdentifier {
          return { fieldPath: rootVal.path, listKey: rootVal.listKey };
        },
        listView(rootVal: FieldMetaRootVal): FieldIdentifier {
          return { fieldPath: rootVal.path, listKey: rootVal.listKey };
        },
        itemView(
          rootVal: FieldMetaRootVal,
          args: { id: string }
        ): FieldIdentifier & { itemId: string } {
          return { listKey: rootVal.listKey, fieldPath: rootVal.path, itemId: args.id };
        },
      },
      KeystoneAdminUIFieldMetaCreateView: {
        fieldMode(rootVal: FieldIdentifier, args: any, { session }: KeystoneContext) {
          const listConfig = config.lists[rootVal.listKey];
          const sessionFunction =
            listConfig.fields[rootVal.fieldPath].config.ui?.createView?.fieldMode ??
            listConfig.ui?.createView?.defaultFieldMode;
          return runMaybeFunction(sessionFunction, 'edit', { session });
        },
      },
      KeystoneAdminUIFieldMetaListView: {
        fieldMode(rootVal: FieldIdentifier, args: any, { session }: KeystoneContext) {
          const listConfig = config.lists[rootVal.listKey];
          const sessionFunction =
            listConfig.fields[rootVal.fieldPath].config.ui?.listView?.fieldMode ??
            listConfig.ui?.listView?.defaultFieldMode;
          return runMaybeFunction(sessionFunction, 'read', { session });
        },
      },
      KeystoneAdminUIFieldMetaItemView: {
        async fieldMode(
          rootVal: FieldIdentifier & { itemId: string },
          args: any,
          context: KeystoneContext
        ) {
          const item = await context
            .createContext({ skipAccessControl: true })
            .lists[rootVal.listKey].findOne({
              where: { id: rootVal.itemId },
              resolveFields: false,
            });
          const listConfig = config.lists[rootVal.listKey];
          const sessionFunction =
            listConfig.fields[rootVal.fieldPath].config.ui?.itemView?.fieldMode ??
            listConfig.ui?.itemView?.defaultFieldMode;
          return runMaybeFunction(sessionFunction, 'edit', { session: context.session, item });
        },
      },
    },
  };
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
