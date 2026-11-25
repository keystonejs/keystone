import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { float, relationship, text } from '@keystone-6/core/fields'
import { dbProvider, setupTestSuite } from './utils.ts'
import { mutation, query } from '../tests/api-tests/run-field.ts'

describe(`unique where inputs (${dbProvider})`, () => {
  const suite = setupTestSuite({
    config: {
      lists: {
        Post: list({
          db: { idField: { kind: 'autoincrement' } },
          access: allowAll,
          fields: {
            title: meta => {
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
            author: meta => {
              const field = relationship({ ref: 'Author.post' })(meta)
              return {
                ...field,
                input: {
                  ...field.input,
                  uniqueWhere: {
                    ...field.input!.uniqueWhere!,
                    resolve(value, _context, resolve) {
                      const { name } = value as { name?: string | null }
                      if (name === 'return-null') return null
                      if (name === 'return-undefined') return undefined
                      return resolve(value)
                    },
                  },
                },
              }
            },
          },
        }),
        Author: list({
          access: allowAll,
          fields: {
            name: text({ isIndexed: 'unique' }),
            score: meta => {
              const field = float({ db: { isNullable: true }, isIndexed: 'unique' })(meta)
              return {
                ...field,
                input: {
                  ...field.input,
                  uniqueWhere: {
                    ...field.input!.uniqueWhere!,
                    resolve: value => (value === 1 ? null : undefined),
                  },
                },
              }
            },
            post: relationship({ ref: 'Post.author' }),
          },
        }),
        Tag: list({
          access: allowAll,
          fields: {
            post: relationship({ ref: 'Post' }),
            posts: relationship({ ref: 'Post', many: true }),
          },
        }),
      },
    },
  })()
  const seeded = suite.then(async ({ context }) => {
    const [alice, bob] = await context.db.Post.createMany({
      data: [
        { title: 'alice', author: { create: { name: 'Alice' } } },
        { title: 'bob', author: { create: { name: 'Bob' } } },
      ],
    })
    return { context, alice, bob }
  })

  test('relationships in unique where inputs resolve the related unique where', async () => {
    const { context, alice } = await seeded
    const author = await context.db.Author.findOne({ where: { name: 'Alice' } })
    assert.ok(author)

    for (const { findOne, updateOne } of [
      {
        findOne: (where: Record<string, unknown>) =>
          query(context).author<{ id: string } | null>({ where, query: 'id' }),
        updateOne: (where: Record<string, unknown>) =>
          mutation(context).updateAuthor<{ id: string }>({
            where,
            data: { name: 'Alice' },
            query: 'id',
          }),
      },
      {
        findOne: (where: Record<string, unknown>) => context.db.Author.findOne({ where }),
        updateOne: (where: Record<string, unknown>) =>
          context.db.Author.updateOne({ where, data: { name: 'Alice' } }),
      },
    ]) {
      for (const where of [
        { post: { id: String(alice.id) } },
        { post: { title: 'ALICE' } },
        { post: { author: { name: 'Alice' } } },
      ]) {
        assert.equal((await findOne(where))?.id, author.id)
        assert.equal((await updateOne(where)).id, author.id)
      }
      await assert.rejects(findOne({ post: { id: 'invalid' } }), {
        message: 'Input error: Only a int can be passed to id filters',
      })
    }
  })

  test('rejects null values and empty unique wheres, including in relationships', async () => {
    const { context } = await seeded
    // nested connect errors are wrapped in a relationship error, so match the input error anywhere
    const inputError = (message: string) => new RegExp(`Input error: ${message}`)
    const nullKey = (key: string, type: string) =>
      inputError(`The key "${key}" in ${type} cannot be set to null`)
    const empty = (type: string) => inputError(`At least one key must be passed to ${type}`)
    const gql = mutation(context)
    for (const { findOne, updateOne, deleteOne, connectPost } of [
      {
        findOne: (where: Record<string, unknown>) => query(context).post({ where, query: 'id' }),
        updateOne: (where: Record<string, unknown>) =>
          gql.updatePost({ where, data: { title: 'changed' }, query: 'id' }),
        deleteOne: (where: Record<string, unknown>) => gql.deletePost({ where, query: 'id' }),
        connectPost: (where: Record<string, unknown>) =>
          gql.createTag({ data: { post: { connect: where } }, query: 'id' }),
      },
      {
        findOne: (where: Record<string, unknown>) => context.db.Post.findOne({ where }),
        updateOne: (where: Record<string, unknown>) =>
          context.db.Post.updateOne({ where, data: { title: 'changed' } }),
        deleteOne: (where: Record<string, unknown>) => context.db.Post.deleteOne({ where }),
        connectPost: (where: Record<string, unknown>) =>
          context.db.Tag.createOne({ data: { post: { connect: where } } }),
      },
    ]) {
      for (const [where, pattern] of [
        [{}, empty('PostWhereUniqueInput')],
        [{ id: null }, nullKey('id', 'PostWhereUniqueInput')],
        [{ author: null }, nullKey('author', 'PostWhereUniqueInput')],
        [{ author: { name: null } }, nullKey('name', 'AuthorWhereUniqueInput')],
        [{ author: { post: null } }, nullKey('post', 'AuthorWhereUniqueInput')],
        [{ author: {} }, empty('AuthorWhereUniqueInput')],
        [{ author: { post: {} } }, empty('PostWhereUniqueInput')],
      ] as const) {
        await assert.rejects(findOne(where), pattern)
        await assert.rejects(updateOne(where), pattern)
        await assert.rejects(deleteOne(where), pattern)
        await assert.rejects(connectPost(where), pattern)
      }
    }
    const remaining = await query(context).posts<{ title: string }[]>({ query: 'title' })
    assert.deepEqual(remaining.map(({ title }) => title).sort(), ['alice', 'bob'])
    assert.equal(await query(context).tagsCount(), 0)
  })

  test('rejects nullish scalar and relationship unique where resolver results', async () => {
    const { context } = await seeded
    for (const [where, key, type] of [
      [{ author: { score: 1 } }, 'score', 'AuthorWhereUniqueInput'],
      [{ author: { score: 2 } }, 'score', 'AuthorWhereUniqueInput'],
      [{ author: { name: 'return-null' } }, 'author', 'PostWhereUniqueInput'],
      [{ author: { name: 'return-undefined' } }, 'author', 'PostWhereUniqueInput'],
    ] as const) {
      await assert.rejects(
        context.db.Post.updateOne({
          where,
          data: { title: 'changed' },
        }),
        {
          message: `Input error: The key "${key}" in ${type} must resolve to a non-null value`,
          extensions: { code: 'KS_USER_INPUT_ERROR' },
        }
      )
    }
  })

  test('connects, sets and disconnects by relationships in unique wheres', async () => {
    const { context, alice, bob } = await seeded
    const aliceId = String(alice.id)
    const bobId = String(bob.id)
    const byAuthor = (name: string) => ({ author: { name } })
    const query = 'id post { id } posts { id }'
    type Tag = { id: string; post: { id: string } | null; posts: { id: string }[] }
    const postIds = (tag: Tag) => tag.posts.map(({ id }) => id).sort()
    const gql = mutation(context)

    const tag = await gql.createTag<Tag>({
      data: {
        post: { connect: byAuthor('Alice') },
        posts: { connect: [byAuthor('Alice'), byAuthor('Bob')] },
      },
      query,
    })
    assert.equal(tag.post?.id, aliceId)
    assert.deepEqual(postIds(tag), [aliceId, bobId].sort())

    const where = { id: tag.id }
    let updated = await gql.updateTag<Tag>({
      where,
      data: { posts: { disconnect: [byAuthor('Alice')] } },
      query,
    })
    assert.deepEqual(postIds(updated), [bobId])
    updated = await gql.updateTag<Tag>({
      where,
      data: { posts: { set: [byAuthor('Alice')] } },
      query,
    })
    assert.deepEqual(postIds(updated), [aliceId])

    await context.db.Tag.deleteOne({ where })
  })
})
