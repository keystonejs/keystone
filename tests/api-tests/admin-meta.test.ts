import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { integer, text } from '@keystone-6/core/fields';
import { setupTestRunner } from '@keystone-6/api-tests/test-runner';
import { staticAdminMetaQuery } from '../../packages/core/src/admin-ui/admin-meta-graphql';
import { testConfig, dbProvider } from './utils';

const runner = setupTestRunner({
  config: testConfig({
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
    config: testConfig({
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
