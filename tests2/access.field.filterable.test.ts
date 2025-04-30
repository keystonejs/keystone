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
        test(`findOne by ${f.name} (filterable: ${f.expect.filterable})`, async () => {
          const { context } = await suite
          const seeded = await seed(l, context)

          // test list.access.*.query
          const findPromise = context.query[l.name].findOne({
            where: makeWhereUniqueFilter([f], seeded),
            query: itemQuery,
          })

          // access.filter's happen after .filterable
          if (!l.expect.query && l.expect.type !== 'filter') {
            assert.equal(await findPromise, null)
            return
          }

          if (!f.expect.filterable) {
            const error = findPromise.catch((e: any) => e.message)
            assert.match(await error, /^Access denied: You cannot filter/)
            return
          }

          // test field.access.read
          const item = await findPromise
          if (!l.expect.query) {
            assert.equal(item, null)
            return
          }

          expectEqualItem(l, item, seeded)
        })
      }

      test(`findMany by ${f.name} (filterable: ${f.expect.filterable})`, async () => {
        const { context } = await suite
        const seeded = await seedMany(l, context)

        // test list.access.*.query
        const findPromise = context.query[l.name].findMany({
          where: makeWhereFilter([f], seeded),
          query: itemQuery,
        })

        // access.filter's happen after .filterable
        if (!l.expect.query && l.expect.type !== 'filter') {
          assert.deepEqual(await findPromise, [])
          return
        }

        if (!f.expect.filterable) {
          const error = findPromise.catch((e: any) => e.message)
          assert.match(await error, /^Access denied: You cannot filter/)
          return
        }

        // test field.access.read
        const items = await findPromise
        if (!l.expect.query) {
          assert.deepEqual(items, [])
          return
        }

        expectEqualItems(l, items, seeded)
      })
    }
  }
})
