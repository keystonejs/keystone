import { describe, expect, test } from 'vitest'
import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { bigInt } from '@keystone-6/core/fields'
import { setupTestRunner } from '../../test-runner.ts'
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

describe('bigInt validation bounds', () => {
  const runner = setupTestRunner({
    config: {
      lists: {
        Test: list({
          access: allowAll,
          fields: { value: bigInt({ validation: { min: 0n, max: 1000n } }) },
        }),
      },
    },
  })

  for (const operation of ['create', 'update'] as const) {
    for (const [value, error] of [
      ['0', undefined],
      ['1000', undefined],
      ['-1', 'value must be greater than or equal to 0'],
      ['1001', 'value must be less than or equal to 1000'],
    ] as const) {
      test(
        `${operation} ${error ? 'rejects' : 'accepts'} ${value}`,
        runner(async ({ context }) => {
          const result =
            operation === 'create'
              ? context.query.Test.createOne({ data: { value }, query: 'value' })
              : context.query.Test.updateOne({
                  where: {
                    id: (await context.query.Test.createOne({ data: { value: '500' } })).id,
                  },
                  data: { value },
                  query: 'value',
                })
          if (error) {
            await expect(result).rejects.toThrow(`Test.value: ${error}`)
          } else {
            await expect(result).resolves.toEqual({ value })
          }
        })
      )
    }
  }
})
