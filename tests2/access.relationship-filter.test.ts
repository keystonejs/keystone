import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { checkbox, relationship, text } from '@keystone-6/core/fields'
import { dbProvider, setupTestSuite } from './utils.ts'
import { mutation, query } from '../tests/api-tests/run-field.ts'

import type {
  BaseListTypeInfo,
  KeystoneContext,
  ListQueryAccessControl,
  ListQueryFilterAccessControl,
  QueryOperationKind,
} from '@keystone-6/core/types'

// a custom relationship field that copies the resolved filter, which a sentinel must survive
function spreadingRelationship(config: Parameters<typeof relationship>[0]) {
  return ((meta: any) => {
    const field = relationship(config)(meta)
    const where = field.input!.where!
    return {
      ...field,
      input: {
        ...field.input,
        where: {
          ...where,
          resolve: async (value: any, context: any, resolve: any) => ({
            ...(await where.resolve!(value, context, resolve)),
          }),
        },
      },
    }
  }) as typeof relationship extends (...args: any) => infer R ? R : never
}

function relationshipOperation<Kind extends QueryOperationKind>(
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

function relationshipFilter<Kind extends QueryOperationKind>(
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
            count: relationshipOperation('count'),
          },
        },
        filter: {
          query: {
            one: relationshipFilter('one'),
            many: relationshipFilter('many'),
            count: relationshipFilter('count'),
          },
        },
      },
      fields: {
        name: text({
          isIndexed: 'unique',
          access: {
            read: {
              item: allowAll,
              filter: ({ session }) => {
                session?.traceFilterResolution?.push('field.name')
                return true
              },
              order: allowAll,
            },
          },
        }),
        visible: checkbox(),
        label: text({ db: { isNullable: true } }),
        manager: relationship({ ref: 'Author' }),
        post: relationship({ ref: 'Post.author' }),
      },
    }),
    Post: list({
      access: {
        operation: args =>
          args.operation !== 'query' || args.kind !== 'one' || !args.session?.denyPostLookup,
      },
      fields: {
        title: text(),
        author: meta => {
          const field = relationship({ ref: 'Author.post' })(meta)
          return {
            ...field,
            input: {
              ...field.input,
              where: {
                ...field.input!.where!,
                async resolve(value, context, resolve) {
                  const result = await resolve(value)
                  context.session?.traceFilterResolution?.push('resolved')
                  return result
                },
              },
              uniqueWhere: {
                ...field.input!.uniqueWhere!,
                async resolve(value, context, resolve) {
                  const result = await resolve(value)
                  context.session?.traceFilterResolution?.push('resolved')
                  return result
                },
              },
            },
          }
        },
        authors: relationship({ ref: 'Author', many: true }),
        parent: relationship({ ref: 'Post' }),
      },
    }),
    Shared: list({
      access: {
        operation: args => args.operation !== 'query' || args.kind !== args.session?.denyKind,
        filter: {
          query: ({ kind }) => (kind === 'one' ? true : { name: { equals: 'visible' } }),
        },
      },
      fields: { name: text() },
    }),
    SharedParent: list({
      access: allowAll,
      fields: { shared: relationship({ ref: 'Shared' }) },
    }),
    Plain: list({
      access: allowAll,
      fields: {
        author: relationship({ ref: 'Author' }),
        authors: relationship({ ref: 'Author', many: true }),
      },
    }),
    Spread: list({
      access: allowAll,
      fields: {
        author: spreadingRelationship({ ref: 'Author' }),
        authors: spreadingRelationship({ ref: 'Author', many: true }),
      },
    }),
  },
}

const apis = ['graphql', 'db'] as const

function postAPI(context: KeystoneContext, api: (typeof apis)[number]) {
  if (api === 'db') return context.db.Post

  const graphql = query(context)
  const mutate = mutation(context)
  type Post = { id: string }
  return {
    findOne: ({ where }: { where: Record<string, unknown> }) =>
      graphql.post<Post | null>({ where, query: 'id' }),
    findMany: ({ where }: { where: Record<string, unknown> }) =>
      graphql.posts<Post[]>({ where, query: 'id' }),
    count: ({ where }: { where: Record<string, unknown> }) => graphql.postsCount<number>({ where }),
    updateOne: ({ where, data }: { where: Record<string, unknown>; data: { title: string } }) =>
      mutate.updatePost<Post>({ where, data, query: 'id' }),
    deleteOne: ({ where }: { where: Record<string, unknown> }) =>
      mutate.deletePost<Post>({ where, query: 'id' }),
  }
}

describe(`relationship filter access (${dbProvider})`, () => {
  const suite = setupTestSuite({ config })()
  const seeded = (async () => {
    const { context } = await suite
    const sudo = context.sudo()
    const [visible, hidden] = await sudo.db.Author.createMany({
      data: [
        { name: 'visible', visible: true, label: 'visible' },
        { name: 'hidden', visible: false },
      ],
      select: { id: true },
    })
    // Create sequentially to avoid concurrent writes to the shared authors join table.
    const posts = [
      await sudo.db.Post.createOne({
        select: { id: true },
        data: {
          title: 'visible',
          author: { connect: { id: visible.id } },
          authors: { connect: [visible, hidden] },
        },
      }),
      await sudo.db.Post.createOne({
        select: { id: true },
        data: {
          title: 'hidden',
          author: { connect: { id: hidden.id } },
          authors: { connect: [hidden] },
        },
      }),
      await sudo.db.Post.createOne({ data: { title: 'empty' }, select: { id: true } }),
    ]
    return { context, sudo, visible, hidden, posts }
  })()

  test('applies to non-unique filters in GraphQL and db APIs, including boolean operators', async () => {
    const { context, sudo, visible } = await seeded
    for (const api of apis) {
      const post = postAPI(context, api)
      assert.equal(await post.count({ where: { author: {} } }), 1)
      assert.equal(
        await post.count({ where: { OR: [{ author: { name: { equals: 'hidden' } } }] } }),
        0
      )
      assert.equal(await post.count({ where: { NOT: [{ author: {} }] } }), 2)
      assert.equal(
        (await post.findMany({ where: { author: { id: { equals: visible.id } } } })).length,
        1
      )
      assert.equal(await post.count({ where: { author: null } }), 2)
    }
    assert.equal(await query(sudo).postsCount({ where: { author: {} } }), 2)
    assert.equal(await query(sudo).postsCount({ where: { author: null } }), 1)
    assert.equal(await query(context).authorsCount(), 1)
  })

  test('matches to-one null filters when related access compares a nullable field', async () => {
    const { context, posts } = await seeded
    const post = context.withSession({ byLabel: true }).db.Post
    const where = { author: null }

    const results = await post.findMany({ where })
    assert.deepEqual(new Set(results.map(({ id }) => id)), new Set([posts[1].id, posts[2].id]))
    assert.equal(await post.count({ where }), 2)
  })

  test('routes to-one relationship access by the outer operation', async () => {
    const { context, posts } = await seeded
    for (const api of apis) {
      const calls: string[] = []
      const post = postAPI(context.withSession({ calls }), api)
      const whereOne = { author: { name: 'visible' } }
      const where = { author: {} }
      assert.equal((await post.findOne({ where: whereOne }))?.id, posts[0].id)
      assert.deepEqual(calls, ['operation.one', 'filter.one'])
      calls.length = 0
      assert.equal((await post.findMany({ where })).length, 1)
      assert.deepEqual(calls, ['operation.many', 'filter.many'])
      calls.length = 0
      assert.equal(await post.count({ where }), 1)
      assert.deepEqual(calls, ['operation.count', 'filter.count'])

      for (const kind of ['one', 'many', 'count'] as const) {
        for (const session of [{ denyKind: kind }, { filterKind: kind }]) {
          const post = postAPI(context.withSession(session), api)
          const item = await post.findOne({ where: whereOne })
          assert.equal(item?.id, kind === 'one' ? undefined : posts[0].id)
          assert.equal((await post.findMany({ where })).length, kind === 'many' ? 0 : 1)
          assert.equal(await post.count({ where }), kind === 'count' ? 0 : 1)
        }
      }
    }
  })

  test('runs related list access once per kind while resolving a filter', async () => {
    const { context } = await seeded
    const calls: string[] = []
    await query(context.withSession({ calls })).postsCount({
      where: {
        OR: [
          { author: {} },
          { author: { name: { equals: 'visible' } } },
          { authors: { some: {} } },
          { NOT: { authors: { none: { manager: {} } } } },
        ],
      },
    })
    assert.deepEqual(calls, ['operation.count', 'filter.count'])
  })

  test('checks original fields before running related-list access in resolve callbacks', async () => {
    const { context } = await seeded
    const calls: string[] = []
    const post = context.withSession({ calls, traceFilterResolution: calls }).db.Post

    await post.findOne({ where: { author: { name: 'visible' } } })
    assert.deepEqual(calls, ['field.name', 'operation.one', 'filter.one', 'resolved'])

    calls.length = 0
    await post.findMany({ where: { author: { name: { equals: 'visible' } } } })
    assert.deepEqual(calls, ['field.name', 'operation.many', 'filter.many', 'resolved'])
  })

  test('some, none and every quantify over visible items', async () => {
    const { context } = await seeded
    assert.equal(await query(context).postsCount({ where: { authors: { some: {} } } }), 1)
    assert.equal(await query(context).postsCount({ where: { authors: { every: {} } } }), 3)
    assert.equal(await query(context).postsCount({ where: { authors: { none: {} } } }), 2)
    assert.equal(
      await query(context).postsCount({
        where: { authors: { every: { name: { equals: 'visible' } } } },
      }),
      3
    )
    assert.equal(
      await query(context).postsCount({
        where: { authors: { every: { name: { equals: 'hidden' } } } },
      }),
      2
    )
    assert.equal(
      await query(context).postsCount({
        where: {
          authors: { every: { name: { equals: 'hidden' } }, none: { name: { equals: 'hidden' } } },
        },
      }),
      2
    )
    assert.equal(
      await query(context.withSession({ byLabel: true })).postsCount({
        where: { authors: { every: { name: { equals: 'visible' } } } },
      }),
      3
    )
    const denied = context.withSession({ denyFilter: true })
    assert.equal(await query(denied).postsCount({ where: { authors: { some: {} } } }), 0)
    assert.equal(await query(denied).postsCount({ where: { authors: { none: {} } } }), 3)
    assert.equal(await query(denied).postsCount({ where: { authors: { every: {} } } }), 3)
  })

  test('preserves boolean operators when related items are inaccessible', async () => {
    const { context, posts } = await seeded
    const denied = context.withSession({ denyFilter: true })

    for (const where of [{ author: null }, { authors: { none: {} } }, { authors: { every: {} } }]) {
      assert.equal(await query(denied).postsCount({ where: { NOT: [where] } }), 0)
      assert.equal(
        await query(denied).postsCount({
          where: { OR: [{ title: { equals: 'missing' } }, where] },
        }),
        posts.length
      )
    }
  })

  test('preserves Prisma empty negation behavior inside every', async () => {
    const { context, sudo } = await seeded
    const where = { authors: { every: { NOT: {} } } }
    assert.equal(await sudo.prisma.Post.count({ where }), 3)
    assert.equal(await query(sudo).postsCount({ where }), 3)
    assert.equal(await query(context).postsCount({ where }), 3)
  })

  test('applies to unique filters and mutation lookups', async () => {
    const { context, visible, hidden, posts } = await seeded
    for (const api of apis) {
      const calls: string[] = []
      const post = postAPI(context.withSession({ calls }), api)
      assert.equal(
        (await post.findOne({ where: { author: { name: 'visible' } } }))?.id,
        posts[0].id
      )
      assert.equal(await post.findOne({ where: { author: { id: hidden.id } } }), null)
      calls.length = 0
      assert.equal(
        (
          await post.updateOne({
            where: { author: { id: visible.id } },
            // keep the seeded title so other tests see the same data
            data: { title: 'visible' },
          })
        )?.id,
        posts[0].id
      )
      assert.deepEqual(calls, ['operation.one', 'filter.one'])
      await assert.rejects(
        post.updateOne({ where: { author: { id: hidden.id } }, data: { title: 'denied' } }),
        /Access denied/
      )
      await assert.rejects(
        post.deleteOne({ where: { author: { id: hidden.id } } }),
        /Access denied/
      )
    }
  })

  test('custom relationship fields that copy the resolved filter get the same results', async () => {
    const { context, sudo, visible, hidden } = await seeded
    const data = [
      { author: { connect: { id: visible.id } }, authors: { connect: [visible, hidden] } },
      { author: { connect: { id: hidden.id } }, authors: { connect: [hidden] } },
      {},
    ]
    for (const listKey of ['Plain', 'Spread'] as const) {
      for (const item of data) await sudo.db[listKey].createOne({ data: item })
    }
    const filters = [
      { author: null },
      { author: {} },
      { author: { name: { equals: 'visible' } } },
      { authors: { some: {} } },
      { authors: { none: {} } },
      { authors: { every: {} } },
    ]
    for (const session of [undefined, { denyFilter: true }, { denyOperation: true }]) {
      const ctx = session ? context.withSession(session) : context
      for (const filter of filters) {
        for (const where of [filter, { NOT: [filter] }, { OR: [filter] }]) {
          assert.equal(
            await query(ctx).spreadsCount({ where }),
            await query(ctx).plainsCount({ where }),
            JSON.stringify({ session, where })
          )
        }
      }
    }
    for (const listKey of ['Plain', 'Spread'] as const) {
      await sudo.db[listKey].deleteMany({
        where: (await sudo.db[listKey].findMany({ select: { id: true } })).map(({ id }) => ({
          id: id.toString(),
        })),
      })
    }
  })

  test('applies related list access to relationships in nested connect selectors', async () => {
    const { context, sudo, visible, hidden, posts } = await seeded
    const selection = 'id authors { id }'
    type Post = { id: string; authors: { id: string }[] }
    const authorIds = (item: Post) => item.authors.map(({ id }) => id).sort()

    const data = { authors: { connect: [{ post: { id: posts[0].id } }] } }
    const denied = context.withSession({ denyPostLookup: true })
    assert.equal(
      (await denied.db.Author.findOne({ where: { id: visible.id.toString() } }))?.id,
      visible.id
    )
    await assert.rejects(
      mutation(denied).createPost({ data, query: 'id' }),
      /Access denied: You cannot connect that Author/
    )
    const post = await mutation(context).createPost<Post>({ data, query: selection })
    assert.deepEqual(authorIds(post), [visible.id])

    const where = { id: post.id }
    const hiddenAuthor = { post: { id: posts[1].id } }
    const updated = await mutation(sudo).updatePost<Post>({
      where,
      data: { authors: { connect: [hiddenAuthor] } },
      query: selection,
    })
    assert.deepEqual(authorIds(updated), [visible.id, hidden.id].sort())

    await sudo.db.Post.deleteOne({ where })
  })

  test('applies recursively and in relationship queries', async () => {
    const { context, sudo, posts } = await seeded
    const parent = await sudo.db.Post.createOne({
      data: { parent: { connect: { id: posts[1].id } } },
    })
    assert.equal(
      await query(context).postsCount({
        where: { id: { equals: parent.id }, parent: { author: {} } },
      }),
      0
    )
    const result = await query(context).post<{
      authors: { id: string }[]
      authorsCount: number
    } | null>({
      where: { id: posts[0].id },
      query: 'authors(where: { manager: {} }) { id } authorsCount(where: { manager: {} })',
    })
    assert.deepEqual(result?.authors, [])
    assert.equal(result?.authorsCount, 0)
    await sudo.db.Post.deleteOne({ where: { id: parent.id.toString() } })
  })

  test('operation denial, errors, invalid returns and sudo', async () => {
    const { context } = await seeded
    // denied operation access behaves the same as an access filter returning false
    for (const where of [
      { author: {} },
      { author: null },
      { authors: { some: {} } },
      { authors: { none: {} } },
      { authors: { every: {} } },
    ]) {
      assert.equal(
        await query(context.withSession({ denyOperation: true })).postsCount({ where }),
        await query(context.withSession({ denyFilter: true })).postsCount({ where })
      )
    }
    for (const [session, pattern] of [
      [{ throwOperation: true }, /Author.access.operation.query.count/],
      [{ invalidOperation: true }, /Author.access.operation.query.count/],
      [{ throwFilter: true }, /Author.access.filter.query.count/],
      [{ invalidFilter: true }, /Author.access.filter.query.count/],
    ] as const) {
      await assert.rejects(
        query(context.withSession(session)).postsCount({ where: { author: {} } }),
        pattern
      )
    }
    assert.equal(
      await query(context.withSession({ denyOperation: true }).sudo()).postsCount({
        where: { author: {} },
      }),
      2
    )
  })

  test('shared operation and filter functions distinguish many and count', async () => {
    const { context, sudo } = await seeded
    for (const name of ['visible', 'hidden']) {
      const shared = await sudo.db.Shared.createOne({ data: { name } })
      await sudo.db.SharedParent.createOne({ data: { shared: { connect: { id: shared.id } } } })
    }
    const where = { shared: {} }
    for (const denyKind of [undefined, 'many', 'count'] as const) {
      const graphql = query(context.withSession({ denyKind }))
      const parents = await graphql.sharedParents<{ id: string }[]>({ where, query: 'id' })
      assert.equal(parents.length, denyKind === 'many' ? 0 : 1)
      assert.equal(await graphql.sharedParentsCount({ where }), denyKind === 'count' ? 0 : 1)
    }
  })
})
