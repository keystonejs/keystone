import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { checkbox, relationship, text } from '@keystone-6/core/fields'
import { dbProvider, setupTestSuite } from './utils.ts'
import { findMany } from '../packages/core/src/lib/core/queries/resolvers.ts'

import type {
  BaseListTypeInfo,
  ListQueryAccessControl,
  ListQueryFilterAccessControl,
} from '@keystone-6/core/types'

function relationshipOperation<Kind extends 'one' | 'many'>(
  expected: Kind
): ListQueryAccessControl<Kind, BaseListTypeInfo> {
  return async ({ kind, operation, listKey, session }) => {
    assert.equal(kind, expected)
    assert.equal(operation, 'query')
    assert.equal(listKey, 'Author')
    session?.calls?.push(`operation.${kind}`)
    if (session?.throwOperation) throw new Error('operation failure')
    if (session?.invalidOperation) return 'invalid' as any
    return !session?.denyOperation && session?.denyKind !== kind
  }
}

function relationshipFilter<Kind extends 'one' | 'many'>(
  expected: Kind
): ListQueryFilterAccessControl<Kind, BaseListTypeInfo> {
  return ({ kind, session }) => {
    assert.equal(kind, expected)
    session?.calls?.push(`filter.${kind}`)
    if (session?.throwFilter) throw new Error('filter failure')
    if (session?.invalidFilter) return { nonexistent: true }
    if (session?.denyFilter || session?.filterKind === kind) return false
    if (session?.byLabel) return { label: { equals: 'visible' } }
    return { visible: { equals: true } }
  }
}

const config = {
  lists: {
    Author: list({
      access: {
        operation: {
          create: allowAll,
          update: allowAll,
          delete: allowAll,
          query: {
            one: relationshipOperation('one'),
            many: relationshipOperation('many'),
            count: allowAll,
          },
        },
        filter: {
          query: {
            one: relationshipFilter('one'),
            many: relationshipFilter('many'),
            count: allowAll,
          },
        },
      },
      fields: {
        name: text({ isIndexed: 'unique' }),
        visible: checkbox(),
        label: text({ db: { isNullable: true } }),
        manager: relationship({ ref: 'Author' }),
        post: relationship({ ref: 'Post.author' }),
      },
    }),
    Post: list({
      access: allowAll,
      fields: {
        title: text(),
        author: relationship({ ref: 'Author.post' }),
        authors: relationship({ ref: 'Author', many: true }),
        parent: relationship({ ref: 'Post' }),
      },
    }),
    Shared: list({
      access: {
        operation: args =>
          args.operation !== 'query' || args.kind !== 'many' || !args.session?.denyOperation,
        filter: {
          query: ({ kind }) => (kind === 'many' ? { name: { equals: 'visible' } } : true),
        },
      },
      fields: { name: text() },
    }),
    SharedParent: list({
      access: allowAll,
      fields: { shared: relationship({ ref: 'Shared' }) },
    }),
  },
}

describe(`relationship filter access (${dbProvider})`, () => {
  const suite = setupTestSuite({ config })()
  const seeded = (async () => {
    const { context } = await suite
    const sudo = context.sudo()
    const [visible, hidden] = await sudo.query.Author.createMany({
      data: [
        { name: 'visible', visible: true, label: 'visible' },
        { name: 'hidden', visible: false },
      ],
    })
    // Create sequentially to avoid concurrent writes to the shared authors join table.
    const posts = [
      await sudo.query.Post.createOne({
        data: {
          title: 'visible',
          author: { connect: { id: visible.id } },
          authors: { connect: [visible, hidden] },
        },
      }),
      await sudo.query.Post.createOne({
        data: {
          title: 'hidden',
          author: { connect: { id: hidden.id } },
          authors: { connect: [hidden] },
        },
      }),
      await sudo.query.Post.createOne({ data: { title: 'empty' } }),
    ]
    return { context, sudo, visible, hidden, posts }
  })()

  test('applies to non-unique filters in query and db APIs, including boolean operators', async () => {
    const { context, sudo, visible } = await seeded
    for (const api of [context.query, context.db]) {
      assert.equal(await api.Post.count({ where: { author: {} } }), 1)
      assert.equal(
        await api.Post.count({ where: { OR: [{ author: { name: { equals: 'hidden' } } }] } }),
        0
      )
      assert.equal(await api.Post.count({ where: { NOT: [{ author: {} }] } }), 2)
      assert.equal(
        (await api.Post.findMany({ where: { author: { id: { equals: visible.id } } } })).length,
        1
      )
      assert.equal(await api.Post.count({ where: { author: null } }), 2)
    }
    assert.equal(await sudo.query.Post.count({ where: { author: {} } }), 2)
    assert.equal(await sudo.query.Post.count({ where: { author: null } }), 1)
    assert.equal(await context.query.Author.count(), 2)
  })

  test('routes to-one relationship filters by input type, independently of the outer query', async () => {
    const { context, posts } = await seeded
    for (const api of ['query', 'db'] as const) {
      const calls: string[] = []
      const ctx = context.withSession({ calls })
      assert.equal(
        (await ctx[api].Post.findOne({ where: { author: { name: 'visible' } } }))?.id,
        posts[0].id
      )
      assert.deepEqual(calls, ['operation.one', 'filter.one'])
      calls.length = 0
      assert.equal(
        (await ctx[api].Post.findMany({ where: { author: { name: { equals: 'visible' } } } }))
          .length,
        1
      )
      assert.deepEqual(calls, ['operation.many', 'filter.many'])
      calls.length = 0
      assert.equal(await ctx[api].Post.count({ where: { author: {} } }), 1)
      assert.deepEqual(calls, ['operation.many', 'filter.many'])
      calls.length = 0
      await ctx[api].Post.findMany({ cursor: { author: { name: 'visible' } }, take: 1 })
      assert.deepEqual(calls, ['operation.one', 'filter.one'])

      for (const kind of ['one', 'many'] as const) {
        const denied = context.withSession({ denyKind: kind })[api].Post
        const filtered = context.withSession({ filterKind: kind })[api].Post
        if (kind === 'one') {
          await assert.rejects(
            denied.findOne({ where: { author: { name: 'visible' } } }),
            /Access denied/
          )
          assert.equal(await filtered.findOne({ where: { author: { name: 'visible' } } }), null)
          assert.equal(await denied.count({ where: { author: {} } }), 1)
        } else {
          await assert.rejects(denied.count({ where: { author: {} } }), /Access denied/)
          assert.equal(await filtered.count({ where: { author: {} } }), 0)
          assert.equal(
            (await denied.findOne({ where: { author: { name: 'visible' } } }))?.id,
            posts[0].id
          )
        }
      }
    }
  })

  test('some, none and every quantify over visible items', async () => {
    const { context } = await seeded
    assert.equal(await context.query.Post.count({ where: { authors: { some: {} } } }), 1)
    assert.equal(await context.query.Post.count({ where: { authors: { every: {} } } }), 3)
    assert.equal(await context.query.Post.count({ where: { authors: { none: {} } } }), 2)
    assert.equal(
      await context.query.Post.count({
        where: { authors: { every: { name: { equals: 'visible' } } } },
      }),
      3
    )
    assert.equal(
      await context.query.Post.count({
        where: { authors: { every: { name: { equals: 'hidden' } } } },
      }),
      2
    )
    assert.equal(
      await context.query.Post.count({
        where: {
          authors: { every: { name: { equals: 'hidden' } }, none: { name: { equals: 'hidden' } } },
        },
      }),
      2
    )
    assert.equal(
      await context.withSession({ byLabel: true }).query.Post.count({
        where: { authors: { every: { name: { equals: 'visible' } } } },
      }),
      3
    )
    const denied = context.withSession({ denyFilter: true })
    assert.equal(await denied.query.Post.count({ where: { authors: { some: {} } } }), 0)
    assert.equal(await denied.query.Post.count({ where: { authors: { none: {} } } }), 3)
    assert.equal(await denied.query.Post.count({ where: { authors: { every: {} } } }), 3)
  })

  test('preserves Prisma empty negation behavior inside every', async () => {
    const { context, sudo } = await seeded
    const where = { authors: { every: { NOT: {} } } }
    assert.equal(await sudo.prisma.Post.count({ where }), 3)
    assert.equal(await sudo.query.Post.count({ where }), 3)
    assert.equal(await context.query.Post.count({ where }), 3)
  })

  test('applies to unique filters and mutation lookups', async () => {
    const { context, visible, hidden, posts } = await seeded
    for (const api of [context.query, context.db]) {
      assert.equal(
        (await api.Post.findOne({ where: { author: { name: 'visible' } } }))?.id,
        posts[0].id
      )
      assert.equal(await api.Post.findOne({ where: { author: { id: hidden.id } } }), null)
      assert.equal(
        (
          await api.Post.updateOne({
            where: { author: { id: visible.id } },
            data: { title: 'updated' },
          })
        )?.id,
        posts[0].id
      )
      await assert.rejects(
        api.Post.updateOne({ where: { author: { id: hidden.id } }, data: { title: 'denied' } }),
        /Access denied/
      )
      await assert.rejects(
        api.Post.deleteOne({ where: { author: { id: hidden.id } } }),
        /Access denied/
      )
    }
  })

  for (const api of ['graphql', 'query', 'db'] as const) {
    test(`${api}: cursor selectors apply relationship access`, async () => {
      const { context, posts } = await seeded
      const findMany = async (
        session: Record<string, boolean>,
        cursor: Record<string, any>,
        sudo = false
      ) => {
        const sessionContext = context.withSession(session)
        const ctx = sudo ? sessionContext.sudo() : sessionContext
        if (api === 'graphql') {
          const result = (await ctx.graphql.run({
            query: `query($cursor: PostWhereUniqueInput!) {
              posts(cursor: $cursor, take: 1) { id }
            }`,
            variables: { cursor },
          })) as { posts: { id: string }[] }
          return result.posts.map(item => item.id)
        }
        return (await ctx[api].Post.findMany({ cursor, take: 1 })).map(item => item.id)
      }
      assert.deepEqual(await findMany({}, { id: posts[0].id, author: { name: 'visible' } }), [
        posts[0].id,
      ])
      assert.deepEqual(await findMany({}, { id: posts[1].id, author: { name: 'hidden' } }), [])
      assert.deepEqual(await findMany({}, { id: posts[0].id, author: { name: 'missing' } }), [])
      assert.deepEqual(
        await findMany({ denyFilter: true }, { id: posts[0].id, author: { name: 'visible' } }),
        []
      )
      assert.deepEqual(await findMany({}, { author: { name: 'visible' } }), [posts[0].id])
      assert.deepEqual(await findMany({}, { author: { name: 'hidden' } }), [])
      assert.deepEqual(await findMany({}, { author: { post: { author: { name: 'visible' } } } }), [
        posts[0].id,
      ])
      await assert.rejects(
        findMany({ denyOperation: true }, { id: posts[0].id, author: { name: 'visible' } }),
        /Access denied/
      )
      for (const [session, pattern] of [
        [{ throwOperation: true }, /Author.access.operation.query.one/],
        [{ invalidOperation: true }, /Author.access.operation.query.one/],
        [{ throwFilter: true }, /Author.access.filter.query.one/],
        [{ invalidFilter: true }, /Author.access.filter.query.one/],
      ] as const) {
        await assert.rejects(
          findMany(session, { id: posts[0].id, author: { name: 'visible' } }),
          pattern
        )
      }
      assert.deepEqual(
        await findMany(
          { denyOperation: true },
          { id: posts[1].id, author: { name: 'hidden' } },
          true
        ),
        [posts[1].id]
      )
      assert.deepEqual(
        await findMany({}, { id: posts[0].id, author: { post: { author: { name: 'visible' } } } }),
        [posts[0].id]
      )
      assert.deepEqual(
        await findMany({}, { id: posts[0].id, author: { post: { author: { name: 'hidden' } } } }),
        []
      )
      await assert.rejects(
        findMany(
          { denyOperation: true },
          { id: posts[0].id, author: { post: { author: { name: 'visible' } } } }
        ),
        /Access denied/
      )
    })
  }

  for (const denyFilter of [false, true]) {
    for (const relationshipOnly of [false, true]) {
      test(
        `resolves relational cursors before fetching the page (denied: ${denyFilter}, relationship only: ${relationshipOnly})`,
        { timeout: 5000 },
        async () => {
          const { context, posts } = await seeded
          const ctx = context.withSession({ denyFilter })
          const prisma = ctx.prisma.Post
          let cursorResolved = false
          let pageFetched = false
          const results = await findMany(
            {
              where: {},
              cursor: (relationshipOnly
                ? { author: { name: 'visible' } }
                : { id: posts[0].id, author: { name: 'visible' } }) as any,
              orderBy: [],
              take: 1,
              skip: 0,
            },
            ctx.__internal.lists.Post,
            {
              ...ctx,
              prisma: {
                Post: {
                  async findFirst(args: unknown) {
                    const item = await prisma.findFirst(args)
                    cursorResolved = true
                    return item
                  },
                  async findMany(args: any) {
                    assert.deepEqual(args.cursor, { id: posts[0].id })
                    assert.equal(cursorResolved, true)
                    pageFetched = true
                    return prisma.findMany(args)
                  },
                },
              },
            },
            {} as Parameters<typeof findMany>[3],
            undefined
          )
          assert.equal(cursorResolved, true)
          assert.equal(pageFetched, !denyFilter)
          assert.deepEqual(
            results.map(item => item.id),
            denyFilter ? [] : [posts[0].id]
          )
        }
      )
    }
  }

  test('applies recursively and in relationship queries', async () => {
    const { context, sudo, posts } = await seeded
    const parent = await sudo.query.Post.createOne({
      data: { parent: { connect: { id: posts[1].id } } },
    })
    assert.equal(
      await context.query.Post.count({
        where: { id: { equals: parent.id }, parent: { author: {} } },
      }),
      0
    )
    const result = await context.query.Post.findOne({
      where: { id: posts[0].id },
      query: 'authors(where: { manager: {} }) { id } authorsCount(where: { manager: {} })',
    })
    assert.deepEqual(result?.authors, [])
    assert.equal(result?.authorsCount, 0)
    await sudo.query.Post.deleteOne({ where: { id: parent.id } })
  })

  test('operation denial, errors, invalid returns and sudo', async () => {
    const { context } = await seeded
    for (const where of [{ author: {} }, { author: null }, { authors: { every: {} } }]) {
      await assert.rejects(
        context.withSession({ denyOperation: true }).query.Post.count({ where }),
        /Access denied/
      )
    }
    for (const [session, pattern] of [
      [{ throwOperation: true }, /Author.access.operation.query.many/],
      [{ invalidOperation: true }, /Author.access.operation.query.many/],
      [{ throwFilter: true }, /Author.access.filter.query.many/],
      [{ invalidFilter: true }, /Author.access.filter.query.many/],
    ] as const) {
      await assert.rejects(
        context.withSession(session).query.Post.count({ where: { author: {} } }),
        pattern
      )
    }
    assert.equal(
      await context
        .withSession({ denyOperation: true })
        .sudo()
        .query.Post.count({ where: { author: {} } }),
      2
    )
  })

  test('shared operation and filter functions receive many for non-unique filters', async () => {
    const { context, sudo } = await seeded
    for (const name of ['visible', 'hidden']) {
      const shared = await sudo.query.Shared.createOne({ data: { name } })
      await sudo.query.SharedParent.createOne({ data: { shared: { connect: { id: shared.id } } } })
    }
    assert.equal(await context.query.SharedParent.count({ where: { shared: {} } }), 1)
    await assert.rejects(
      context
        .withSession({ denyOperation: true })
        .query.SharedParent.count({ where: { shared: {} } }),
      /Access denied/
    )
  })
})
