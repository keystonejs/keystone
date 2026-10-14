import { describe, expect, test } from 'vitest'
import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { bigInt } from '@keystone-6/core/fields'
import { setupTestRunner } from '../../test-runner.ts'
import { dbProvider, expectValidationError } from '../../utils.ts'
import { orderableFilterTests, filterTests, uniqueEqualityFilterTest } from './utils.ts'

for (const isNullable of [true, false]) {
  describe(`bigInt with isNullable: ${isNullable}`, () => {
    const values = [
      '-9223372036854775808',
      '-324523452345234',
      '0',
      '65536',
      '3452345324523145',
    ] as const
    filterTests(bigInt({ db: { isNullable } }), match => {
      orderableFilterTests(match, values, isNullable)
    })
    uniqueEqualityFilterTest(
      bigInt({ db: { isNullable }, isIndexed: 'unique' }),
      values,
      isNullable
    )
  })
}

if (dbProvider === 'postgresql') {
  test(
    'bigInt with defaultValue: { kind: autoincrement } assigns values when omitted',
    setupTestRunner({
      config: {
        lists: {
          Test: list({
            access: allowAll,
            fields: {
              value: bigInt({ defaultValue: { kind: 'autoincrement' }, db: { isNullable: false } }),
            },
          }),
        },
      },
    })(async ({ context }) => {
      expect(await context.query.Test.createOne({ data: {}, query: 'value' })).toEqual({
        value: '1',
      })
      expect(await context.query.Test.createOne({ data: {}, query: 'value' })).toEqual({
        value: '2',
      })
      const { data, errors } = await context.graphql.raw({
        query: `mutation { createTest(data: { value: null }) { id } }`,
      })
      expect(data).toEqual({ createTest: null })
      expectValidationError(errors, [
        { path: ['createTest'], messages: ['Test.value: missing value'] },
      ])
    })
  )
}

test(
  'bigInt with a defaultValue and isRequired rejects null',
  setupTestRunner({
    config: {
      lists: {
        Test: list({
          access: allowAll,
          fields: {
            value: bigInt({
              defaultValue: 5n,
              validation: { isRequired: true },
              db: { isNullable: true },
            }),
          },
        }),
      },
    },
  })(async ({ context }) => {
    const item = await context.query.Test.createOne({ data: {}, query: 'id value' })
    expect(item.value).toEqual('5')

    const created = await context.graphql.raw({
      query: `mutation { createTest(data: { value: null }) { id } }`,
    })
    expect(created.data).toEqual({ createTest: null })
    expectValidationError(created.errors, [
      { path: ['createTest'], messages: ['Test.value: missing value'] },
    ])

    const updated = await context.graphql.raw({
      query: `mutation { updateTest(where: { id: "${item.id}" }, data: { value: null }) { id } }`,
    })
    expect(updated.data).toEqual({ updateTest: null })
    expectValidationError(updated.errors, [
      { path: ['updateTest'], messages: ['Test.value: missing value'] },
    ])
  })
)
