import assert from 'node:assert'
import { after, describe, test } from 'node:test'

import { action, g, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'
import { adminMetaQuery } from '../packages/core/src/admin-ui/admin-meta-graphql.ts'
import { dbProvider, setupTestEnv } from './utils.ts'

const config = {
  lists: {
    Post: list({
      access: allowAll,
      fields: {
        title: text(),
      },
      actions: {
        publish: action({
          access: allowAll,
          args: {
            title: {
              graphql: g.arg({ type: g.nonNull(g.String) }),
              ui: {
                source: { itemField: 'title' },
              },
            },
          },
          ui: {
            label: 'Publish',
          },
          async resolve({ where, args: { title } }, context) {
            return context.db.Post.updateOne({
              where,
              data: {
                title,
              },
            })
          },
        }),
      },
    }),
  },
} as const

describe(`actions (${dbProvider})`, () => {
  const result = setupTestEnv(config)

  after(async () => {
    await (await result).disconnect()
  })

  test('generates action argument schema and admin meta', async () => {
    const { artifacts, connect, context } = await result
    await connect()

    assert.match(
      artifacts.graphql,
      /publishPost\(where: PostWhereUniqueInput!, title: String!\): Post/
    )
    assert.match(
      artifacts.graphql,
      /input PublishPostArgs \{\n  where: PostWhereUniqueInput!\n  title: String!\n\}/
    )

    const adminMeta = (await context.graphql.run({ query: adminMetaQuery })) as any
    const actions = adminMeta.keystone.adminMeta.lists[0].actions
    assert.deepEqual(actions.find((action: any) => action.key === 'publish').graphql.arguments, [
      { name: 'title', type: 'String!', source: { itemField: 'title' } },
    ])
  })

  test('passes action arguments to single and many resolvers', async () => {
    const { connect, context } = await result
    await connect()

    const first = await context.query.Post.createOne({
      data: { title: 'Draft' },
      query: 'id title',
    })
    const single = await context.graphql.raw({
      query: `
        mutation ($id: ID!) {
          publishPost(where: { id: $id }, title: "Published") {
            id
            title
          }
        }
      `,
      variables: { id: first.id },
    })
    assert.equal(single.errors, undefined)
    assert.deepEqual((single.data as any).publishPost, {
      id: first.id,
      title: 'Published',
    })

    const second = await context.query.Post.createOne({
      data: { title: 'Second' },
      query: 'id',
    })
    const many = await context.graphql.raw({
      query: `
        mutation ($id: ID!) {
          publishPosts(data: [{ where: { id: $id }, title: "Published many" }]) {
            id
            title
          }
        }
      `,
      variables: { id: second.id },
    })
    assert.equal(many.errors, undefined)
    assert.deepEqual((many.data as any).publishPosts, [
      {
        id: second.id,
        title: 'Published many',
      },
    ])
  })
})
