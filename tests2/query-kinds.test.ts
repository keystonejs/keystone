import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { list } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { relationship, text } from '@keystone-6/core/fields'
import { query } from '../tests/api-tests/run-field.ts'
import { dbProvider, setupTestSuite } from './utils.ts'

const config = {
  lists: {
    AccessTarget: list({
      access: {
        operation: {
          query: {
            one: args => {
              assert.equal(args.kind, 'one')
              return false
            },
            many: args => {
              assert.equal(args.kind, 'many')
              return true
            },
            count: args => {
              assert.equal(args.kind, 'count')
              return false
            },
          },
          create: allowAll,
          update: allowAll,
          delete: allowAll,
        },
      },
      fields: {
        value: text({
          access: {
            read: args => {
              if (args.kind === 'item') {
                assert.ok('item' in args)
              } else {
                assert.ok(!('item' in args))
              }
              return true
            },
          },
        }),
        filterDenied: text({
          access: {
            read: { item: allowAll, filter: denyAll, order: allowAll },
          },
        }),
        orderDenied: text({
          access: {
            read: { item: allowAll, filter: allowAll, order: denyAll },
          },
        }),
      },
    }),
    FilterTarget: list({
      access: {
        operation: allowAll,
        filter: {
          query: {
            one: async ({ kind, operation, listKey, session }) => {
              assert.equal(kind, 'one')
              assert.equal(operation, 'query')
              assert.equal(listKey, 'FilterTarget')
              return session?.deny ? false : { value: { equals: kind } }
            },
            many: ({ kind, session }) => {
              assert.equal(kind, 'many')
              return session?.deny ? false : { value: { equals: kind } }
            },
            count: ({ kind, session }) => {
              assert.equal(kind, 'count')
              return session?.deny ? false : { value: { equals: kind } }
            },
          },
        },
      },
      fields: { value: text() },
    }),
    SharedFilterTarget: list({
      access: {
        operation: allowAll,
        filter: {
          query: ({ kind }) => ({ value: { equals: kind } }),
        },
      },
      fields: { value: text() },
    }),
    OmitTarget: list({
      access: allowAll,
      graphql: {
        omit: { query: { one: true, many: false, count: true } },
      },
      fields: { value: text() },
    }),
    Parent: list({
      access: allowAll,
      fields: {
        filterOne: relationship({ ref: 'FilterTarget' }),
        filterMany: relationship({ ref: 'FilterTarget', many: true }),
        accessOne: relationship({ ref: 'AccessTarget' }),
        accessMany: relationship({ ref: 'AccessTarget', many: true }),
        omitOne: relationship({ ref: 'OmitTarget' }),
        omitMany: relationship({ ref: 'OmitTarget', many: true }),
      },
    }),
    OneOnly: list({
      access: allowAll,
      graphql: { omit: { query: { one: false, many: true, count: true } } },
      fields: { value: text() },
    }),
    CountOnly: list({
      access: allowAll,
      graphql: { omit: { query: { one: true, many: true, count: false } } },
      fields: { value: text() },
    }),
    ManyOnly: list({
      access: allowAll,
      graphql: { omit: { query: { one: true, many: false, count: true } } },
      fields: { value: text() },
    }),
  },
} as const

describe(`query kinds (${dbProvider})`, () => {
  const suite = setupTestSuite({ config })()

  test('routes list and field access by kind', async () => {
    const { context } = await suite
    const created = await context.sudo().db.AccessTarget.createOne({
      data: { value: 'a' },
      select: { id: true, value: true },
    })

    assert.equal(
      await query(context).accessTarget({
        where: { id: created.id.toString() },
        query: 'id value',
      }),
      null
    )
    assert.equal(
      (
        await query(context).accessTargets<unknown[]>({
          where: { value: { equals: 'a' } },
          orderBy: [{ value: 'asc' }],
          query: 'id value',
        })
      ).length,
      1
    )
    assert.equal(await query(context).accessTargetsCount(), 0)
  })

  test('routes shared and separate query filters by kind', async () => {
    const { context } = await suite
    const graphql = query(context)
    type ItemValue = { value: string | null }
    for (const listKey of ['FilterTarget', 'SharedFilterTarget']) {
      const { itemQueryName, listQueryName, listQueryCountName } =
        context.__internal.lists[listKey].graphql.names
      const db = context.db[listKey]
      const items = await context.sudo().db[listKey].createMany({
        data: ['one', 'many', 'count', 'count'].map(value => ({ value })),
        select: { id: true, value: true },
      })
      for (const { findOne, findMany, count } of [
        {
          findOne: (id: string, query = 'id') =>
            graphql[itemQueryName]<ItemValue | null>({ where: { id }, query }),
          findMany: () => graphql[listQueryName]<ItemValue[]>({ query: 'id value' }),
          count: () => graphql[listQueryCountName](),
        },
        {
          findOne: (id: string) => db.findOne({ where: { id } }),
          findMany: () => db.findMany(),
          count: () => db.count(),
        },
      ]) {
        assert.equal((await findOne(items[0].id.toString(), 'id value'))?.value, 'one')
        assert.equal(await findOne(items[1].id.toString()), null)
        assert.deepEqual(
          (await findMany()).map(item => item.value),
          ['many']
        )
        assert.equal(await count(), 2)
      }
      assert.equal(await query(context.sudo())[listQueryCountName](), 4)
    }
    const denied = query(context.withSession({ deny: true }))
    const [item] = await context.sudo().db.FilterTarget.findMany({ select: { id: true } })
    assert.equal(
      await denied.filterTarget({ where: { id: item.id.toString() }, query: 'id' }),
      null
    )
    assert.deepEqual(await denied.filterTargets({ query: 'id' }), [])
    assert.equal(await denied.filterTargetsCount(), 0)
  })

  test('routes relationship query filters by kind', async () => {
    const { context } = await suite
    const items = await context.sudo().db.FilterTarget.createMany({
      data: ['one', 'many', 'count', 'count'].map(value => ({ value })),
      select: { id: true, value: true },
    })
    const parent = await context.sudo().db.Parent.createOne({
      data: {
        filterOne: { connect: { id: items[0].id } },
        filterMany: { connect: items.map(({ id }) => ({ id })) },
      },
      select: { id: true },
    })
    type RelatedItem = { value: string | null }
    const result = await query(context).parent<{
      filterOne: RelatedItem | null
      filterMany: RelatedItem[]
      filterManyCount: number
    } | null>({
      where: { id: parent.id.toString() },
      query: 'filterOne { value } filterMany { value } filterManyCount',
    })
    assert.equal(result?.filterOne?.value, 'one')
    assert.deepEqual(
      result?.filterMany.map(item => item.value),
      ['many']
    )
    assert.equal(result?.filterManyCount, 2)
    await context.sudo().db.Parent.updateOne({
      where: { id: parent.id.toString() },
      data: { filterOne: { connect: { id: items[1].id } } },
    })
    assert.deepEqual(
      {
        ...(await query(context).parent<{ filterOne: RelatedItem | null } | null>({
          where: { id: parent.id.toString() },
          query: 'filterOne { value }',
        })),
      },
      { filterOne: null }
    )
  })

  test('omits root and relationship queries by cardinality', async () => {
    const { artifacts } = await suite
    assert.doesNotMatch(artifacts.graphql, /\n  omitOne: OmitTarget\n/)
    assert.match(artifacts.graphql, /omitMany\([^)]*\): \[OmitTarget!\]/s)
    assert.doesNotMatch(artifacts.graphql, /omitManyCount/)
    assert.doesNotMatch(artifacts.graphql, /omitTarget\(where:/)
    assert.match(artifacts.graphql, /omitTargets\(/)
    assert.doesNotMatch(artifacts.graphql, /omitTargetsCount\(/)
  })

  test('includes filter and order types only when used', async () => {
    const { artifacts } = await suite
    assert.doesNotMatch(artifacts.graphql, /input OneOnlyWhereInput/)
    assert.doesNotMatch(artifacts.graphql, /input OneOnlyOrderByInput/)
    assert.match(artifacts.graphql, /input CountOnlyWhereInput/)
    assert.doesNotMatch(artifacts.graphql, /input CountOnlyOrderByInput/)
    assert.match(artifacts.graphql, /input ManyOnlyWhereInput/)
    assert.match(artifacts.graphql, /input ManyOnlyOrderByInput/)
  })

  test('reports field filter and order access in Admin metadata', async () => {
    const { context } = await suite
    const query = `{
      keystone {
        adminMeta {
          lists {
            key
            fields { key isFilterable isOrderable }
          }
        }
      }
    }`
    const getFields = async (queryContext: typeof context) => {
      const data = (await queryContext.graphql.run({ query })) as {
        keystone: {
          adminMeta: {
            lists: {
              key: string
              fields: { key: string; isFilterable: boolean; isOrderable: boolean }[]
            }[]
          }
        }
      }
      return data.keystone.adminMeta.lists.find(x => x.key === 'AccessTarget')!.fields
    }

    const fields = await getFields(context)
    const getField = (fields: Awaited<ReturnType<typeof getFields>>, key: string) => {
      const field = fields.find(x => x.key === key)
      assert.ok(field)
      return { ...field }
    }
    assert.deepEqual(getField(fields, 'filterDenied'), {
      key: 'filterDenied',
      isFilterable: false,
      isOrderable: true,
    })
    assert.deepEqual(getField(fields, 'orderDenied'), {
      key: 'orderDenied',
      isFilterable: true,
      isOrderable: false,
    })

    const sudoFields = await getFields(context.sudo())
    assert.deepEqual(getField(sudoFields, 'filterDenied'), {
      key: 'filterDenied',
      isFilterable: true,
      isOrderable: true,
    })
    assert.deepEqual(getField(sudoFields, 'orderDenied'), {
      key: 'orderDenied',
      isFilterable: true,
      isOrderable: true,
    })
  })
})
