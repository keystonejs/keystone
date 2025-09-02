import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { dbProvider, setupTestSuite } from './utils'
import { config, expectEqualItem, expectEqualItems, lists, seed, seedMany } from './utils2'

describe(`*.access.[query/read] tests (${dbProvider})`, () => {
  const suite = setupTestSuite({ config })()

  for (const l of lists) {
    const itemQuery = `id ${l.fields.map(x => x.name).join(' ')}`

    test(`findOne ${l.name}`, async () => {
      const { context } = await suite
      const seeded = await seed(l, context)

      // test list.access.*.query
      const item = await context.query[l.name].findOne({
        where: { id: seeded.id },
        query: itemQuery,
      })

      if (!l.expect.query) {
        assert.equal(item, null)
        return
      }

      // test field.access.read
      expectEqualItem(l, item, seeded)
    })

    test(`findMany ${l.name}`, async () => {
      const { context } = await suite
      const seeded = await seedMany(l, context)

      // test list.access.*.query
      const items = await context.query[l.name].findMany({
        where: {
          id: {
            in: seeded.map(s => s.id),
          },
        },
        query: itemQuery,
      })

      if (!l.expect.query) {
        assert.deepEqual(items, [])
        return
      }

      // test field.access.read
      expectEqualItems(l, items, seeded)
    })

    test(`count ${l.name}`, async () => {
      const { context } = await suite
      const seeded = await seedMany(l, context)

      // test list.access.*.query
      const count = await context.query[l.name].count({
        where: {
          id: {
            in: seeded.map(s => s.id),
          },
        },
      })

      if (l.expect.query) {
        assert.equal(count, seeded.length)
      } else {
        assert.equal(count, 0)
      }
    })

    for (const f of l.fields) {
      const fieldQuery = `id ${f.name}`

      test(`findOne (read) ${f.name}`, async () => {
        if (!f.expect.read) return
        const { context } = await suite
        const seeded = await seed(l, context)

        // test list.access.*.query
        const item = await context.query[l.name].findOne({
          where: { id: seeded.id },
          query: fieldQuery,
        })

        if (!l.expect.query) {
          assert.equal(item, null)
          return
        }

        // test field.access.read
        expectEqualItem(l, item, seeded, [f.name])
      })

      test(`findMany (read) ${f.name}`, async () => {
        const { context } = await suite
        const seeded = await seedMany(l, context)

        // test list.access.*.query
        const items = await context.query[l.name].findMany({
          where: {
            id: {
              in: seeded.map(x => x.id),
            },
          },
          query: fieldQuery,
        })

        if (!l.expect.query) {
          assert.deepEqual(items, [])
          return
        }

        // test field.access.read
        expectEqualItems(l, items, seeded, [f.name])
      })
    }
  }
})
