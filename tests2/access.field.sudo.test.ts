import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { list } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'
import { dbProvider, setupTestSuite } from './utils.ts'

describe(`field access sudo tests (${dbProvider})`, () => {
  const suite = setupTestSuite({
    config: {
      lists: {
        Item: list({
          access: allowAll,
          fields: {
            value: text({
              access: {
                read: {
                  item: allowAll,
                  filter: denyAll,
                  order: denyAll,
                },
              },
            }),
          },
        }),
      },
    },
  })()

  test('sudo bypasses field filter and order access', async () => {
    const { context } = await suite
    const item = await context.sudo().query.Item.createOne({
      data: { value: 'value' },
      query: 'id value',
    })

    assert.deepEqual(
      await context.sudo().query.Item.findMany({
        where: { value: { equals: item.value } },
        orderBy: { value: 'asc' },
        query: 'id value',
      }),
      [item]
    )
  })
})
