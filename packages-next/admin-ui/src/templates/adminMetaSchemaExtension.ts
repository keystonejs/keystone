import { mergeSchemas } from '@graphql-tools/merge';
import { GraphQLSchema } from 'graphql';
import { gql } from '../apollo';
import { StaticAdminMetaQueryWithoutTypeNames } from '../admin-meta-graphql';
import { Keystone } from '@keystone-spike/types';

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
    fields: [KeystoneAdminUIFieldMeta!]!
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
`;

export function adminMetaSchemaExtension({
  adminMeta,
  isAccessAllowed,
  graphQLSchema,
}: {
  adminMeta: Keystone['adminMeta'];
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
    },
  });
}
