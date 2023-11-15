import { decimal } from '@keystone-6/core/fields'
import { dbProvider } from '../../utils'
import { orderableFilterTests, filterTests, uniqueEqualityFilterTest } from './utils'

if (dbProvider === 'sqlite') {
  test('jest requires at least one test in a file and the decimal field does not support SQLite', () => {})
} else {
  for (const isNullable of [true, false]) {
    describe(`decimal with isNullable: ${isNullable}`, () => {
      const values = ['-123.4500', '0.0100', '50.0000', '2000.0000', '40000.0000'] as const
      filterTests(decimal({ db: { isNullable } }), match => {
        orderableFilterTests(match, values, isNullable)
      })
      uniqueEqualityFilterTest(
        decimal({ db: { isNullable }, isIndexed: 'unique' }),
        values,
        isNullable
      )
    })
  }
}
