import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { checkbox, relationship, text } from '@keystone-6/core/fields'
import { dbProvider, setupTestSuite } from './utils.ts'
import { findMany } from '../packages/core/src/lib/core/queries/resolvers.ts'

describe(`cursor pagination access (${dbProvider})`, () => {
  const cacheResults: unknown[] = []
  const suite = setupTestSuite({
    config: {
      lists: {
        Post: list({
          access: {
            operation: allowAll,
            filter: { query: () => ({ visible: { equals: true } }) },
          },
          graphql: {
            cacheHint: ({ results }) => {
              cacheResults.push(results)
              return { maxAge: 0 }
            },
          },
          fields: {
            value: text({
              isIndexed: 'unique',
              access: {
                read: {
                  item: allowAll,
                  filter: ({ session }) => !session?.denyFilter,
                  order: allowAll,
                },
              },
            }),
            visible: checkbox(),
          },
        }),
        Parent: list({
          access: allowAll,
          fields: { posts: relationship({ ref: 'Post', many: true }) },
        }),
      },
    },
  })()
  const seeded = suite.then(async ({ context }) => {
    const posts = await context.sudo().query.Post.createMany({
      data: ['a-hidden', 'b-visible', 'c-hidden', 'd-visible', 'e-hidden'].map(value => ({
        value,
        visible: value.endsWith('visible'),
      })),
      query: 'id value',
    })
    const parent = await context.sudo().query.Parent.createOne({
      data: { posts: { connect: posts.map(({ id }) => ({ id })) } },
    })
    return { posts, parent }
  })

  for (const api of ['graphql', 'query', 'db'] as const) {
    for (const field of ['id', 'value'] as const) {
      for (const take of [10, -10]) {
        test(`${api}: hidden and missing ${field} cursors return empty pages (${take})`, async () => {
          const { context } = await suite
          const { posts } = await seeded
          const candidates = [
            ...posts.filter(post => post.value.endsWith('hidden')),
            { id: 'missing', value: 'missing' },
          ]
          for (const post of candidates) {
            const cursor = { [field]: post[field] }
            const results =
              api === 'graphql'
                ? (
                    (await context.graphql.run({
                      query: `query($cursor: PostWhereUniqueInput!, $take: Int!) {
                    posts(cursor: $cursor, take: $take, orderBy: [{ value: asc }]) { value }
                  }`,
                      variables: { cursor, take },
                    })) as { posts: unknown[] }
                  ).posts
                : await context[api].Post.findMany({
                    cursor,
                    take,
                    orderBy: [{ value: 'asc' }],
                    query: 'value',
                  })
            assert.deepEqual(results, [])
          }
        })
      }
    }
  }

  for (const take of [10, -10]) {
    test(`visible cursors preserve pagination and skip (${take})`, async () => {
      const { context } = await suite
      await seeded
      const results = await context.query.Post.findMany({
        cursor: { value: take > 0 ? 'b-visible' : 'd-visible' },
        take,
        skip: 1,
        orderBy: [{ value: 'asc' }],
        query: 'value',
      })
      assert.deepEqual(
        results.map(post => post.value),
        [take > 0 ? 'd-visible' : 'b-visible']
      )
    })

    test(`relationship pagination rejects hidden cursors (${take})`, async () => {
      const { context } = await suite
      const { parent } = await seeded
      const data = (await context.graphql.run({
        query: `query($id: ID!, $take: Int!) {
          parent(where: { id: $id }) {
            posts(cursor: { value: "c-hidden" }, take: $take, orderBy: [{ value: asc }]) { value }
          }
        }`,
        variables: { id: parent.id, take },
      })) as { parent: { posts: unknown[] } }
      assert.deepEqual(data.parent.posts, [])
    })
  }

  test('cursor visibility is independent of the user where filter', async () => {
    const { context } = await suite
    await seeded
    const results = await context.query.Post.findMany({
      cursor: { value: 'b-visible' },
      where: { value: { equals: 'd-visible' } },
      orderBy: [{ value: 'asc' }],
      query: 'value',
    })
    assert.deepEqual(
      results.map(post => post.value),
      ['d-visible']
    )
  })

  test('sudo can paginate from a hidden cursor', async () => {
    const { context } = await suite
    await seeded
    const results = await context.sudo().query.Post.findMany({
      cursor: { value: 'c-hidden' },
      take: 2,
      orderBy: [{ value: 'asc' }],
      query: 'value',
    })
    assert.deepEqual(
      results.map(post => post.value),
      ['c-hidden', 'd-visible']
    )
  })

  test('cursor fields still require filter access', async () => {
    const { context } = await suite
    await seeded
    await assert.rejects(
      context.withSession({ denyFilter: true }).query.Post.findMany({
        cursor: { value: 'b-visible' },
      }),
      /Access denied: You cannot filter/
    )
  })

  for (const value of ['b-visible', 'c-hidden']) {
    test(
      `fetches the page while checking cursor visibility (${value})`,
      { timeout: 5000 },
      async () => {
        const { context } = await suite
        const { posts } = await seeded
        const prisma = context.prisma.Post
        const pageStarted = Promise.withResolvers<void>()
        const results = await findMany(
          {
            where: {},
            cursor: { id: posts.find(post => post.value === value)!.id },
            orderBy: [{ value: 'asc' }],
            take: 10,
            skip: 0,
          },
          context.__internal.lists.Post,
          {
            ...context,
            prisma: {
              Post: {
                async findFirst(args: unknown) {
                  await pageStarted.promise
                  return prisma.findFirst(args)
                },
                findMany(args: unknown): PromiseLike<unknown> {
                  return {
                    then(onfulfilled, onrejected) {
                      pageStarted.resolve()
                      return prisma.findMany(args).then(onfulfilled, onrejected)
                    },
                  }
                },
              },
            },
          },
          {} as Parameters<typeof findMany>[3],
          undefined
        )
        assert.deepEqual(
          results.map(post => post.value),
          value === 'b-visible' ? ['b-visible', 'd-visible'] : []
        )
      }
    )
  }

  test('empty cursor pages still apply cache hints', async () => {
    const { context } = await suite
    await seeded
    const field = context.graphql.schema.getQueryType()!.getFields().posts
    const resolve = field.resolve!
    field.resolve = (source, args, context, info) =>
      resolve(
        source,
        args,
        context,
        Object.assign(info, {
          cacheControl: { cacheHint: { restrict() {} }, setCacheHint() {} },
        })
      )
    try {
      for (const value of ['c-hidden', 'missing']) {
        cacheResults.length = 0
        await context.graphql.run({
          query: `query($value: String!) { posts(cursor: { value: $value }) { id } }`,
          variables: { value },
        })
        assert.deepEqual(cacheResults, [[]])
      }
    } finally {
      field.resolve = resolve
    }
  })
})
