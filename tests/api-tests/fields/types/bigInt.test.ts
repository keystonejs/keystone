import { bigInt } from '@keystone-6/core/fields'
import { orderableFilterTests, filterTests, uniqueEqualityFilterTest } from './utils'

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
