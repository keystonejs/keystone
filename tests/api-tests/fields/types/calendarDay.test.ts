import { calendarDay } from '@keystone-6/core/fields'
import { dbProvider } from '../../utils'
import { filterTests, orderableFilterTests, uniqueEqualityFilterTest } from './utils'

for (const isNullable of [true, false]) {
  describe(`calendarDay with isNullable: ${isNullable}`, () => {
    const values = ['1979-04-12', '1980-10-01', '1990-12-31', '2000-01-20', '2020-06-10'] as const
    filterTests(calendarDay({ db: { isNullable } }), match => {
      orderableFilterTests(match, values, isNullable)
    })

    uniqueEqualityFilterTest(
      calendarDay({ db: { isNullable }, isIndexed: 'unique' }),
      values,

      // TODO: isNullable, failing for POSTGRES and MySQL
      dbProvider === 'sqlite' ? isNullable : false
    )
  })
}
