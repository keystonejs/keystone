import { list } from '@keystone-next/keystone';
import { text } from '@keystone-next/keystone/fields';
import { staticAdminMetaQuery } from '@keystone-next/keystone/src/admin-ui/admin-meta-graphql';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig } from './utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    ui: {
      isAccessAllowed: () => false,
    },
    lists: { User: list({ fields: { name: text() } }) },
  }),
});

test(
  'non-sudo context does not bypass isAccessAllowed for admin meta',
  runner(async ({ context }) => {
    const res = await context.exitSudo().graphql.raw({ query: staticAdminMetaQuery });
    expect(res).toMatchInlineSnapshot(`
      Object {
        "data": null,
        "errors": Array [
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
    expect(data).toMatchInlineSnapshot(`
      Object {
        "keystone": Object {
          "__typename": "KeystoneMeta",
          "adminMeta": Object {
            "__typename": "KeystoneAdminMeta",
            "enableSessionItem": false,
            "enableSignout": false,
            "lists": Array [
              Object {
                "__typename": "KeystoneAdminUIListMeta",
                "description": null,
                "fields": Array [
                  Object {
                    "__typename": "KeystoneAdminUIFieldMeta",
                    "customViewsIndex": null,
                    "fieldMeta": Object {
                      "kind": "cuid",
                    },
                    "itemView": Object {
                      "fieldMode": "hidden",
                    },
                    "label": "Id",
                    "path": "id",
                    "search": null,
                    "viewsIndex": 0,
                  },
                  Object {
                    "__typename": "KeystoneAdminUIFieldMeta",
                    "customViewsIndex": null,
                    "fieldMeta": Object {
                      "defaultValue": "",
                      "displayMode": "input",
                      "isNullable": false,
                      "shouldUseModeInsensitive": false,
                      "validation": Object {
                        "isRequired": false,
                        "length": Object {
                          "max": null,
                          "min": null,
                        },
                        "match": null,
                      },
                    },
                    "itemView": Object {
                      "fieldMode": "edit",
                    },
                    "label": "Name",
                    "path": "name",
                    "search": "default",
                    "viewsIndex": 1,
                  },
                ],
                "initialColumns": Array [
                  "name",
                ],
                "initialSort": null,
                "itemQueryName": "User",
                "key": "User",
                "label": "Users",
                "labelField": "name",
                "listQueryName": "Users",
                "pageSize": 50,
                "path": "users",
                "plural": "Users",
                "singular": "User",
              },
            ],
          },
        },
      }
    `);
  })
);
