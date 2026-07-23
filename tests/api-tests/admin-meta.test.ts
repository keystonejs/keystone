import { expect, test } from 'vitest'
import { group, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { integer, text } from '@keystone-6/core/fields'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { adminMetaQuery } from '../../packages/core/src/admin-ui/admin-meta-graphql'
import { dbProvider } from './utils'

const runner = setupTestRunner({
  config: {
    ui: {
      isAccessAllowed: () => false,
    },
    lists: {
      User: list({
        access: allowAll,
        fieldDefaults: {
          ui: {
            createView: { fieldMode: 'hidden' },
            itemView: { fieldMode: 'read' },
            listView: { fieldMode: 'hidden' },
          },
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
  },
})

test(
  'non-sudo context does not bypass isAccessAllowed for admin meta',
  runner(async ({ context }) => {
    const res = await context.graphql.raw({ query: adminMetaQuery })
    expect(res).toMatchInlineSnapshot(`
      {
        "data": null,
        "errors": [
          [GraphQLError: Access denied],
        ],
      }
    `)
  })
)

test(
  'sudo context bypasses isAccessAllowed for admin meta',
  runner(async ({ context }) => {
    const data = await context.sudo().graphql.run({ query: adminMetaQuery })
    expect(data).toEqual({
      keystone: {
        adminMeta: {
          lists: [
            {
              fields: [
                {
                  key: 'id',
                  label: 'Id',
                  description: '',
                  search: null,
                  viewsIndex: 0,
                  createView: {
                    fieldMode: 'hidden',
                    isRequired: false,
                  },
                  isFilterable: true,
                  isOrderable: true,
                  listView: {
                    fieldMode: 'hidden',
                  },
                  customViewsIndex: null,
                  fieldMeta: {
                    kind: 'cuid',
                    type: 'String',
                  },
                  isNonNull: [],
                  itemView: {
                    fieldMode: 'read',
                    fieldPosition: 'sidebar',
                    isRequired: false,
                  },
                },
                {
                  key: 'name',
                  label: 'Name',
                  description: '',
                  createView: {
                    fieldMode: 'edit',
                    isRequired: false,
                  },
                  isFilterable: true,
                  isOrderable: true,
                  listView: {
                    fieldMode: 'read',
                  },
                  customViewsIndex: null,
                  fieldMeta: {
                    defaultValue: '',
                    displayMode: 'input',
                    isNullable: false,
                    shouldUseModeInsensitive: dbProvider === 'postgresql',
                    validation: {
                      length: {
                        max: null,
                        min: null,
                      },
                      match: null,
                    },
                  },
                  isNonNull: [],
                  itemView: {
                    fieldMode: 'hidden',
                    fieldPosition: 'form',
                    isRequired: false,
                  },
                  search: dbProvider === 'postgresql' ? 'insensitive' : 'default',
                  viewsIndex: 1,
                },
                {
                  key: 'something',
                  label: 'Something',
                  description: '',
                  search: null,
                  viewsIndex: 2,
                  createView: {
                    fieldMode: 'hidden',
                    isRequired: false,
                  },
                  isFilterable: true,
                  isOrderable: true,
                  listView: {
                    fieldMode: 'hidden',
                  },
                  customViewsIndex: null,
                  fieldMeta: {
                    defaultValue: null,
                    validation: {
                      max: 2147483647,
                      min: -2147483648,
                    },
                  },
                  isNonNull: [],
                  itemView: {
                    fieldMode: 'read',
                    fieldPosition: 'form',
                    isRequired: false,
                  },
                },
              ],
              graphql: {
                names: {
                  createInputName: 'UserCreateInput',
                  createManyMutationName: 'createUsers',
                  createMutationName: 'createUser',
                  deleteManyMutationName: 'deleteUsers',
                  deleteMutationName: 'deleteUser',
                  itemQueryName: 'user',
                  listOrderName: 'UserOrderByInput',
                  listQueryCountName: 'usersCount',
                  listQueryName: 'users',
                  outputTypeName: 'User',
                  relateToManyForCreateInputName: 'UserRelateToManyForCreateInput',
                  relateToManyForUpdateInputName: 'UserRelateToManyForUpdateInput',
                  relateToOneForCreateInputName: 'UserRelateToOneForCreateInput',
                  relateToOneForUpdateInputName: 'UserRelateToOneForUpdateInput',
                  updateInputName: 'UserUpdateInput',
                  updateManyInputName: 'UserUpdateArgs',
                  updateManyMutationName: 'updateUsers',
                  updateMutationName: 'updateUser',
                  whereInputName: 'UserWhereInput',
                  whereUniqueInputName: 'UserWhereUniqueInput',
                },
              },
              actions: [],
              groups: [],
              hideCreate: false,
              hideDelete: false,
              hideNavigation: false,
              initialColumns: ['name', 'something'],
              initialSearchFields: ['name'],
              initialSort: null,
              initialFilter: {},
              hiddenFilter: null,
              key: 'User',
              label: 'Users',
              labelField: 'name',
              pageSize: 50,
              path: 'users',
              plural: 'Users',
              singular: 'User',
              isSingleton: false,
            },
          ],
        },
      },
    })
  })
)

const names = {
  label: 'Test Stuff',
  plural: 'Test Things',
  singular: 'Test Thing',
  path: 'thing',
}

const gql = ([content]: TemplateStringsArray) => content

const runner2 = setupTestRunner({
  config: {
    lists: {
      Test: list({
        access: allowAll,
        fields: { name: text() },
        ui: names,
      }),
    },
  },
})

test(
  'ui.{label,plural,singular,path} are returned in the admin meta',
  runner2(async ({ context }) => {
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
    })
    expect(res.data!).toEqual({
      keystone: { adminMeta: { list: names } },
    })
  })
)

const runner3 = setupTestRunner({
  config: {
    lists: {
      Test: list({
        access: allowAll,
        fields: { name: text(), something: integer() },
        ui: {
          listView: {
            hiddenFilter: ({ session }) =>
              session
                ? {
                    name: {
                      contains: 'session',
                    },
                  }
                : {
                    something: {
                      gt: 10,
                    },
                  },
          },
        },
      }),
    },
  },
})

test(
  'ui.listView.hiddenFilter is returned in the admin meta',
  runner3(async ({ context }) => {
    const data = await context.sudo().graphql.run({
      query: gql`
        query {
          keystone {
            adminMeta {
              list(key: "Test") {
                initialFilter
                hiddenFilter
              }
            }
          }
        }
      `,
    })
    expect(data).toEqual({
      keystone: {
        adminMeta: {
          list: {
            initialFilter: {},
            hiddenFilter: {
              something: {
                gt: 10,
              },
            },
          },
        },
      },
    })
  })
)

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
                  key
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
    })
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
                    "key": "id",
                    "listView": {
                      "fieldMode": "hidden",
                    },
                  },
                  {
                    "createView": {
                      "fieldMode": "edit",
                    },
                    "key": "name",
                    "listView": {
                      "fieldMode": "read",
                    },
                  },
                  {
                    "createView": {
                      "fieldMode": "hidden",
                    },
                    "key": "something",
                    "listView": {
                      "fieldMode": "hidden",
                    },
                  },
                ],
                "key": "User",
              },
            ],
          },
        },
      }
    `)
  })
)

const fieldDefaultsRunner = setupTestRunner({
  config: {
    lists: {
      FieldDefault: list({
        access: allowAll,
        fieldDefaults: {
          ui: {
            createView: { fieldMode: 'hidden' },
            itemView: { fieldMode: 'read' },
            listView: { fieldMode: 'hidden' },
          },
        },
        fields: {
          listDefault: text(),
          ...group({
            label: 'Group defaults',
            fieldDefaults: {
              ui: {
                createView: { fieldMode: 'edit' },
                itemView: { fieldMode: 'hidden' },
                listView: { fieldMode: 'read' },
              },
            },
            fields: {
              groupDefault: text(),
              fieldOverride: text({
                ui: {
                  createView: { fieldMode: 'hidden' },
                  itemView: { fieldMode: 'edit' },
                  listView: { fieldMode: 'hidden' },
                },
              }),
            },
          }),
        },
      }),
    },
  },
})

test(
  'fieldDefaults are applied in field, group, and list precedence order',
  fieldDefaultsRunner(async ({ context }) => {
    const data = await context.sudo().graphql.run({
      query: gql`
        query {
          keystone {
            adminMeta {
              list(key: "FieldDefault") {
                fields {
                  key
                  createView {
                    fieldMode
                  }
                  itemView {
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
    })

    expect(data).toEqual({
      keystone: {
        adminMeta: {
          list: {
            fields: [
              {
                key: 'id',
                createView: { fieldMode: 'hidden' },
                itemView: { fieldMode: 'read' },
                listView: { fieldMode: 'hidden' },
              },
              {
                key: 'listDefault',
                createView: { fieldMode: 'hidden' },
                itemView: { fieldMode: 'read' },
                listView: { fieldMode: 'hidden' },
              },
              {
                key: 'groupDefault',
                createView: { fieldMode: 'edit' },
                itemView: { fieldMode: 'hidden' },
                listView: { fieldMode: 'read' },
              },
              {
                key: 'fieldOverride',
                createView: { fieldMode: 'hidden' },
                itemView: { fieldMode: 'edit' },
                listView: { fieldMode: 'hidden' },
              },
            ],
          },
        },
      },
    })
  })
)
