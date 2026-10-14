import { describe, expect, test } from 'vitest'
import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { bigInt } from '@keystone-6/core/fields'
import { setupTestRunner } from '../../test-runner.ts'
import { dbProvider } from '../../utils.ts'
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
    })
  )
}
