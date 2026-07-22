import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { dbProvider, setupTestSuite } from './utils'
import { config, expectEqualItems, lists, seedMany } from './utils2'

describe(`field.access.orderable tests (${dbProvider})`, () => {
  const suite = setupTestSuite({ config })()

  for (const l of lists) {
    const itemQuery = `id ${l.fields.map(x => x.name).join(' ')}`

    // field access tests
    for (const f of l.fields) {
      test(`findMany orderBy ${f.name} (order: ${f.expect.order})`, async () => {
        const { context } = await suite
        const seeded = await seedMany(l, context)

        // test list.access.*.query
        const findPromise = context.query[l.name].findMany({
          orderBy: { [f.name]: 'asc' },
          where: {
            id: {
              in: seeded.map((s: any) => s.id),
            },
          },
          query: itemQuery,
        })

        // access.read.order happens after list-level access
        if (!l.expect.query.many && l.expect.type !== 'filter') {
          assert.deepEqual(await findPromise, [])
          return
        }

        if (!f.expect.order) {
          const error = findPromise.catch((e: any) => e.message)
          assert.match(await error, /^Access denied: You cannot order/)
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
    }
  }
})
