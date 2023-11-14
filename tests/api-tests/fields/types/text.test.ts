import { text } from '@keystone-6/core/fields'
import { dbProvider } from '../../utils'
import { orderableFilterTests, filterTests, uniqueEqualityFilterTest } from './utils'

for (const isNullable of [true, false]) {
  describe(`text with isNullable: ${isNullable}`, () => {
    const basicValues = ['', 'a blah', 'b something', 'c other', 'd stuff'] as const
    filterTests(text({ db: { isNullable } }), match => {
      orderableFilterTests(match, basicValues, isNullable)

      const differentCases = [
        '',
        'foobar',
        'FOOBAR',
        'fooBAR',
        isNullable ? null : 'blah',
      ] as const
      if (dbProvider === 'postgresql' || dbProvider === 'sqlite') {
        match(differentCases, { equals: differentCases[3] }, [3])
        match(differentCases, { not: { equals: differentCases[3] } }, [0, 1, 2, 4])
      }
      if (dbProvider === 'mysql' || dbProvider === 'postgresql') {
        const addModeOnPostgres =
          dbProvider === 'postgresql' ? { mode: 'insensitive' as const } : {}
        match(differentCases, { ...addModeOnPostgres, equals: differentCases[3] }, [1, 2, 3])
        match(differentCases, { ...addModeOnPostgres, not: { equals: differentCases[3] } }, [0, 4])
      }

      const forPartials = ['', 'other', 'FOOBAR', 'fooBAR', 'foobar'] as const

      if (dbProvider === 'postgresql') {
        match(forPartials, { contains: 'oo' }, [3, 4])
        match(forPartials, { not: { contains: 'oo' } }, [0, 1, 2])
        match(forPartials, { startsWith: 'foo' }, [3, 4])
        match(forPartials, { not: { startsWith: 'foo' } }, [0, 1, 2])
        match(forPartials, { endsWith: 'BAR' }, [2, 3])
        match(forPartials, { not: { endsWith: 'BAR' } }, [0, 1, 4])
      }
      const caseInsensitivePartialMatches = [
        [{ contains: 'oo' }, [2, 3, 4]],
        [{ not: { contains: 'oo' } }, [0, 1]],
        [{ startsWith: 'foo' }, [2, 3, 4]],
        [{ not: { startsWith: 'foo' } }, [0, 1]],
        [{ endsWith: 'BAR' }, [2, 3, 4]],
        [{ not: { endsWith: 'BAR' } }, [0, 1]],
      ] as const
      for (const [where, expected] of caseInsensitivePartialMatches) {
        if (dbProvider === 'postgresql') {
          match(forPartials, { mode: 'insensitive', ...where }, expected)
        } else {
          match(forPartials, where, expected)
        }
      }
    })
    uniqueEqualityFilterTest(
      text({ db: { isNullable }, isIndexed: 'unique' }),
      basicValues,
      isNullable
    )
  })
}
