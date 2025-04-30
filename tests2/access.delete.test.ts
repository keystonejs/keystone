import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { dbProvider, setupTestSuite } from './utils'
import {
  config,
  lists,
  expectEqualItem,
  expectEqualItems,
  seed,
  seedMany,
} from './utils2'

describe(`*.access.delete tests (${dbProvider})`, () => {
  const suite = setupTestSuite({ config })()

  for (const l of lists) {
    const itemQuery = `id ${l.fields.map(x => x.name).join(' ')}`

    test(`deleteOne ${l.name}`, async () => {
      const { context } = await suite
      const seeded = await seed(l, context)

      // test list.access.*.delete
      const deletePromise = context.query[l.name].deleteOne({
        where: { id: seeded.id },
        query: itemQuery,
      })

      if (!l.expect.delete) {
        const error = deletePromise.catch(e => e.message)
        assert.equal(
          await error,
          `Access denied: You cannot delete that ${l.name} - it may not exist`
        )

        // sudo required, as we might not have query/read access
        const count = await context.prisma[l.name].count({ where: { id: seeded.id } })
        assert.equal(count, 1)
        return
      }

      const item = await deletePromise
      expectEqualItem(l, item, seeded)

      // sudo required, as we might not have query/read access
      const count = await context.prisma[l.name].count({ where: { id: seeded.id } })
      assert.equal(count, 0)
    })

    test(`deleteMany ${l.name}`, async () => {
      const { context } = await suite
      const seeded = await seedMany(l, context)

      // test list.access.*.delete
      const deletePromise = context.query[l.name].deleteMany({
        where: seeded.map(({ id }) => ({
          id,
        })),
        query: itemQuery,
      })

      if (!l.expect.delete) {
        const error = deletePromise.catch(e => e.message)
        assert.equal(
          await error,
          `Access denied: You cannot delete that ${l.name} - it may not exist`
        )

        const count = await context.prisma[l.name].count({
          where: { id: { in: seeded.map(s => s.id) } },
        })
        assert.equal(count, seeded.length) // unchanged
        return
      }

      const items = await deletePromise
      expectEqualItems(l, items, seeded)

      // sudo required, as we might not have query/read access
      const count = await context.prisma[l.name].count({
        where: { id: { in: seeded.map(s => s.id) } },
      })
      assert.equal(count, 0) // changed
    })

    // field access tests
    for (const f of l.fields) {
      const fieldQuery = `id ${f.name}`

      // we tested list delete operations previously^, skip
      if (l.expect.delete) {
        test(`deleteOne ${f.name}`, async () => {
          const { context } = await suite
          const seeded = await seed(l, context)

          // test list.access.*.delete
          const item = await context.query[l.name].deleteOne({
            where: { id: seeded.id },
            query: fieldQuery,
          })

          // test field.access.read
          expectEqualItem(l, item, seeded, [f.name])
        })

        test(`deleteMany ${f.name}`, async () => {
          const { context } = await suite
          const seeded = await seedMany(l, context)

          // test list.access.*.query
          const items = await context.query[l.name].deleteMany({
            where: seeded.map(({ id }) => ({
              id,
            })),
            query: fieldQuery,
          })

          // test field.access.read
          expectEqualItems(l, items, seeded, [f.name])
        })
      }
    }
  }
})
