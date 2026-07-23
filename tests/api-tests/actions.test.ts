import { describe, expect, it } from 'vitest'
import { action, g, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'

import { adminMetaQuery } from '../../packages/core/src/admin-ui/admin-meta-graphql'
import { setupTestRunner } from './test-runner'

const runner = setupTestRunner({
  config: {
    lists: {
      Task: list({
        access: allowAll,
        fields: {
          title: text(),
        },
        actions: {
          rename: action({
            access: allowAll,
            args: {
              title: {
                graphql: g.arg({ type: g.String }),
                ui: { source: { field: text({ validation: { isRequired: true } }) } },
              },
              previousTitle: {
                graphql: g.arg({ type: g.String }),
                ui: { source: { itemField: 'title' } },
              },
              apiOnly: { graphql: g.arg({ type: g.String }) },
            },
            resolve: async ({ where, args }, context) => {
              return context.db.Task.updateOne({
                where,
                data: { title: `${args.previousTitle}:${args.title}:${args.apiOnly}` },
              })
            },
            ui: {
              label: 'Rename',
              itemView: { hidePrompt: false },
            },
          }),
        },
      }),
    },
  },
})

describe('actions', () => {
  it(
    'uses explicit GraphQL input for field-rendered GraphQL arguments',
    runner(async ({ context, artifacts }) => {
      expect(artifacts.graphql).toContain(`input RenameTaskArgs {
  where: TaskWhereUniqueInput!
  title: String
  previousTitle: String
  apiOnly: String
}`)

      const task = await context.db.Task.createOne({ data: { title: 'Old' } })
      const data = await context.graphql.run({
        query: `
          mutation($id: ID!) {
            renameTask(where: { id: $id }, title: "New", previousTitle: "Old", apiOnly: "API") {
              title
            }
          }
        `,
        variables: { id: task.id },
      })

      expect(data).toEqual({
        renameTask: {
          title: 'Old:New:API',
        },
      })
    })
  )

  it(
    'exposes explicit action argument UI metadata',
    runner(async ({ context }) => {
      const data = (await context.sudo().graphql.run({ query: adminMetaQuery })) as any
      const task = data.keystone.adminMeta.lists.find((list: any) => list.key === 'Task')
      expect(task.actions[0].graphql.arguments).toMatchObject([
        {
          name: 'title',
          type: 'String',
          source: {
            field: {
              key: 'title',
              label: 'Title',
            },
          },
        },
        {
          name: 'previousTitle',
          type: 'String',
          source: {
            itemField: 'title',
          },
        },
        {
          name: 'apiOnly',
          type: 'String',
          source: null,
        },
      ])
    })
  )
})

describe('action field argument config validation', () => {
  it('rejects field access control', async () => {
    const invalidRunner = setupTestRunner({
      config: {
        lists: {
          Task: list({
            access: allowAll,
            fields: { title: text() },
            actions: {
              rename: action({
                access: allowAll,
                args: {
                  title: {
                    graphql: g.arg({ type: g.String }),
                    ui: { source: { field: text({ access: { read: () => true } }) } },
                  },
                },
                resolve: async () => null,
                ui: { label: 'Rename' },
              }),
            },
          }),
        },
      },
    })

    await expect(invalidRunner(async () => {})()).rejects.toThrow(
      'Task.rename.title cannot define field access control'
    )
  })

  it('rejects hidden prompts for field-rendered arguments', async () => {
    const invalidRunner = setupTestRunner({
      config: {
        lists: {
          Task: list({
            access: allowAll,
            fields: { title: text() },
            actions: {
              rename: action({
                access: allowAll,
                args: {
                  title: {
                    graphql: g.arg({ type: g.String }),
                    ui: { source: { field: text() } },
                  },
                },
                resolve: async () => null,
                ui: {
                  label: 'Rename',
                  itemView: { hidePrompt: true },
                },
              }),
            },
          }),
        },
      },
    })

    await expect(invalidRunner(async () => {})()).rejects.toThrow(
      'Task.rename cannot set ui.itemView.hidePrompt when using field-rendered action arguments'
    )
  })

  it('rejects action argument field create-view modes', async () => {
    const invalidRunner = setupTestRunner({
      config: {
        lists: {
          Task: list({
            access: allowAll,
            fields: { title: text() },
            actions: {
              rename: action({
                access: allowAll,
                args: {
                  title: {
                    graphql: g.arg({ type: g.String }),
                    ui: {
                      source: {
                        field: text({ ui: { createView: { fieldMode: 'hidden' } } }),
                      },
                    },
                  },
                },
                resolve: async () => null,
                ui: { label: 'Rename' },
              }),
            },
          }),
        },
      },
    })

    await expect(invalidRunner(async () => {})()).rejects.toThrow(
      'Task.rename.title cannot define createView.fieldMode'
    )
  })

  it('rejects field-rendered sources without GraphQL create inputs', async () => {
    const invalidRunner = setupTestRunner({
      config: {
        lists: {
          Task: list({
            access: allowAll,
            fields: { title: text() },
            actions: {
              rename: action({
                access: allowAll,
                args: {
                  title: {
                    graphql: g.arg({ type: g.String }),
                    ui: {
                      source: {
                        field: text({ graphql: { omit: { create: true } } }),
                      },
                    },
                  },
                },
                resolve: async () => null,
                ui: { label: 'Rename' },
              }),
            },
          }),
        },
      },
    })

    await expect(invalidRunner(async () => {})()).rejects.toThrow(
      'Task.rename.title does not provide a create GraphQL input'
    )
  })

  it('rejects field-rendered sources that are incompatible with the explicit GraphQL arg', async () => {
    const invalidRunner = setupTestRunner({
      config: {
        lists: {
          Task: list({
            access: allowAll,
            fields: { title: text() },
            actions: {
              rename: action({
                access: allowAll,
                args: {
                  title: {
                    graphql: g.arg({ type: g.Int }),
                    ui: { source: { field: text() } },
                  },
                },
                resolve: async () => null,
                ui: { label: 'Rename' },
              }),
            },
          }),
        },
      },
    })

    await expect(invalidRunner(async () => {})()).rejects.toThrow(
      'Task.rename.title field-rendered UI source type String is not assignable to GraphQL arg type Int'
    )
  })

  it('rejects action argument UI sources with both itemField and field', async () => {
    const invalidRunner = setupTestRunner({
      config: {
        lists: {
          Task: list({
            access: allowAll,
            fields: { title: text() },
            actions: {
              rename: action({
                access: allowAll,
                args: {
                  title: {
                    graphql: g.arg({ type: g.String }),
                    ui: { source: { itemField: 'title', field: text() } } as any,
                  },
                },
                resolve: async () => null,
                ui: { label: 'Rename' },
              }),
            },
          }),
        },
      },
    })

    await expect(invalidRunner(async () => {})()).rejects.toThrow(
      'Task.rename.title cannot define both ui.source.itemField and ui.source.field'
    )
  })
})
