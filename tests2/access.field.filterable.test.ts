import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { dbProvider, setupTestSuite } from './utils'
import {
  config,
  expectEqualItem,
  expectEqualItems,
  lists,
  makeWhereFilter,
  makeWhereUniqueFilter,
  seed,
  seedMany,
} from './utils2'

describe(`field.access.filterable tests (${dbProvider})`, () => {
  const suite = setupTestSuite({ config })()

  for (const l of lists) {
    const itemQuery = `id ${l.fields.map(x => x.name).join(' ')}`

    // field access tests
    for (const f of l.fields) {
      if (f.expect.unique) {
        test(`findOne by ${f.name} (filter: ${f.expect.filter})`, async () => {
          const { context } = await suite
          const seeded = await seed(l, context)

          // test list.access.*.query
          const findPromise = context.query[l.name].findOne({
            where: makeWhereUniqueFilter([f], seeded),
            query: itemQuery,
          })

          // access.read.filter checks happen after list access filters
          if (!l.expect.query.one && l.expect.type !== 'filter') {
            assert.equal(await findPromise, null)
            return
          }

          if (!f.expect.filter) {
            const error = findPromise.catch((e: any) => e.message)
            assert.match(await error, /^Access denied: You cannot filter/)
            return
          }

          // test field.access.read
          const item = await findPromise
          if (!l.expect.query.one) {
            assert.equal(item, null)
            return
          }

          expectEqualItem(l, item, seeded)
        })
      }

      test(`findMany by ${f.name} (filter: ${f.expect.filter})`, async () => {
        const { context } = await suite
        const seeded = await seedMany(l, context)

        // test list.access.*.query
        const findPromise = context.query[l.name].findMany({
          where: makeWhereFilter([f], seeded),
          query: itemQuery,
        })

        // access.read.filter checks happen after list access filters
        if (!l.expect.query.many && l.expect.type !== 'filter') {
          assert.deepEqual(await findPromise, [])
          return
        }

        if (!f.expect.filter) {
          const error = findPromise.catch((e: any) => e.message)
          assert.match(await error, /^Access denied: You cannot filter/)
          return
        }

        // test field.access.read
        const items = await findPromise
        if (!l.expect.query.many) {
          assert.deepEqual(items, [])
          return
        }

        expectEqualItems(l, items, seeded)
      })

      test(`count by ${f.name} (filter: ${f.expect.filter})`, async () => {
        const { context } = await suite
        const seeded = await seedMany(l, context)

        // test list.access.*.query
        const countPromise = context.query[l.name].count({
          where: makeWhereFilter([f], seeded),
        })

        // access.read.filter checks happen after list access filters
        if (!l.expect.query.count && l.expect.type !== 'filter') {
          assert.equal(await countPromise, 0)
          return
        }

        if (!f.expect.filter) {
          const error = countPromise.catch((e: any) => e.message)
          assert.match(await error, /^Access denied: You cannot filter/)
          return
        }

        assert.equal(await countPromise, l.expect.query.count ? seeded.length : 0)
      })
    }
  }
})
