import { expect, test } from 'vitest'
import { IncomingMessage } from 'node:http'
import { Socket } from 'node:net'
import { group, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { integer, select, text } from '@keystone-6/core/fields'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { adminMetaQuery } from '../../packages/core/src/admin-ui/admin-meta-graphql.ts'
import { dbProvider } from './utils.ts'

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

let resolveAdminMetaCalls = 0
let expectedResolveAdminMetaContext: object | undefined

const hookRunner = setupTestRunner({
  config: {
    ui: {
      hooks: {
        resolveAdminMeta: ({ adminMeta, context }) => {
          resolveAdminMetaCalls++
          if (expectedResolveAdminMetaContext) {
            expect(context).toBe(expectedResolveAdminMetaContext)
          }

          const locale = (context.session as { locale?: string } | undefined)?.locale
          if (locale === 'error') throw new Error('resolveAdminMeta failed')
          if (locale === 'mutate') {
            adminMeta.lists[0].label = 'Mutated Articles'
            return adminMeta
          }

          const headerLabel = context.req?.headers['x-admin-meta-label']
          if (headerLabel) {
            adminMeta.lists[0].label = Array.isArray(headerLabel) ? headerLabel[0] : headerLabel
          } else if (locale === 'de') {
            expect('listsByKey' in adminMeta).toBe(false)
            expect('isAccessAllowed' in adminMeta).toBe(false)
            expect(typeof adminMeta.lists[0].hideNavigation).toBe('boolean')
            expect(typeof adminMeta.lists[0].fields[0].isFilterable).toBe('boolean')
            adminMeta.lists[0].label = 'Artikel'
          } else if (locale === 'async') {
            return Promise.resolve({
              ...adminMeta,
              lists: adminMeta.lists.map(list => ({ ...list, label: 'Async Articles' })),
            })
          }

          return adminMeta
        },
      },
    },
    lists: {
      Article: list({
        access: allowAll,
        fields: { title: text() },
        ui: {
          label: 'Articles',
          hideNavigation: ({ session }) =>
            (session as { locale?: string } | undefined)?.locale === 'de',
        },
      }),
    },
  },
})

const hookQuery = gql`
  query {
    keystone {
      adminMeta {
        lists {
          key
          label
          hideNavigation
        }
      }
    }
  }
`

test(
  'resolveAdminMeta supports synchronous hooks and receives resolved request context',
  hookRunner(async ({ context }) => {
    resolveAdminMetaCalls = 0
    const requestContext = context.withSession({ locale: 'de' })
    const queryContext = requestContext.sudo()
    expectedResolveAdminMetaContext = queryContext

    const data = (await queryContext.graphql.run({ query: hookQuery })) as any

    expect(data.keystone.adminMeta.lists).toEqual([
      { key: 'Article', label: 'Artikel', hideNavigation: true },
    ])
    expect(resolveAdminMetaCalls).toBe(1)
    expectedResolveAdminMetaContext = undefined
  })
)

test(
  'resolveAdminMeta awaits asynchronous hooks',
  hookRunner(async ({ context }) => {
    resolveAdminMetaCalls = 0
    const queryContext = context.withSession({ locale: 'async' }).sudo()
    expectedResolveAdminMetaContext = queryContext

    const data = (await queryContext.graphql.run({ query: hookQuery })) as any

    expect(data.keystone.adminMeta.lists[0].label).toBe('Async Articles')
    expect(resolveAdminMetaCalls).toBe(1)
    expectedResolveAdminMetaContext = undefined
  })
)

test(
  'resolveAdminMeta can read request headers',
  hookRunner(async ({ context }) => {
    resolveAdminMetaCalls = 0
    const req = new IncomingMessage(new Socket())
    req.headers['x-admin-meta-label'] = 'Header Articles'
    const queryContext = (await context.withRequest(req)).sudo()
    expectedResolveAdminMetaContext = queryContext

    const data = (await queryContext.graphql.run({ query: hookQuery })) as any

    expect(data.keystone.adminMeta.lists[0].label).toBe('Header Articles')
    expect(resolveAdminMetaCalls).toBe(1)
    expectedResolveAdminMetaContext = undefined
  })
)

test(
  'resolveAdminMeta does not share transformed metadata between requests',
  hookRunner(async ({ context }) => {
    resolveAdminMetaCalls = 0
    const first = (await context.withSession({ locale: 'mutate' }).sudo().graphql.run({
      query: hookQuery,
    })) as any
    const second = (await context.withSession({ locale: 'en' }).sudo().graphql.run({
      query: hookQuery,
    })) as any

    expect(first.keystone.adminMeta.lists[0].label).toBe('Mutated Articles')
    expect(second.keystone.adminMeta.lists[0].label).toBe('Articles')
    expect(resolveAdminMetaCalls).toBe(2)
  })
)

test(
  'resolveAdminMeta errors follow the GraphQL error path',
  hookRunner(async ({ context }) => {
    const result = await context.withSession({ locale: 'error' }).sudo().graphql.raw({
      query: hookQuery,
    })

    expect(result.data).toBeNull()
    expect(result.errors?.[0]?.message).toBe('resolveAdminMeta failed')
  })
)

let cloneAdminMetaRequest = 0

const cloneAdminMetaRunner = setupTestRunner({
  config: {
    ui: {
      hooks: {
        resolveAdminMeta: ({ adminMeta }) => {
          cloneAdminMetaRequest++
          if (cloneAdminMetaRequest === 1) {
            const article = adminMeta.lists[0]
            const title = article.fields.find(field => field.key === 'title')!
            const category = article.fields.find(field => field.key === 'category')!

            const titleFieldMeta = title.fieldMeta as any
            titleFieldMeta.validation.length.min = 7

            const categoryFieldMeta = category.fieldMeta as any
            categoryFieldMeta.options[0].label = 'Mutated option'

            const initialFilter = article.initialFilter as any
            initialFilter.title.contains = 'mutated'

            const initialSort = article.initialSort as any
            initialSort.field = 'id'

            const graphqlNames = article.graphql.names as any
            graphqlNames.outputTypeName = 'MutatedArticle'
          }

          return adminMeta
        },
      },
    },
    lists: {
      Article: list({
        access: allowAll,
        fields: {
          title: text(),
          category: select({ options: ['one', 'two'] }),
        },
        ui: {
          listView: {
            initialFilter: { title: { contains: 'original' } },
            initialSort: { field: 'title', direction: 'ASC' },
          },
        },
      }),
    },
  },
})

test(
  'cloneAdminMetaValue clones nested metadata values per request',
  cloneAdminMetaRunner(async ({ context }) => {
    cloneAdminMetaRequest = 0

    const first = (await context.sudo().graphql.run({
      query: gql`
        query {
          keystone {
            adminMeta {
              lists {
                fields {
                  key
                  fieldMeta
                }
                graphql {
                  names {
                    outputTypeName
                  }
                }
                initialFilter
                initialSort {
                  field
                  direction
                }
              }
            }
          }
        }
      `,
    })) as any

    const second = (await context.sudo().graphql.run({
      query: gql`
        query {
          keystone {
            adminMeta {
              lists {
                fields {
                  key
                  fieldMeta
                }
                graphql {
                  names {
                    outputTypeName
                  }
                }
                initialFilter
                initialSort {
                  field
                  direction
                }
              }
            }
          }
        }
      `,
    })) as any

    const firstArticle = first.keystone.adminMeta.lists[0]
    const secondArticle = second.keystone.adminMeta.lists[0]
    const firstTitle = firstArticle.fields.find((field: any) => field.key === 'title')
    const secondTitle = secondArticle.fields.find((field: any) => field.key === 'title')
    const firstCategory = firstArticle.fields.find((field: any) => field.key === 'category')
    const secondCategory = secondArticle.fields.find((field: any) => field.key === 'category')

    expect(firstTitle.fieldMeta.validation.length.min).toBe(7)
    expect(firstCategory.fieldMeta.options[0].label).toBe('Mutated option')
    expect(firstArticle.initialFilter.title.contains).toBe('mutated')
    expect(firstArticle.initialSort).toEqual({ field: 'id', direction: 'ASC' })
    expect(firstArticle.graphql.names.outputTypeName).toBe('MutatedArticle')

    expect(secondTitle.fieldMeta.validation.length.min).toBeNull()
    expect(secondCategory.fieldMeta.options[0]).toEqual({ label: 'One', value: 'one' })
    expect(secondArticle.initialFilter).toEqual({ title: { contains: 'original' } })
    expect(secondArticle.initialSort).toEqual({ field: 'title', direction: 'ASC' })
    expect(secondArticle.graphql.names.outputTypeName).toBe('Article')
    expect(cloneAdminMetaRequest).toBe(2)
  })
)

const resolveAdminMetaRunner = setupTestRunner({
  config: {
    ui: {
      hooks: {
        resolveAdminMeta: ({ adminMeta }) => adminMeta,
      },
    },
    lists: {
      Article: list({
        access: allowAll,
        fields: {
          title: text({
            ui: {
              createView: {
                fieldMode: async () => 'hidden',
                isRequired: async () => true,
              },
              itemView: {
                fieldMode: async () => 'read',
                fieldPosition: async () => 'sidebar',
                isRequired: async () => true,
              },
              listView: {
                fieldMode: async () => 'hidden',
              },
            },
          }),
        },
        ui: {
          hideNavigation: async () => true,
          hideCreate: async () => false,
          hideDelete: async () => true,
          listView: {
            initialFilter: async () => ({ title: { contains: 'async' } }),
            hiddenFilter: async () => ({ title: { contains: 'hidden' } }),
          },
        },
      }),
    },
  },
})

test(
  'resolveAdminMetaValue resolves static and asynchronous metadata values',
  resolveAdminMetaRunner(async ({ context }) => {
    const data = (await context.sudo().graphql.run({
      query: gql`
        query {
          keystone {
            adminMeta {
              lists {
                fields {
                  key
                  createView {
                    fieldMode
                    isRequired
                  }
                  itemView {
                    fieldMode
                    fieldPosition
                    isRequired
                  }
                  listView {
                    fieldMode
                  }
                }
                initialFilter
                hiddenFilter
                hideNavigation
                hideCreate
                hideDelete
              }
            }
          }
        }
      `,
    })) as any

    const article = data.keystone.adminMeta.lists[0]
    const title = article.fields.find((field: any) => field.key === 'title')
    const id = article.fields.find((field: any) => field.key === 'id')

    expect(article.initialFilter).toEqual({ title: { contains: 'async' } })
    expect(article.hiddenFilter).toEqual({ title: { contains: 'hidden' } })
    expect(article.hideNavigation).toBe(true)
    expect(article.hideCreate).toBe(false)
    expect(article.hideDelete).toBe(true)

    expect(title).toMatchObject({
      createView: { fieldMode: 'hidden', isRequired: true },
      itemView: { fieldMode: 'read', fieldPosition: 'sidebar', isRequired: true },
      listView: { fieldMode: 'hidden' },
    })
    expect(id).toMatchObject({
      createView: { fieldMode: 'hidden', isRequired: false },
      itemView: { fieldMode: 'edit', fieldPosition: 'sidebar', isRequired: false },
      listView: { fieldMode: 'read' },
    })
  })
)
