import assert from 'node:assert/strict'
import { test } from 'node:test'
import { list } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { text, virtual } from '@keystone-6/core/fields'
import { g } from '@keystone-6/core'
import { fieldType, type FieldTypeFunc } from '@keystone-6/core/types'
import { dbProvider, setupTestSuite } from './utils.ts'

const suite = setupTestSuite({
  config: {
    lists: {
      Item: list({
        access: allowAll,
        fields: {
          plain: text(),
          transformed: (() =>
            fieldType({ kind: 'scalar', scalar: 'String', mode: 'optional' })({
              views: '@keystone-6/core/fields/types/text/views',
              output: g.field({
                type: g.String,
                resolve: ({ value }) => `transformed:${value}`,
              }),
            })) satisfies FieldTypeFunc<any>,
          sync: text({ access: { read: () => true } }),
          denied: text({ access: { read: denyAll } }),
          async: text({ access: { read: async () => true } }),
          asyncDenied: text({ access: { read: async () => false } }),
          throwing: text({
            access: {
              read: () => {
                throw new Error('sync failure')
              },
            },
          }),
          rejecting: text({
            access: {
              read: async () => {
                throw new Error('async failure')
              },
            },
          }),
          invalid: text({ access: { read: (() => undefined) as any } }),
          asyncInvalid: text({ access: { read: (async () => undefined) as any } }),
          computed: virtual({ field: g.field({ type: g.String, resolve: () => 'computed' }) }),
          asyncComputed: virtual({
            field: g.field({ type: g.String, resolve: async () => 'async computed' }),
          }),
        },
      }),
    },
  },
})()

test(`synchronous field resolution (${dbProvider})`, async t => {
  const { context } = await suite
  const item = await context.sudo().db.Item.createOne({
    data: {
      plain: 'plain',
      sync: 'sync',
      denied: 'denied',
      async: 'async',
      asyncDenied: 'async denied',
      throwing: 'throwing',
      rejecting: 'rejecting',
      invalid: 'invalid',
      asyncInvalid: 'invalid',
    },
  })
  const fields = (context.graphql.schema.getType('Item') as any).getFields()
  const resolve = (field: string, ctx = context) => fields[field].resolve(item, {}, ctx, undefined)
  await t.test('plain outputs and synchronous access do not return promises', () => {
    assert.equal(resolve('plain'), 'plain')
    assert.equal(resolve('sync'), 'sync')
    assert.equal(resolve('denied'), null)
    assert.equal(resolve('denied', context.sudo()), 'denied')
    assert.equal(resolve('computed'), 'computed')
    assert.equal(resolve('throwing', context.sudo()), 'throwing')
  })
  await t.test('scalar output resolvers still transform their stored values', () => {
    assert.equal(
      fields.transformed.resolve({ ...item, transformed: 'input' }, {}, context, undefined),
      'transformed:input'
    )
  })
  await t.test('async access and output resolvers still work', async () => {
    assert.equal(await resolve('async'), 'async')
    assert.equal(await resolve('asyncDenied'), null)
    assert.equal(await resolve('asyncComputed'), 'async computed')
  })
  await t.test('wraps synchronous and asynchronous access errors consistently', async () => {
    for (const field of ['throwing', 'rejecting', 'invalid', 'asyncInvalid']) {
      const result = await context.graphql.raw({
        query: `query { item(where: { id: "${item.id}" }) { ${field} } }`,
      })
      assert.equal(result.errors?.length, 1)
      assert.deepEqual(result.errors![0].path, ['item', field])
      assert.equal(
        result.errors![0].extensions.code,
        field.endsWith('nvalid') ? 'KS_ACCESS_RETURN_ERROR' : 'KS_EXTENSION_ERROR'
      )
    }
  })
})
