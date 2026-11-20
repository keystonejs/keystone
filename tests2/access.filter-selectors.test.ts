import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { action, g, list } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { integer, relationship, text } from '@keystone-6/core/fields'
import type { KeystoneContext } from '@keystone-6/core/types'
import { mutation, query } from '../tests/api-tests/run-field.ts'
import { dbProvider, setupTestSuite } from './utils.ts'

const apis = ['graphql', 'db'] as const

function mutationOperationAccess({ session }: Pick<KeystoneContext, 'session'>) {
  session?.accessCalls?.push('operation')
  return !session?.denyOperation
}

function mutationFilterAccess({ session }: Pick<KeystoneContext, 'session'>) {
  session?.accessCalls?.push('filter')
  return true
}

function postAPI(context: KeystoneContext, api: (typeof apis)[number]) {
  if (api === 'db') return context.db.Post

  const graphql = query(context)
  const mutate = mutation(context)
  type Post = { id: string }
  return {
    findOne: ({ where }: { where: Record<string, unknown> }) =>
      graphql.post<Post | null>({ where, query: 'id' }),
    updateOne: ({ where, data }: { where: Record<string, unknown>; data: { title: string } }) =>
      mutate.updatePost<Post>({ where, data, query: 'id' }),
    deleteOne: ({ where }: { where: Record<string, unknown> }) =>
      mutate.deletePost<Post>({ where, query: 'id' }),
  }
}

describe(`selector field access (${dbProvider})`, () => {
  const suite = setupTestSuite({
    config: {
      lists: {
        Author: list({
          access: allowAll,
          fields: {
            name: text({
              isIndexed: 'unique',
              access: {
                read: {
                  item: allowAll,
                  filter: ({ session }) => !session?.denyNameFilter,
                  order: allowAll,
                },
              },
            }),
            some: integer({
              isIndexed: 'unique',
              access: { read: { item: allowAll, filter: denyAll, order: allowAll } },
            }),
            post: relationship({ ref: 'Post.author' }),
            aliasedPost: relationship({ ref: 'Post.authorByAlias' }),
          },
        }),
        Post: list({
          access: {
            operation: mutationOperationAccess,
            filter: { update: mutationFilterAccess, delete: mutationFilterAccess },
          },
          actions: {
            publish: action({
              access: mutationOperationAccess,
              ui: { label: 'Publish' },
              resolve: ({ where }, context) => context.db.Post.findOne({ where }),
            }),
          },
          fields: {
            title: meta => {
              const field = text({
                access: {
                  read: {
                    item: allowAll,
                    filter: ({ session }) => !session?.denyTitleFilter,
                    order: allowAll,
                  },
                },
              })(meta)
              const where = field.input!.where!
              return {
                ...field,
                input: {
                  ...field.input,
                  where: {
                    ...where,
                    resolve(_value, context) {
                      context.session?.accessCalls?.push('resolve')
                      throw new Error('Cannot resolve access filter')
                    },
                  },
                },
              }
            },
            author: meta => {
              const field = relationship({ ref: 'Author.post' })(meta)
              const uniqueWhere = field.input!.uniqueWhere!
              return {
                ...field,
                input: {
                  ...field.input,
                  uniqueWhere: {
                    ...uniqueWhere,
                    resolve(value, context) {
                      context.session?.resolvedSelectors?.push(value)
                      if (context.session?.authorNumber !== undefined) {
                        return { some: context.session.authorNumber }
                      }
                      return value
                    },
                  },
                },
              }
            },
            authorByAlias: meta => {
              const field = relationship({
                ref: 'Author.aliasedPost',
                access: {
                  read: {
                    item: allowAll,
                    filter: ({ session }) => !session?.denyAliasFilter,
                    order: allowAll,
                  },
                },
              })(meta)
              return {
                ...field,
                input: {
                  ...field.input,
                  uniqueWhere: {
                    arg: g.arg({
                      type: g.inputObject({
                        name: 'AuthorAliasInput',
                        isOneOf: false,
                        fields: { some: g.arg({ type: g.nonNull(g.ID) }) },
                      }),
                    }),
                    resolve: value => ({ id: (value as { some: string }).some }),
                  },
                },
              }
            },
          },
        }),
        Tag: list({
          access: allowAll,
          fields: { post: relationship({ ref: 'Post' }) },
        }),
      },
    },
  })()
  const seeded = suite.then(async ({ context }) => {
    const sudo = context.sudo()
    const author = await sudo.db.Author.createOne({ data: { name: 'Alice', some: 1 } })
    const post = await sudo.db.Post.createOne({
      data: {
        title: 'Post',
        author: { connect: { id: author.id } },
        authorByAlias: { connect: { id: author.id } },
      },
    })
    return { context, sudo, author, post }
  })

  test('checks the caller-supplied fields in unique selectors', async () => {
    const { context, sudo, post } = await seeded
    const where = { author: { name: 'ignored by the resolver' } }
    const data = { title: 'Post' }
    const direct = { author: { some: 1 } }
    const deniedName = /You cannot filter that Author.*name/
    const deniedSome = /You cannot filter that Author.*some/

    assert.equal((await sudo.db.Post.findOne({ where: direct }))?.id, post.id)
    for (const api of apis) {
      const allowed = postAPI(context.withSession({ authorNumber: 1 }), api)
      assert.equal((await allowed.findOne({ where }))?.id, post.id)
      assert.equal((await allowed.updateOne({ where, data })).id, post.id)

      const resolvedSelectors: unknown[] = []
      const restricted = postAPI(
        context.withSession({ authorNumber: 1, denyNameFilter: true, resolvedSelectors }),
        api
      )
      await assert.rejects(restricted.findOne({ where }), deniedName)
      await assert.rejects(restricted.updateOne({ where, data }), deniedName)
      await assert.rejects(restricted.deleteOne({ where }), deniedName)
      assert.deepEqual(resolvedSelectors, [])

      const untransformed = postAPI(context, api)
      await assert.rejects(untransformed.findOne({ where: direct }), deniedSome)
      await assert.rejects(untransformed.updateOne({ where: direct, data }), deniedSome)
      await assert.rejects(untransformed.deleteOne({ where: direct }), deniedSome)
    }
  })

  test('checks the relationship field for custom selector inputs', async () => {
    const { context, author, post } = await seeded
    const where = { authorByAlias: { some: author.id } }

    for (const api of apis) {
      assert.equal((await postAPI(context, api).findOne({ where }))?.id, post.id)

      const restricted = postAPI(context.withSession({ denyAliasFilter: true }), api)
      await assert.rejects(
        restricted.findOne({ where }),
        /You cannot filter that Post.*authorByAlias/
      )
    }
  })

  test('checks field filter access before resolving list and count filters', async () => {
    const { context } = await seeded
    const accessCalls: string[] = []
    const post = context.withSession({ denyTitleFilter: true, accessCalls }).db.Post
    const where = { title: { equals: 'Post' } }
    const deniedTitle = /You cannot filter that Post.*title/

    await assert.rejects(post.findMany({ where }), deniedTitle)
    await assert.rejects(post.count({ where }), deniedTitle)
    assert.deepEqual(accessCalls, ['operation', 'operation'])
  })

  test('checks bulk access once and reports denials per item', async () => {
    const { context, post } = await seeded
    const where = `{ id: ${JSON.stringify(post.id)} }`
    const update = `{ where: ${where}, data: { title: "Updated" } }`
    const actionInput = `{ where: ${where} }`
    const mutations = [
      'createPosts(data: [{ title: "One" }, { title: "Two" }])',
      `updatePosts(data: [${update}, ${update}])`,
      `deletePosts(where: [${where}, ${where}])`,
      `publishPosts(data: [${actionInput}, ${actionInput}])`,
    ]

    for (const field of mutations) {
      const accessCalls: string[] = []
      const { data, errors } = await context
        .withSession({ denyOperation: true, accessCalls })
        .graphql.raw<{ result: null[] }, Record<string, never>>({
          query: `mutation { result: ${field} { id } }`,
        })

      assert.deepEqual(accessCalls, ['operation'])
      assert.deepEqual(data?.result, [null, null])
      assert.ok(errors)
      assert.deepEqual(
        errors.map(error => error.path),
        [
          ['result', 0],
          ['result', 1],
        ]
      )
      for (const error of errors) assert.match(error.message, /Access denied/)
    }
  })

  test('checks connect selectors before resolving relationship fields', async () => {
    const { context } = await seeded
    const resolvedSelectors: unknown[] = []
    const restricted = context.withSession({ denyNameFilter: true, resolvedSelectors })

    await assert.rejects(
      restricted.db.Tag.createOne({
        data: { post: { connect: { author: { name: 'Alice' } } } },
      }),
      /You cannot connect that Post/
    )
    assert.deepEqual(resolvedSelectors, [])

    await assert.rejects(
      context.db.Tag.createOne({ data: { post: { connect: { id: '' } } } }),
      /Input error: Only a string can be passed to id filters/
    )
  })
})
