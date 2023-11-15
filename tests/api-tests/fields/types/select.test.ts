import { select } from '@keystone-6/core/fields'
import { dbProvider } from '../../utils'
import { orderableFilterTests, filterTests, uniqueEqualityFilterTest } from './utils'

for (const isNullable of [true, false]) {
  describe(`select with isNullable: ${isNullable}`, () => {
    for (const [type, options] of [
      [
        'string',
        [
          '1number',
          'a string',
          'b @¯\\_(ツ)_/¯',
          'c another string',
          'd blah',
          'e something else',
          'f blah blah',
        ].map(value => ({ value, label: value })),
        ['integer', Array.from({ length: 6 }).map((_, i) => ({ value: i, label: i.toString() }))],
        ...(dbProvider === 'postgresql'
          ? [
              [
                'enum',
                Array.from({ length: 6 }).map((_, i) => ({
                  value: 'a' + i.toString(),
                  label: i.toString(),
                })),
              ],
            ]
          : []),
      ],
    ] as const) {
      describe(`type: ${type}`, () => {
        const values = [
          options[0].value,
          options[2].value,
          options[3].value,
          options[4].value,
          options[5].value,
        ] as const
        filterTests(select({ db: { isNullable }, options, type }), match => {
          orderableFilterTests(match, values, isNullable)
        })
        uniqueEqualityFilterTest(
          select({ db: { isNullable }, options, type, isIndexed: 'unique' }),
          values,
          isNullable
        )
      })
    }
  })
}
