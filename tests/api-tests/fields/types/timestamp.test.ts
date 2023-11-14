import { timestamp } from '@keystone-6/core/fields'
import { orderableFilterTests, filterTests, uniqueEqualityFilterTest } from './utils'

for (const isNullable of [true, false]) {
  describe(`timestamp with isNullable: ${isNullable}`, () => {
    const values = [
      '1979-04-12T00:08:00.000Z',
      '1980-10-01T23:59:59.999Z',
      '1990-12-31T12:34:56.789Z',
      '2000-01-20T00:08:00.000Z',
      '2020-06-10T10:20:30.456Z',
    ] as const
    filterTests(timestamp({ db: { isNullable } }), match => {
      orderableFilterTests(match, values, isNullable)
    })
    uniqueEqualityFilterTest(
      timestamp({ db: { isNullable }, isIndexed: 'unique' }),
      values,
      isNullable
    )
  })
}
