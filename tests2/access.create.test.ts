import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { dbProvider, setupTestSuite } from './utils'
import {
  config,
  countUniqueItems,
  expectEqualItem,
  expectEqualItems,
  lists,
  makeItem,
  randomCount,
  randomString,
} from './utils2'

describe(`*.access.create tests (${dbProvider})`, () => {
  const suite = setupTestSuite({ config })()

  for (const l of lists) {
    const itemQuery = `id ${l.fields.map(x => x.name).join(' ')}`

    test(`createOne ${l.name}`, async () => {
      const { context } = await suite
      const target = makeItem(l, 'create')

      // test list.access.*.create
      const createPromise = context.query[l.name].createOne({
        data: target,
        query: itemQuery,
      })

      if (!l.expect.create) {
        const error = createPromise.catch((e: any) => e.message)
        assert.match(await error, /^Access denied: You cannot create that/)
        return
      }

      const item = await createPromise
      assert.notEqual(item, null)
      assert.notEqual(item.id, null)

      for (const f of l.fields) {
        if (f.expect.read) {
          assert.equal(item![f.name], target[f.name] ?? f.defaultValue)
        } else {
          assert.equal(item![f.name], null)
        }
      }
    })

    test(`createMany ${l.name}`, async () => {
      const { context } = await suite
      const target = [...Array(randomCount())].map(_ => makeItem(l, 'create'))

      // test list.access.*.create
      const createPromise = context.query[l.name].createMany({
        data: target,
        query: itemQuery,
      })

      if (!l.expect.create) {
        const error = createPromise.catch((e: any) => e.message)
        assert.match(await error, /^Access denied: You cannot create that/)
        return
      }

      const items = await createPromise
      assert.notEqual(items, null)
      assert.equal(items.length, target.length)
      assert.equal(countUniqueItems(items), target.length)

      let i = 0
      for (const item of items) {
        for (const f of l.fields) {
          if (f.expect.read) {
            assert.equal(item![f.name], target[i][f.name] ?? f.defaultValue)
          } else {
            assert.equal(item![f.name], null)
          }
        }
        ++i
      }
    })

    // field access tests
    for (const f of l.fields) {
      const fieldQuery = `id ${f.name}`
      const hasUnique = l.fields.some(f => f.expect.unique)

      // we tested list create operations previously^, skip
      //   and create operations with unique fields need us to write hooks
      if (l.expect.create && !hasUnique) {
        test(`createOne ${f.name}`, async () => {
          const { context } = await suite
          const target = { [f.name]: randomString() }

          // test list.access.*.create
          const createPromise = context.query[l.name].createOne({
            data: target,
            query: fieldQuery,
          })

          // test field.access.create
          if (!f.expect.create) {
            const error = createPromise.catch((e: any) => e.message)
            assert.equal(
              await error,
              `Access denied: You cannot create that ${l.name} - you cannot create the fields ["${f.name}"]`
            )
            return
          }

          // test field.access.read
          const item = await createPromise
          expectEqualItem(l, item, target, [f.name])

          // sudo required, as we might not have query/read access
          const item_ = await context.sudo().db[l.name].findOne({ where: { id: item.id } })
          assert.equal(item_![f.name], target[f.name])
        })

        test(`createMany ${f.name}`, async () => {
          const { context } = await suite
          const target = [...Array(randomCount())].map(_ => ({ [f.name]: randomString() }))

          // test list.access.*.create
          const createPromise = context.query[l.name].createMany({
            data: target,
            query: fieldQuery,
          })

          // test field.access.create
          if (!f.expect.create) {
            const error = createPromise.catch(e => e.message)
            assert.equal(
              await error,
              `Access denied: You cannot create that ${l.name} - you cannot create the fields ["${f.name}"]`
            )
            return
          }

          const items = await createPromise
          assert.notEqual(items, null)
          assert.equal(items.length, target.length)
          assert.equal(countUniqueItems(items), target.length)

          // test field.access.read
          expectEqualItems(l, items, target, [f.name], false)
        })
      }
    }
  }
})
