import { float } from '@keystone-6/core/fields'
import { orderableFilterTests, filterTests, uniqueEqualityFilterTest } from './utils'

for (const isNullable of [true, false]) {
  describe(`float with isNullable: ${isNullable}`, () => {
    const values = [-21.5, 0, 1.2, 2.3, 3] as const
    filterTests(float({ db: { isNullable } }), match => {
      orderableFilterTests(match, values, isNullable)
    })
    uniqueEqualityFilterTest(
      float({ db: { isNullable }, isIndexed: 'unique' }),
      values,
      isNullable
    )
  })
}
