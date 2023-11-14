import { integer } from '@keystone-6/core/fields'
import { orderableFilterTests, filterTests, uniqueEqualityFilterTest } from './utils'

for (const isNullable of [true, false]) {
  describe(`integer with isNullable: ${isNullable}`, () => {
    const values = [-234, 0, 5, 43, 65345] as const
    filterTests(integer({ db: { isNullable } }), match => {
      orderableFilterTests(match, values, isNullable)
    })
    uniqueEqualityFilterTest(
      integer({ db: { isNullable }, isIndexed: 'unique' }),
      values,
      isNullable
    )
  })
}
