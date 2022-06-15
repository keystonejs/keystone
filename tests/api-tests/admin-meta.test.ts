import { list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';
import { staticAdminMetaQuery } from '@keystone-6/core/src/admin-ui/admin-meta-graphql';
import { setupTestRunner } from '@keystone-6/core/testing';
import { apiTestConfig, dbProvider } from './utils';

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
    expect(data).toEqual({
      keystone: {
        __typename: 'KeystoneMeta',
        adminMeta: {
          __typename: 'KeystoneAdminMeta',
          enableSessionItem: false,
          enableSignout: false,
          lists: [
            {
              __typename: 'KeystoneAdminUIListMeta',
              description: null,
              fields: [
                {
                  __typename: 'KeystoneAdminUIFieldMeta',
                  customViewsIndex: null,
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
                    fieldMode: 'edit',
                  },
                  label: 'Name',
                  path: 'name',
                  search: dbProvider === 'postgresql' ? 'insensitive' : 'default',
                  viewsIndex: 1,
                },
              ],
              initialColumns: ['name'],
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
            },
          ],
        },
      },
    });
  })
);
