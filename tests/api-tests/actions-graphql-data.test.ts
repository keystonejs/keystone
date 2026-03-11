import { action, config as defineConfig, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { getContext } from '@keystone-6/core/context'
import { checkbox, text } from '@keystone-6/core/fields'
import { adminMetaQuery } from '../../packages/core/src/admin-ui/admin-meta-graphql'
import { setupTestEnv } from './test-runner'

const config = {
  lists: {
    Post: list({
      access: allowAll,
      fields: {
        title: text(),
        hidden: checkbox(),
      },
      actions: {
        publish: action({
          access: allowAll,
          graphql: {
            __data: {
              title: true,
            },
          },
          async resolve({ where, data }, context) {
            return context.db.Post.updateOne({
              where,
              data: {
                ...data,
                hidden: false,
              },
            })
          },
          ui: {
            label: 'Publish',
            itemView: {
              actionMode: ({ item }) => (item == null || item.hidden ? 'enabled' : 'disabled'),
            },
            listView: {
              actionMode: {
                enabled: {
                  hidden: { equals: true },
                },
              },
            },
          },
        }),
        archive: action({
          access: allowAll,
          async resolve({ where }, context) {
            return context.db.Post.updateOne({
              where,
              data: {
                hidden: true,
              },
            })
          },
          ui: {
            label: 'Archive',
            itemView: {
              actionMode: ({ item }) => (item != null && item.hidden ? 'disabled' : 'enabled'),
            },
            listView: {
              actionMode: () => ({
                enabled: {
                  hidden: { equals: false },
                },
              }),
            },
          },
        }),
        revise: action({
          access: allowAll,
          graphql: {
            __data: true,
          },
          async resolve({ where, data }, context) {
            return context.db.Post.updateOne({
              where,
              data,
            })
          },
          ui: {
            label: 'Revise',
          },
        }),
      },
    }),
  },
} as const

const emptyPrismaModule = {
  PrismaClient: class PrismaClient {
    $extends() {
      return this
    }
  },
  Prisma: {},
}

test('graphql.__data: true throws when the update input is Empty', () => {
  expect(() =>
    getContext(
      defineConfig({
        db: {
          provider: 'sqlite',
          url: 'file://',
        },
        lists: {
          Post: list({
            access: allowAll,
            fields: {
              title: text({ graphql: { omit: { update: true } } }),
            },
            actions: {
              revise: action({
                access: allowAll,
                graphql: {
                  __data: true,
                },
                resolve: () => null,
                ui: {
                  label: 'Revise',
                },
              }),
            },
          }),
        },
      }),
      emptyPrismaModule
    )
  ).toThrowErrorMatchingInlineSnapshot(
    `"The action at Post.actions.revise sets graphql.__data but the list has no updateable fields"`
  )
})

test('subset graphql.__data throws when the update input is Empty', () => {
  expect(() =>
    getContext(
      defineConfig({
        db: {
          provider: 'sqlite',
          url: 'file://',
        },
        lists: {
          Post: list({
            access: allowAll,
            fields: {
              title: text({ graphql: { omit: { update: true } } }),
            },
            actions: {
              publish: action({
                access: allowAll,
                graphql: {
                  __data: {
                    title: true,
                  },
                },
                resolve: () => null,
                ui: {
                  label: 'Publish',
                },
              }),
            },
          }),
        },
      }),
      emptyPrismaModule
    )
  ).toThrowErrorMatchingInlineSnapshot(
    `"The action at Post.actions.publish sets graphql.__data but the list has no updateable fields"`
  )
})

test('graphql artifacts include action args types and __data input handling', async () => {
  const { artifacts, disconnect } = await setupTestEnv(config)
  try {
    expect(artifacts.graphql).toContain(`input PublishPostArgs {
  where: PostWhereUniqueInput!
  data: PublishPostData!
}`)
    expect(artifacts.graphql).toContain(`input ArchivePostArgs {
  where: PostWhereUniqueInput!
}`)
    expect(artifacts.graphql).toContain(`input RevisePostArgs {
  where: PostWhereUniqueInput!
  data: PostUpdateInput!
}`)
    expect(artifacts.graphql).toContain(
      `publishPost(where: PostWhereUniqueInput!, data: PublishPostData!): Post`
    )
    expect(artifacts.graphql).toContain(`archivePosts(data: [ArchivePostArgs!]!): [Post]`)
    expect(artifacts.graphql).toContain(
      `revisePost(where: PostWhereUniqueInput!, data: PostUpdateInput!): Post`
    )
    expect(artifacts.graphql).not.toContain('input ArchivePostData')
  } finally {
    await disconnect()
  }
})

test('admin meta list actionMode functions receive the current item', async () => {
  const { connect, disconnect, context } = await setupTestEnv(config)
  await connect()
  try {
    const hiddenPost = await context.sudo().query.Post.createOne({
      data: { title: 'Hidden', hidden: true },
      query: 'id',
    })
    const visiblePost = await context.sudo().query.Post.createOne({
      data: { title: 'Visible', hidden: false },
      query: 'id',
    })

    const hiddenRes = await context.sudo().graphql.raw({
      query: `
        query ($key: String!, $id: ID!) {
          keystone {
            adminMeta {
              list(key: $key, itemId: $id) {
                actions {
                  key
                  itemView {
                    actionMode
                  }
                }
              }
            }
          }
        }
      `,
      variables: { key: 'Post', id: hiddenPost.id },
    })
    expect(hiddenRes.errors).toBeUndefined()
    expect((hiddenRes.data as any)?.keystone.adminMeta.list.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'publish',
          itemView: { actionMode: 'enabled' },
        }),
        expect.objectContaining({
          key: 'archive',
          itemView: { actionMode: 'disabled' },
        }),
      ])
    )

    const visibleRes = await context.sudo().graphql.raw({
      query: `
        query ($key: String!, $id: ID!) {
          keystone {
            adminMeta {
              list(key: $key, itemId: $id) {
                actions {
                  key
                  itemView {
                    actionMode
                  }
                }
              }
            }
          }
        }
      `,
      variables: { key: 'Post', id: visiblePost.id },
    })
    expect(visibleRes.errors).toBeUndefined()
    expect((visibleRes.data as any)?.keystone.adminMeta.list.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'publish',
          itemView: { actionMode: 'disabled' },
        }),
        expect.objectContaining({
          key: 'archive',
          itemView: { actionMode: 'enabled' },
        }),
      ])
    )
  } finally {
    await disconnect()
  }
})

test('admin meta exposes filtered list view action modes as JSON', async () => {
  const { connect, disconnect, context } = await setupTestEnv(config)
  await connect()
  try {
    const adminMeta = (await context.sudo().graphql.run({ query: adminMetaQuery })) as any
    expect(adminMeta.keystone.adminMeta.lists[0].actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'publish',
          listView: {
            actionMode: {
              enabled: {
                hidden: {
                  equals: true,
                },
              },
            },
          },
        }),
        expect.objectContaining({
          key: 'archive',
          listView: {
            actionMode: {
              enabled: {
                hidden: {
                  equals: false,
                },
              },
            },
          },
        }),
        expect.objectContaining({
          key: 'revise',
          listView: {
            actionMode: 'enabled',
          },
        }),
      ])
    )
  } finally {
    await disconnect()
  }
})

test('action mutations receive configured data and admin meta exposes action field keys', async () => {
  const { connect, disconnect, context } = await setupTestEnv(config)
  await connect()
  try {
    const item = await context.sudo().query.Post.createOne({
      data: { title: 'Draft', hidden: true },
      query: 'id title hidden',
    })

    const single = await context.graphql.raw({
      query: `
        mutation ($id: ID!) {
          publishPost(where: { id: $id }, data: { title: "Published" }) {
            id
            title
            hidden
          }
        }
      `,
      variables: { id: item.id },
    })
    expect(single.errors).toBeUndefined()
    expect((single.data as any)?.publishPost).toEqual({
      id: item.id,
      title: 'Published',
      hidden: false,
    })

    const many = await context.graphql.raw({
      query: `
        mutation ($id: ID!) {
          archivePosts(data: [{ where: { id: $id } }]) {
            id
            hidden
          }
        }
      `,
      variables: { id: item.id },
    })
    expect(many.errors).toBeUndefined()
    expect((many.data as any)?.archivePosts).toEqual([{ id: item.id, hidden: true }])

    const adminMeta = (await context.sudo().graphql.run({ query: adminMetaQuery })) as any
    expect(adminMeta.keystone.adminMeta.lists[0].actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'publish',
          graphql: expect.objectContaining({ fields: ['title'] }),
        }),
        expect.objectContaining({
          key: 'archive',
          graphql: expect.objectContaining({ fields: [] }),
        }),
        expect.objectContaining({
          key: 'revise',
          graphql: expect.objectContaining({ fields: ['title', 'hidden'] }),
        }),
      ])
    )
  } finally {
    await disconnect()
  }
})
