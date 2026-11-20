import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { g, list } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { integer, relationship, text } from '@keystone-6/core/fields'
import type { KeystoneContext } from '@keystone-6/core/types'
import { mutation, query } from '../tests/api-tests/run-field.ts'
import { dbProvider, setupTestSuite } from './utils.ts'

const apis = ['graphql', 'db'] as const

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
          access: allowAll,
          fields: {
            title: text(),
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
})
