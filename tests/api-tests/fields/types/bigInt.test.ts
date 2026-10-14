import { describe, expect, test } from 'vitest'
import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { bigInt } from '@keystone-6/core/fields'
import { setupTestRunner } from '../../test-runner.ts'
import { expectValidationError } from '../../utils.ts'
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

describe('bigInt validation', () => {
  const runner = setupTestRunner({
    config: {
      lists: {
        Test: list({
          access: allowAll,
          fields: {
            value: bigInt({ validation: { min: -300n, max: 50000000n } }),
          },
        }),
      },
    },
  })

  for (const [name, value, message] of [
    ['min', '-301', 'value must be greater than or equal to -300'],
    ['max', '50000001', 'value must be less than or equal to 50000000'],
  ] as const) {
    test(
      `errors when outside validation.${name}`,
      runner(async ({ context }) => {
        const { data, errors } = await context.graphql.raw({
          query: `mutation { createTest(data: { value: "${value}" }) { id value } }`,
        })
        expect(data).toEqual({ createTest: null })
        expectValidationError(errors, [
          { path: ['createTest'], messages: [`Test.value: ${message}`] },
        ])
      })
    )
  }

  for (const [name, value] of [
    ['min', '-300'],
    ['max', '50000000'],
  ] as const) {
    test(
      `saves when the value is exactly the ${name}`,
      runner(async ({ context }) => {
        const item = await context.query.Test.createOne({ data: { value }, query: 'value' })
        expect(item).toEqual({ value })
      })
    )
  }
})
