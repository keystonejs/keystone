import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { checkbox, integer, relationship, text } from '@keystone-6/core/fields'
import { dbProvider, setupTestSuite } from './utils.ts'
import { findMany } from '../packages/core/src/lib/core/queries/resolvers.ts'
import { query } from '../tests/api-tests/run-field.ts'

describe(`cursor inputs (${dbProvider})`, () => {
  const suite = setupTestSuite({
    config: {
      lists: {
        Post: list({
          db: { idField: { kind: 'autoincrement' } },
          access: {
            operation: allowAll,
            filter: {
              query: ({ session }) => (session?.filter ? { visible: { equals: true } } : true),
            },
          },
          fields: {
            value: meta => {
              const field = text({ isIndexed: 'unique' })(meta)
              return {
                ...field,
                input: {
                  ...field.input,
                  uniqueWhere: {
                    ...field.input!.uniqueWhere!,
                    resolve: value => (typeof value === 'string' ? value.toLowerCase() : value),
                  },
                },
              }
            },
            visible: checkbox(),
            author: relationship({ ref: 'Author.post' }),
          },
        }),
        Author: list({
          access: allowAll,
          fields: {
            name: text({ isIndexed: 'unique' }),
            post: relationship({ ref: 'Post.author' }),
            posts: relationship({ ref: 'Post', many: true }),
          },
        }),
      },
    },
  })()
  const seeded = suite.then(async ({ context }) => {
    const posts = await context.db.Post.createMany({
      data: [
        { value: 'a', visible: true },
        { value: 'b', visible: false },
        { value: 'c', visible: true },
      ],
    })
    const author = await context.db.Author.createOne({
      data: {
        name: 'Alice',
        post: { connect: { id: posts[0].id } },
        posts: { connect: posts.map(({ id }) => ({ id })) },
      },
    })
    return { posts, author }
  })

  for (const api of ['graphql', 'db'] as const) {
    for (const filter of [false, true]) {
      const fetchPage = async (cursor: Record<string, any>, take = 1, skip = 0) => {
        const { context } = await suite
        const ctx = context.withSession({ filter })
        if (api === 'graphql') {
          return (
            (await ctx.graphql.run({
              query: `query($cursor: PostWhereUniqueInput!, $take: Int!, $skip: Int!) {
                posts(cursor: $cursor, take: $take, skip: $skip, orderBy: { value: asc }) { value }
              }`,
              variables: { cursor, take, skip },
            })) as { posts: { value: string }[] }
          ).posts
        }
        return ctx.db.Post.findMany({
          cursor,
          take,
          skip,
          orderBy: [{ value: 'asc' }],
          select: { value: true },
        })
      }

      test(`${api}: parses cursor IDs and unique field values (filter: ${filter})`, async () => {
        const { posts } = await seeded
        for (const cursor of [{ id: String(posts[0].id) }, { value: 'A' }]) {
          assert.deepEqual(
            (await fetchPage(cursor)).map(post => post.value),
            ['a']
          )
          assert.deepEqual(
            (await fetchPage(cursor, 1, 1)).map(post => post.value),
            [filter ? 'c' : 'b']
          )
        }
        assert.deepEqual(
          (await fetchPage({ id: String(posts[2].id) }, -1, 1)).map(post => post.value),
          [filter ? 'a' : 'b']
        )
        assert.deepEqual(
          (await fetchPage({ value: 'B' })).map(post => post.value),
          filter ? [] : ['b']
        )
      })

      test(`${api}: invalid cursor IDs return input errors (filter: ${filter})`, async () => {
        await seeded
        for (const id of ['invalid', '']) {
          await assert.rejects(fetchPage({ id }), {
            message: 'Input error: Only a int can be passed to id filters',
            extensions: { code: 'KS_USER_INPUT_ERROR' },
          })
        }
        await assert.rejects(fetchPage({ id: null }), {
          message: 'Input error: The key "id" in PostWhereUniqueInput cannot be set to null',
          extensions: { code: 'KS_USER_INPUT_ERROR' },
        })
        await assert.rejects(fetchPage({}), {
          message: 'Input error: At least one key must be passed to PostWhereUniqueInput',
          extensions: { code: 'KS_USER_INPUT_ERROR' },
        })
      })

      test(`${api}: rejects relationship cursors (filter: ${filter})`, async () => {
        const { posts } = await seeded
        for (const author of [{ name: 'Alice' }, { post: { id: posts[0].id } }, null]) {
          for (const cursor of [{ author }, { id: posts[0].id, author }]) {
            await assert.rejects(fetchPage(cursor), {
              message:
                'Input error: The relationship field "Post.author" cannot be used in a cursor',
              extensions: { code: 'KS_USER_INPUT_ERROR' },
            })
          }
        }
      })
    }
  }

  test('relationship queries parse scalar cursors and reject relationship cursors', async () => {
    const { context } = await suite
    const { posts, author } = await seeded
    const query = `query($id: ID!, $cursor: PostWhereUniqueInput!) {
      author(where: { id: $id }) { posts(cursor: $cursor, take: 1) { value } }
    }`
    const result = (await context.graphql.run({
      query,
      variables: { id: author.id, cursor: { id: String(posts[0].id) } },
    })) as { author: { posts: { value: string }[] } }
    assert.deepEqual(
      result.author.posts.map(post => post.value),
      ['a']
    )
    await assert.rejects(
      context.graphql.run({
        query,
        variables: { id: author.id, cursor: { author: { name: 'Alice' } } },
      }),
      {
        message: 'Input error: The relationship field "Post.author" cannot be used in a cursor',
        extensions: { code: 'KS_USER_INPUT_ERROR' },
      }
    )
  })
})

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
            some: integer({
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
    const posts = await context.sudo().db.Post.createMany({
      data: ['a-hidden', 'b-visible', 'c-hidden', 'd-visible', 'e-hidden'].map((value, index) => ({
        value,
        some: index,
        visible: value.endsWith('visible'),
      })),
      select: { id: true, value: true },
    })
    const parent = await context.sudo().db.Parent.createOne({
      data: { posts: { connect: posts.map(({ id }) => ({ id })) } },
      select: { id: true },
    })
    return { posts, parent }
  })

  for (const api of ['graphql', 'db'] as const) {
    for (const field of ['id', 'value'] as const) {
      for (const take of [10, -10]) {
        test(`${api}: hidden and missing ${field} cursors return empty pages (${take})`, async () => {
          const { context } = await suite
          const { posts } = await seeded
          const candidates = [
            ...posts.filter(post => String(post.value).endsWith('hidden')),
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
                : await context.db.Post.findMany({
                    cursor,
                    take,
                    orderBy: [{ value: 'asc' }],
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
      const results = await query(context).posts<{ value: string | null }[]>({
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
    const results = await query(context).posts<{ value: string | null }[]>({
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
    const results = await query(context.sudo()).posts<{ value: string | null }[]>({
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
    const denied = query(context.withSession({ denyFilter: true }))
    for (const cursor of [{ value: 'b-visible' }, { some: 1 }]) {
      await assert.rejects(
        denied.posts({ cursor, query: 'id' }),
        /Access denied: You cannot filter/
      )
    }
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
            cursor: { id: posts.find(post => post.value === value)!.id.toString() },
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
