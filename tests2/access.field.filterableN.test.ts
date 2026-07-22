import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { dbProvider, setupTestSuite } from './utils'
import {
  config,
  expectEqualItem,
  expectEqualItems,
  lists,
  makeWhereAndFilter,
  makeWhereFilter,
  makeWhereUniqueFilter,
  randomString,
  seed,
  seedMany,
} from './utils2'

const now = new Date()
let randomState = now.getUTCFullYear() * 100 + now.getUTCMonth() + 1

// ~ranqd1
function randomInt(max: number) {
  randomState = (randomState * 1664525 + 1013904223) >>> 0
  return Math.floor((randomState / 2 ** 32) * max)
}

describe(`field.access.filterable tests (filters > 1) (${dbProvider})`, () => {
  const suite = setupTestSuite({ config })()

  for (const l of lists) {
    const itemQuery = `id ${l.fields.map(x => x.name).join(' ')}`

    for (const f1 of l.fields) {
      for (const f2 of l.fields) {
        if (f1 === f2) continue
        if (randomInt(100) < 95) continue

        const fields = [f1, f2]
        const filterable = fields.every(f => f.expect.filter)
        const unique = fields.every(f => f.expect.unique)
        const label = `${fields.map(x => x.name).join(', ')} filter: ${filterable}`

        if (unique) {
          test(`findOne (F>1) ${label}`, async () => {
            const { context } = await suite
            const seeded = await seed(l, context)
            const where = makeWhereUniqueFilter(fields, seeded)

            // test list.access.*.query
            const findPromise = context.query[l.name].findOne({
              where,
              query: itemQuery,
            })

            // access.read.filter checks happen after list access filters
            if (!l.expect.query.one && l.expect.type !== 'filter') {
              assert.equal(await findPromise, null)
              return
            }

            if (!filterable) {
              const error = findPromise.catch((e: any) => e.message)
              assert.match(await error, /^Access denied: You cannot filter/)
              return
            }

            const item = await findPromise
            if (!l.expect.query.one) {
              assert.equal(item, null)
              return
            }

            // test field.access.read
            expectEqualItem(l, item, seeded)
          })
        }

        test(`findMany(1) (F>1) ${label}`, async () => {
          const { context } = await suite
          const seeded = await seed(l, context)
          const where = makeWhereFilter(fields, seeded)

          //   for debugging
          // const count = await context.prisma[l.name].count({ where })
          // assert.equal(count).toBe(1)

          // test list.access.*.query
          const findPromise = context.query[l.name].findMany({
            where,
            query: itemQuery,
          })

          // access.read.filter checks happen after list access filters
          if (!l.expect.query.many && l.expect.type !== 'filter') {
            assert.deepEqual(await findPromise, [])
            return
          }

          if (!filterable) {
            const error = findPromise.catch((e: any) => e.message)
            assert.match(await error, /^Access denied: You cannot filter/)
            return
          }

          const items = await findPromise
          if (!l.expect.query.many) {
            assert.deepEqual(items, [])
            return
          }

          // test field.access.read
          expectEqualItems(l, items, [seeded])
        })

        test(`findMany(1,AND) (F>1) ${label}`, async () => {
          const { context } = await suite
          const seeded = await seed(l, context)
          const where = makeWhereAndFilter(fields, seeded)

          // test list.access.*.query
          const findPromise = context.query[l.name].findMany({
            where,
            query: itemQuery,
          })

          // access.read.filter checks happen after list access filters
          if (!l.expect.query.many && l.expect.type !== 'filter') {
            assert.deepEqual(await findPromise, [])
            return
          }

          if (!filterable) {
            const error = findPromise.catch((e: any) => e.message)
            assert.match(await error, /^Access denied: You cannot filter/)
            return
          }

          const items = await findPromise
          if (!l.expect.query.many) {
            assert.deepEqual(items, [])
            return
          }

          // test field.access.read
          expectEqualItems(l, items, [seeded])
        })

        test(`findMany(N) (F>1) ${label}`, async () => {
          const { context } = await suite
          const seeded = await seedMany(l, context)
          const where = makeWhereFilter(fields, seeded)

          // test list.access.*.query
          const findPromise = context.query[l.name].findMany({
            where,
            query: itemQuery,
          })

          // access.read.filter checks happen after list access filters
          if (!l.expect.query.many && l.expect.type !== 'filter') {
            assert.deepEqual(await findPromise, [])
            return
          }

          if (!filterable) {
            const error = findPromise.catch((e: any) => e.message)
            assert.match(await error, /^Access denied: You cannot filter/)
            return
          }

          const items = await findPromise
          if (!l.expect.query.many) {
            assert.deepEqual(items, [])
            return
          }

          // test field.access.read
          expectEqualItems(l, items, seeded)
        })

        const [updatable] = l.fields.filter(f => f.expect.update)
        if (l.expect.update && updatable && unique) {
          const updateQuery = `id ${updatable.name}`

          test(`updateOne (F>1) ${label}`, async () => {
            const { context } = await suite
            const seeded = await seed(l, context)
            const target = { [updatable.name]: randomString() }

            // test list.access.*.update
            const updatePromise = context.query[l.name].updateOne({
              where: makeWhereUniqueFilter(fields, seeded),
              data: target,
              query: updateQuery,
            })

            // access.read.filter checks happen after list access filters
            if (!l.expect.update && l.expect.type !== 'filter') {
              assert.equal(await updatePromise, null)
              return
            }

            if (!filterable) {
              const error = updatePromise.catch((e: any) => e.message)
              assert.match(await error, /^Access denied: You cannot filter/)
              return
            }

            const item = await updatePromise
            if (!l.expect.update) {
              assert.equal(item, null)
              return
            }

            expectEqualItem(l, item, target, [updatable.name])
          })

          // TODO: add updateMany
        }

        if (l.expect.delete && unique) {
          test(`deleteOne (F>1) ${label}`, async () => {
            const { context } = await suite
            const seeded = await seed(l, context)

            // test list.access.*.delete
            const deletePromise = context.query[l.name].deleteOne({
              where: makeWhereUniqueFilter(fields, seeded),
              query: itemQuery,
            })

            // access.read.filter checks happen after list access filters
            if (!l.expect.delete && l.expect.type !== 'filter') {
              assert.equal(await deletePromise, null)
              return
            }

            if (!filterable) {
              const error = deletePromise.catch((e: any) => e.message)
              assert.match(await error, /^Access denied: You cannot filter/)
              return
            }

            const item = await deletePromise
            if (!l.expect.delete) {
              assert.equal(item, null)
              return
            }

            expectEqualItem(l, item, seeded)
          })

          // TODO: add deleteMany
        }
      }
    }
  }
})
