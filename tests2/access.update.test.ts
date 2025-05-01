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
  makeItem,
  randomString,
} from './utils2'

describe(`*.access.update tests (${dbProvider})`, () => {
  const suite = setupTestSuite({ config })()

  for (const l of lists) {
    const itemQuery = `id ${l.fields.map(x => x.name).join(' ')}`

    test(`update ${l.name}`, async () => {
      const { context } = await suite
      const seeded = await seed(l, context)
      const target = makeItem(l, 'update')

      // test list.access.*.update
      const updatePromise = context.query[l.name].updateOne({
        where: { id: seeded.id },
        data: target,
        query: itemQuery,
      })

      if (!l.expect.update) {
        const error = updatePromise.catch(e => e.message)
        assert.match(await error, /^Access denied: You cannot update that/)
        return
      }

      const item = await updatePromise
      expectEqualItem(l, item, {
        id: seeded.id,
        ...seeded,
        ...target,
      })
    })

    test(`updateMany ${l.name}`, async () => {
      const { context } = await suite
      const seeded = await seedMany(l, context)
      const target = seeded.map(({ id }) => ({
        where: { id },
        data: makeItem(l, 'update'),
      }))

      // test list.access.*.update
      const updatePromise = context.query[l.name].updateMany({
        data: target,
        query: itemQuery,
      })

      if (!l.expect.update) {
        const error = updatePromise.catch(e => e.message)
        assert.match(await error, /^Access denied: You cannot update that/)
        return
      }

      const items = await updatePromise
      expectEqualItems(
        l,
        items,
        target.map((t, i) => ({
          id: t.where.id,
          ...seeded[i],
          ...t.data,
        }))
      )
    })

    // field access tests
    for (const f of l.fields) {
      const fieldQuery = `id ${f.name}`

      // we tested list update operations previously^, skip
      if (l.expect.update) {
        test(`update ${f.name}`, async () => {
          const { context } = await suite
          const seeded = await seed(l, context)
          const target = { [f.name]: randomString() }

          // test list.access.*.update
          const updatePromise = context.query[l.name].updateOne({
            where: { id: seeded.id },
            data: target,
            query: fieldQuery,
          })

          // test field.access.update
          if (!f.expect.update) {
            const error = updatePromise.catch(e => e.message)
            assert.equal(
              await error,
              `Access denied: You cannot update that ${l.name} - you cannot update the fields ${f.name}`
            )
            return
          }

          const item = await updatePromise

          // test field.access.read
          expectEqualItem(l, item, target, [f.name])

          // sudo required, as we might not have read
          const item_ = await context.sudo().db[l.name].findOne({ where: { id: seeded.id } })
          assert.equal(item_![f.name], target[f.name])
        })

        test(`updateMany ${f.name}`, async () => {
          const { context } = await suite
          const seeded = await seedMany(l, context)
          const target = seeded.map(({ id }) => ({ id, [f.name]: randomString() }))

          // test list.access.*.update
          const updatePromise = context.query[l.name].updateMany({
            data: target.map(({ id, ...data }) => ({
              where: { id },
              data,
            })),
            query: fieldQuery,
          })

          // test field.access.update
          if (!f.expect.update) {
            const error = updatePromise.catch(e => e.message)
            assert.equal(
              await error,
              `Access denied: You cannot update that ${l.name} - you cannot update the fields ${f.name}`
            )
            return
          }

          const items = await updatePromise

          // test field.access.read
          expectEqualItems(l, items, target, [f.name])
        })
      }
    }
  }
})
