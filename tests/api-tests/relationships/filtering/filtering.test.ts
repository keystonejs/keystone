import { describe, expect, test } from 'vitest'
import { text, relationship } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import { query } from '../../run-field.ts'

type IdType = any

const runner = setupTestRunner({
  config: {
    lists: {
      User: list({
        fields: {
          company: relationship({ ref: 'Company' }),
          posts: relationship({ ref: 'Post', many: true }),
        },
        access: allowAll,
      }),
      Company: list({ access: allowAll, fields: { name: text() } }),
      Post: list({ access: allowAll, fields: { content: text() } }),
    },
  },
})

describe('relationship filtering', () => {
  test(
    'nested to-single relationships can be filtered within AND clause',
    runner(async ({ context }) => {
      const company = await context.db.Company.createOne({
        data: { name: 'Thinkmill' },
        select: { id: true },
      })
      const otherCompany = await context.db.Company.createOne({
        data: { name: 'Cete' },
        select: { id: true },
      })

      const user = await context.db.User.createOne({
        data: { company: { connect: { id: company.id } } },
        select: { id: true },
      })
      await context.db.User.createOne({
        data: { company: { connect: { id: otherCompany.id } } },
      })

      const users = await query(context).users({
        where: {
          AND: [
            { company: { name: { contains: 'in' } } },
            { company: { name: { contains: 'll' } } },
          ],
        },
        query: 'id company { id name }',
      })

      expect(users).toHaveLength(1)
      expect(users).toMatchObject([{ id: user.id, company: { id: company.id, name: 'Thinkmill' } }])
    })
  )

  test(
    'nested to-single relationships can be filtered within OR clause',
    runner(async ({ context }) => {
      const company = await context.db.Company.createOne({
        data: { name: 'Thinkmill' },
        select: { id: true },
      })
      const otherCompany = await context.db.Company.createOne({
        data: { name: 'Cete' },
        select: { id: true },
      })

      const user = await context.db.User.createOne({
        data: { company: { connect: { id: company.id } } },
        select: { id: true },
      })
      await context.db.User.createOne({
        data: { company: { connect: { id: otherCompany.id } } },
      })

      const users = await query(context).users({
        where: {
          OR: [
            { company: { name: { contains: 'in' } } },
            { company: { name: { contains: 'xx' } } },
          ],
        },
        query: 'id company { id name }',
      })
      expect(users).toHaveLength(1)
      expect(users).toMatchObject([{ id: user.id, company: { id: company.id, name: 'Thinkmill' } }])
    })
  )

  test(
    'nested to-many relationships can be filtered within AND clause',
    runner(async ({ context }) => {
      const ids = []

      ids.push((await context.db.Post.createOne({ data: { content: 'Hello world' } })).id)
      ids.push((await context.db.Post.createOne({ data: { content: 'hi world' } })).id)
      ids.push((await context.db.Post.createOne({ data: { content: 'Hello? Or hi?' } })).id)

      const user = await context.db.User.createOne({
        data: { posts: { connect: ids.map(id => ({ id })) } },
        select: { id: true },
      })

      // Create a dummy user to make sure we're actually filtering it out
      await context.db.User.createOne({ data: {} })

      const users = (await query(context).users({
        where: {
          AND: [
            { posts: { some: { content: { contains: 'hi' } } } },
            { posts: { some: { content: { contains: 'lo' } } } },
          ],
        },
        query: 'id posts { id content }',
      })) as { id: IdType; posts: { id: IdType; content: string }[] }[]
      expect(users).toHaveLength(1)
      expect(users[0].id).toEqual(user.id)
      expect(users[0].posts).toHaveLength(3)
      expect(users[0].posts.map(({ id }) => id).sort()).toEqual(ids.sort())
    })
  )

  test(
    'nested to-many relationships can be filtered within OR clause',
    runner(async ({ context }) => {
      const ids = []

      ids.push((await context.db.Post.createOne({ data: { content: 'Hello world' } })).id)
      ids.push((await context.db.Post.createOne({ data: { content: 'hi world' } })).id)
      ids.push((await context.db.Post.createOne({ data: { content: 'Hello? Or hi?' } })).id)

      const user = await context.db.User.createOne({
        data: { posts: { connect: ids.map(id => ({ id })) } },
        select: { id: true },
      })

      // Create a dummy user to make sure we're actually filtering it out
      await context.db.User.createOne({ data: {} })

      const users = (await query(context).users({
        where: {
          OR: [
            { posts: { some: { content: { contains: 'o w' } } } },
            { posts: { some: { content: { contains: '? O' } } } },
          ],
        },
        query: 'id posts { id content }',
      })) as { id: IdType; posts: { id: IdType; content: string }[] }[]
      expect(users).toHaveLength(1)
      expect(users[0].id).toEqual(user.id)
      expect(users[0].posts).toHaveLength(3)
      expect(users[0].posts.map(({ id }) => id).sort()).toEqual(ids.sort())
    })
  )

  test(
    'many-to-many filtering composes with one-to-many filtering',
    runner(async ({ context }) => {
      const adsCompany = await context.db.Company.createOne({
        data: { name: 'AdsAdsAds' },
        select: { id: true, name: true },
      })
      const otherCompany = await context.db.Company.createOne({
        data: { name: 'Thinkmill' },
        select: { id: true, name: true },
      })

      // Content can have multiple authors
      const spam1 = await context.db.Post.createOne({
        data: { content: 'spam' },
        select: { id: true },
      })
      const spam2 = await context.db.Post.createOne({
        data: { content: 'spam' },
        select: { id: true },
      })
      const content = await context.db.Post.createOne({
        data: { content: 'cute cat pics' },
        select: { id: true },
      })

      const spammyUser = await context.db.User.createOne({
        data: {
          company: { connect: { id: adsCompany.id } },
          posts: { connect: [{ id: spam1.id }, { id: spam2.id }] },
        },
        select: { id: true },
      })
      const mixedUser = await context.db.User.createOne({
        data: {
          company: { connect: { id: adsCompany.id } },
          posts: { connect: [{ id: spam1.id }, { id: content.id }] },
        },
        select: { id: true },
      })
      const nonSpammyUser = await context.db.User.createOne({
        data: {
          company: { connect: { id: adsCompany.id } },
          posts: { connect: [{ id: content.id }] },
        },
        select: { id: true },
      })
      const quietUser = await context.db.User.createOne({
        data: { company: { connect: { id: adsCompany.id } } },
        select: { id: true },
      })
      await context.db.User.createOne({
        data: {
          company: { connect: { id: otherCompany.id } },
          posts: { connect: [{ id: content.id }] },
        },
      })
      await context.db.User.createOne({
        data: {
          company: { connect: { id: otherCompany.id } },
          posts: { connect: [{ id: spam1.id }] },
        },
      })

      // adsCompany users whose every post is spam
      // NB: this includes users who have no posts at all
      type T = {
        id: IdType
        company: { id: IdType; name: string }
        posts: { content: string }[]
      }[]
      const users = (await query(context).users({
        where: {
          company: { name: { equals: adsCompany.name } },
          posts: { every: { content: { equals: 'spam' } } },
        },
        query: 'id company { id name } posts { content }',
      })) as T
      expect(users).toHaveLength(2)
      expect(users.map(u => u.company.id)).toEqual([adsCompany.id, adsCompany.id])
      expect(users.map(u => u.id).sort()).toEqual([spammyUser.id, quietUser.id].sort())
      expect(users.map(u => u.posts.every(p => p.content === 'spam'))).toEqual([true, true])

      // adsCompany users with no spam
      const users2 = (await query(context).users({
        where: {
          company: { name: { equals: adsCompany.name } },
          posts: { none: { content: { equals: 'spam' } } },
        },
        query: 'id company { id name } posts { content }',
      })) as T

      expect(users2).toHaveLength(2)
      expect(users2.map(u => u.company.id)).toEqual([adsCompany.id, adsCompany.id])
      expect(users2.map(u => u.id).sort()).toEqual([nonSpammyUser.id, quietUser.id].sort())
      expect(users2.map(u => u.posts.every(p => p.content !== 'spam'))).toEqual([true, true])

      // adsCompany users with some spam
      const users3 = (await query(context).users({
        where: {
          company: { name: { equals: adsCompany.name } },
          posts: { some: { content: { equals: 'spam' } } },
        },
        query: 'id company { id name } posts { content }',
      })) as T

      expect(users3).toHaveLength(2)
      expect(users3.map(u => u.company.id)).toEqual([adsCompany.id, adsCompany.id])
      expect(users3.map(u => u.id).sort()).toEqual([mixedUser.id, spammyUser.id].sort())
      expect(users3.map(u => u.posts.some(p => p.content === 'spam'))).toEqual([true, true])
    })
  )
})
