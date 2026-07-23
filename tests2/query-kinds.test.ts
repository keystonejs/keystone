import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { list } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { relationship, text } from '@keystone-6/core/fields'
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
    const created = await context.sudo().query.AccessTarget.createOne({
      data: { value: 'a' },
      query: 'id value',
    })

    assert.equal(
      await context.query.AccessTarget.findOne({ where: { id: created.id }, query: 'id value' }),
      null
    )
    assert.equal(
      (
        await context.query.AccessTarget.findMany({
          where: { value: { equals: 'a' } },
          orderBy: [{ value: 'asc' }],
          query: 'id value',
        })
      ).length,
      1
    )
    assert.equal(await context.query.AccessTarget.count(), 0)
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
