import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { integer, text } from '@keystone-6/core/fields';
import { setupTestRunner } from '@keystone-6/api-tests/test-runner';
import { staticAdminMetaQuery } from '../../packages/core/src/admin-ui/admin-meta-graphql';
import { apiTestConfig, dbProvider } from './utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    ui: {
      isAccessAllowed: () => false,
    },
    lists: {
      User: list({
        access: allowAll,
        ui: {
          createView: { defaultFieldMode: 'hidden' },
          itemView: { defaultFieldMode: 'read' },
          listView: { defaultFieldMode: 'hidden' },
        },
        fields: {
          name: text({
            ui: {
              createView: {
                fieldMode: 'edit',
              },
              itemView: { fieldMode: 'hidden' },
              listView: { fieldMode: 'read' },
            },
          }),
          something: integer(),
        },
      }),
    },
  }),
});

test(
  'non-sudo context does not bypass isAccessAllowed for admin meta',
  runner(async ({ context }) => {
    const res = await context.exitSudo().graphql.raw({ query: staticAdminMetaQuery });
    expect(res).toMatchInlineSnapshot(`
      {
        "data": null,
        "errors": [
          [GraphQLError: Access denied],
        ],
      }
    `);
  })
);

test(
  'sudo context bypasses isAccessAllowed for admin meta',
  runner(async ({ context }) => {
    const data = await context.sudo().graphql.run({ query: staticAdminMetaQuery });
    expect(data).toEqual({
      keystone: {
        __typename: 'KeystoneMeta',
        adminMeta: {
          __typename: 'KeystoneAdminMeta',
          lists: [
            {
              __typename: 'KeystoneAdminUIListMeta',
              description: null,
              fields: [
                {
                  __typename: 'KeystoneAdminUIFieldMeta',
                  customViewsIndex: null,
                  description: null,
                  fieldMeta: {
                    kind: 'cuid',
                  },
                  itemView: {
                    fieldMode: 'hidden',
                  },
                  label: 'Id',
                  path: 'id',
                  search: null,
                  viewsIndex: 0,
                },
                {
                  __typename: 'KeystoneAdminUIFieldMeta',
                  customViewsIndex: null,
                  description: null,
                  fieldMeta: {
                    defaultValue: '',
                    displayMode: 'input',
                    isNullable: false,
                    shouldUseModeInsensitive: dbProvider === 'postgresql',
                    validation: {
                      isRequired: false,
                      length: {
                        max: null,
                        min: null,
                      },
                      match: null,
                    },
                  },
                  itemView: {
                    fieldMode: 'hidden',
                  },
                  label: 'Name',
                  path: 'name',
                  search: dbProvider === 'postgresql' ? 'insensitive' : 'default',
                  viewsIndex: 1,
                },
                {
                  __typename: 'KeystoneAdminUIFieldMeta',
                  customViewsIndex: null,
                  description: null,
                  fieldMeta: {
                    defaultValue: null,
                    validation: {
                      isRequired: false,
                      max: 2147483647,
                      min: -2147483648,
                    },
                  },
                  itemView: {
                    fieldMode: 'read',
                  },
                  label: 'Something',
                  path: 'something',
                  search: null,
                  viewsIndex: 2,
                },
              ],
              groups: [],
              initialColumns: ['name', 'something'],
              initialSort: null,
              itemQueryName: 'User',
              key: 'User',
              label: 'Users',
              labelField: 'name',
              listQueryName: 'Users',
              pageSize: 50,
              path: 'users',
              plural: 'Users',
              singular: 'User',
              isSingleton: false,
            },
          ],
        },
      },
    });
  })
);

const names = {
  label: 'Test Stuff',
  plural: 'Test Things',
  singular: 'Test Thing',
  path: 'thing',
};

const gql = ([content]: TemplateStringsArray) => content;

test(
  'ui.{label,plural,singular,path} are returned in the admin meta',

  setupTestRunner({
    config: apiTestConfig({
      lists: {
        Test: list({
          access: allowAll,
          fields: { name: text() },
          ui: names,
        }),
      },
    }),
  })(async ({ context }) => {
    const res = await context.sudo().graphql.raw({
      query: gql`
        query {
          keystone {
            adminMeta {
              list(key: "Test") {
                label
                singular
                plural
                path
              }
            }
          }
        }
      `,
    });
    expect(res.data!).toEqual({
      keystone: { adminMeta: { list: names } },
    });
  })
);

test(
  'listView and createView',
  runner(async ({ context }) => {
    const data = await context.sudo().graphql.run({
      query: gql`
        query {
          keystone {
            adminMeta {
              lists {
                key
                fields {
                  path
                  createView {
                    fieldMode
                  }
                  listView {
                    fieldMode
                  }
                }
              }
            }
          }
        }
      `,
    });
    expect(data).toMatchInlineSnapshot(`
      {
        "keystone": {
          "adminMeta": {
            "lists": [
              {
                "fields": [
                  {
                    "createView": {
                      "fieldMode": "hidden",
                    },
                    "listView": {
                      "fieldMode": "hidden",
                    },
                    "path": "id",
                  },
                  {
                    "createView": {
                      "fieldMode": "edit",
                    },
                    "listView": {
                      "fieldMode": "read",
                    },
                    "path": "name",
                  },
                  {
                    "createView": {
                      "fieldMode": "hidden",
                    },
                    "listView": {
                      "fieldMode": "hidden",
                    },
                    "path": "something",
                  },
                ],
                "key": "User",
              },
            ],
          },
        },
      }
    `);
  })
);
