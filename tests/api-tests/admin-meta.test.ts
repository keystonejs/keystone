import { expect, test, vi } from 'vitest'
import { IncomingMessage } from 'node:http'
import { Socket } from 'node:net'
import { action, g, group, list } from '@keystone-6/core'
import type { KeystoneContext } from '@keystone-6/core/types'
import { allowAll } from '@keystone-6/core/access'
import { integer, text } from '@keystone-6/core/fields'
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

function metadataLocale(context: KeystoneContext) {
  return (context.session as { locale?: string } | undefined)?.locale ?? 'en'
}

const dynamicListLabel = vi.fn(({ context }: { context: KeystoneContext }) => {
  if (metadataLocale(context) === 'error') throw new Error('Label resolution failed')
  return `${context.req?.headers['x-admin-locale'] ?? metadataLocale(context)}:Articles`
})

const dynamicTextRunner = setupTestRunner({
  config: {
    ui: { isAccessAllowed: () => false },
    lists: {
      Article: list({
        access: allowAll,
        ui: {
          label: dynamicListLabel,
          singular: ({ context }) => `${metadataLocale(context)}:Article`,
          plural: async ({ context }) => `${metadataLocale(context)}:Articles`,
        },
        fields: {
          ...group({
            label: ({ context }) => `${metadataLocale(context)}:Content`,
            description: async ({ context }) => `${metadataLocale(context)}:Content help`,
            fields: {
              title: text({
                ui: {
                  label: async ({ context }) => {
                    if (metadataLocale(context) === 'async-error') {
                      throw new Error('Async label resolution failed')
                    }
                    return `${metadataLocale(context)}:Title`
                  },
                  description: ({ context }) => `${metadataLocale(context)}:Title help`,
                },
              }),
            },
          }),
        },
        actions: {
          rename: action({
            access: allowAll,
            args: {
              title: {
                graphql: g.arg({ type: g.String }),
                ui: {
                  source: {
                    field: text({
                      ui: {
                        label: async ({ context }) => `${metadataLocale(context)}:New title`,
                        description: ({ context }) => `${metadataLocale(context)}:Rename help`,
                      },
                    }),
                  },
                },
              },
              previousTitle: {
                graphql: g.arg({ type: g.String }),
                ui: { source: { itemField: 'title' } },
              },
              staticTitle: {
                graphql: g.arg({ type: g.String }),
                ui: {
                  source: {
                    field: text({ ui: { label: 'New title', description: 'Rename help' } }),
                  },
                },
              },
              apiOnly: { graphql: g.arg({ type: g.String }) },
            },
            resolve: async () => null,
            ui: { label: 'Rename' },
          }),
        },
      }),
    },
  },
})

test(
  'presentation callbacks resolve per session across lists, groups and fields',
  dynamicTextRunner(async ({ context }) => {
    for (const locale of ['en', 'de', 'en']) {
      const queryContext = context.withSession({ locale }).sudo()
      const data = await queryContext.graphql.run({ query: adminMetaQuery })
      const title = {
        key: 'title',
        label: `${locale}:Title`,
        description: `${locale}:Title help`,
      }
      expect(data).toMatchObject({
        keystone: {
          adminMeta: {
            lists: [
              {
                key: 'Article',
                label: `${locale}:Articles`,
                singular: `${locale}:Article`,
                plural: `${locale}:Articles`,
                path: 'articles',
                graphql: { names: { outputTypeName: 'Article', listQueryName: 'articles' } },
                actions: [{ label: 'Rename' }],
                fields: [
                  expect.objectContaining({ key: 'id', label: 'Id', description: '' }),
                  title,
                ],
                groups: [
                  {
                    label: `${locale}:Content`,
                    description: `${locale}:Content help`,
                    fields: [{ key: 'title' }],
                  },
                ],
              },
            ],
          },
        },
      })
      expect(dynamicListLabel).toHaveBeenLastCalledWith({
        context: queryContext,
        session: queryContext.session,
      })
      const groupedFields = await queryContext.graphql.run({
        query:
          '{ keystone { adminMeta { lists { groups { fields { key label description } } } } } }',
      })
      expect(groupedFields).toEqual({
        keystone: { adminMeta: { lists: [{ groups: [{ fields: [title] }] }] } },
      })
    }
  })
)

for (const kind of ['static', 'dynamic']) {
  test(
    `action argument source JSON preserves ${kind} labels and descriptions across requests`,
    dynamicTextRunner(async ({ context }) => {
      for (const locale of ['en', 'de', 'en']) {
        const queryContext = context.withSession({ locale }).sudo()
        const data = await queryContext.graphql.run({
          query: `{
            keystone {
              adminMeta {
                list(key: "Article") {
                  actions { key graphql { arguments { name source } } }
                }
              }
            }
          }`,
        })
        // A JSON scalar does not resolve nested functions; assert the wire representation.
        const serialized = JSON.parse(JSON.stringify(data))
        const prefix = kind === 'dynamic' ? `${locale}:` : ''
        expect(serialized.keystone.adminMeta.list.actions).toEqual([
          {
            key: 'rename',
            graphql: {
              arguments: expect.arrayContaining([
                {
                  name: kind === 'dynamic' ? 'title' : 'staticTitle',
                  source: {
                    field: expect.objectContaining({
                      label: `${prefix}New title`,
                      description: `${prefix}Rename help`,
                    }),
                  },
                },
                { name: 'previousTitle', source: { itemField: 'title' } },
                { name: 'apiOnly', source: null },
              ]),
            },
          },
        ])
      }
    })
  )
}

test(
  'presentation callbacks can read request headers',
  dynamicTextRunner(async ({ context }) => {
    const req = new IncomingMessage(new Socket())
    req.headers['x-admin-locale'] = 'fr'
    const queryContext = (await context.withRequest(req)).sudo()
    const data = await queryContext.graphql.run({
      query: '{ keystone { adminMeta { list(key: "Article") { label } } } }',
    })
    expect(data).toEqual({ keystone: { adminMeta: { list: { label: 'fr:Articles' } } } })
  })
)

test(
  'presentation callbacks are only evaluated for selected metadata after access checks',
  dynamicTextRunner(async ({ context }) => {
    dynamicListLabel.mockClear()
    await context.graphql.run({ query: '{ articles { id } }' })
    await context.sudo().graphql.run({
      query: '{ keystone { adminMeta { lists { key } } } }',
    })
    const denied = await context.graphql.raw({ query: adminMetaQuery })
    expect(denied.errors?.[0]?.message).toBe('Access denied')
    expect(dynamicListLabel).not.toHaveBeenCalled()
  })
)

for (const { locale, query, message } of [
  {
    locale: 'error',
    query: '{ keystone { adminMeta { lists { label } } } }',
    message: 'Label resolution failed',
  },
  {
    locale: 'async-error',
    query: '{ keystone { adminMeta { lists { fields { label } } } } }',
    message: 'Async label resolution failed',
  },
]) {
  test(
    `presentation callbacks propagate ${locale} through GraphQL`,
    dynamicTextRunner(async ({ context }) => {
      const result = await context.withSession({ locale }).sudo().graphql.raw({ query })
      expect(result.data).toBeNull()
      expect(result.errors?.[0]?.message).toBe(message)
    })
  )
}

// Presentation callbacks must not change how item-dependent metadata is resolved.
for (const withDynamicText of [false, true]) {
  const itemViewRunner = setupTestRunner({
    config: {
      lists: {
        Article: list({
          access: allowAll,
          ui: { label: withDynamicText ? async () => 'Localized Articles' : 'Articles' },
          fields: {
            title: text({
              ui: {
                itemView: {
                  fieldMode: ({ item }) => {
                    if (item === null) return 'hidden'
                    return item.title === 'Published' ? 'read' : 'edit'
                  },
                  fieldPosition: async ({ itemField }): Promise<'form' | 'sidebar'> =>
                    itemField === 'Published' ? 'sidebar' : 'form',
                },
              },
            }),
          },
          actions: {
            publish: action({
              access: allowAll,
              resolve: async () => null,
              ui: {
                label: 'Publish',
                itemView: {
                  actionMode: async ({ item }): Promise<'hidden' | 'disabled' | 'enabled'> => {
                    if (item === null) return 'hidden'
                    return item.title === 'Published' ? 'disabled' : 'enabled'
                  },
                },
              },
            }),
          },
        }),
      },
    },
  })

  const textDescription = withDynamicText ? 'with dynamic text' : 'with static text'
  const label = withDynamicText ? 'Localized Articles' : 'Articles'

  for (const { name, selection, draft, published } of [
    {
      name: 'fieldMode receives the requested item',
      selection: 'fields { key itemView { fieldMode } }',
      draft: {
        fields: expect.arrayContaining([{ key: 'title', itemView: { fieldMode: 'edit' } }]),
      },
      published: {
        fields: expect.arrayContaining([{ key: 'title', itemView: { fieldMode: 'read' } }]),
      },
    },
    {
      name: 'fieldPosition receives the requested itemField',
      selection: 'fields { key itemView { fieldPosition } }',
      draft: {
        fields: expect.arrayContaining([{ key: 'title', itemView: { fieldPosition: 'form' } }]),
      },
      published: {
        fields: expect.arrayContaining([{ key: 'title', itemView: { fieldPosition: 'sidebar' } }]),
      },
    },
    {
      name: 'actionMode receives the requested item',
      selection: 'actions { key itemView { actionMode } }',
      draft: { actions: [{ key: 'publish', itemView: { actionMode: 'enabled' } }] },
      published: { actions: [{ key: 'publish', itemView: { actionMode: 'disabled' } }] },
    },
  ]) {
    test(
      `itemView ${name} for different item IDs in one query ${textDescription}`,
      itemViewRunner(async ({ context }) => {
        const draftItem = await context.db.Article.createOne({ data: { title: 'Draft' } })
        const publishedItem = await context.db.Article.createOne({
          data: { title: 'Published' },
        })

        const data = await context.sudo().graphql.run({
          query: `
            query($draftId: ID!, $publishedId: ID!) {
              keystone {
                adminMeta {
                  draft: list(key: "Article", itemId: $draftId) { label ${selection} }
                  published: list(key: "Article", itemId: $publishedId) { label ${selection} }
                }
              }
            }
          `,
          variables: { draftId: draftItem.id, publishedId: publishedItem.id },
        })

        expect(data).toEqual({
          keystone: {
            adminMeta: { draft: { label, ...draft }, published: { label, ...published } },
          },
        })
      })
    )
  }

  test(
    `itemView handles omitted and unknown item IDs ${textDescription}`,
    itemViewRunner(async ({ context }) => {
      const data = await context.sudo().graphql.run({
        query: gql`
          query {
            keystone {
              adminMeta {
                omitted: list(key: "Article") {
                  ...ItemViewMeta
                }
                unknown: list(key: "Article", itemId: "missing") {
                  ...ItemViewMeta
                }
              }
            }
          }
          fragment ItemViewMeta on KeystoneAdminUIListMeta {
            fields {
              key
              itemView {
                fieldMode
                fieldPosition
              }
            }
            actions {
              key
              itemView {
                actionMode
              }
            }
          }
        `,
      })

      const withoutItem = {
        fields: expect.arrayContaining([
          { key: 'title', itemView: { fieldMode: 'hidden', fieldPosition: 'form' } },
        ]),
        actions: [{ key: 'publish', itemView: { actionMode: 'hidden' } }],
      }
      expect(data).toEqual({
        keystone: { adminMeta: { omitted: withoutItem, unknown: withoutItem } },
      })
    })
  )
}

const asyncMetadataRunner = setupTestRunner({
  config: {
    lists: {
      Article: list({
        access: allowAll,
        fields: {
          title: text({
            ui: {
              createView: {
                fieldMode: async () => 'hidden' as const,
                isRequired: async () => true,
              },
              itemView: {
                fieldMode: async () => 'read' as const,
                fieldPosition: async () => 'sidebar' as const,
                isRequired: async () => true,
              },
              listView: {
                fieldMode: async () => 'hidden' as const,
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
  'admin metadata resolves static and asynchronous configuration values',
  asyncMetadataRunner(async ({ context }) => {
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
