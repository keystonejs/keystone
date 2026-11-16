import { describe, expect, test } from 'vitest'
import { parseDate as parseAdminUIDate } from '@internationalized/date'
import { graphql, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql/index.js'
import { CalendarDay, DateTime } from './scalars.ts'

// a minimal schema so that values go through the real GraphQL execution paths:
// inline values use parseLiteral, variables use parseValue
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      calendarDay: {
        type: GraphQLString,
        args: { value: { type: CalendarDay } },
        resolve: (_, { value }) => value,
      },
      dateTime: {
        type: GraphQLString,
        args: { value: { type: DateTime } },
        resolve: (_, { value }) => (value as Date).toISOString(),
      },
    },
  }),
})

type Field = 'calendarDay' | 'dateTime'

const PARSE_PATHS = [
  [
    'an inline literal (parseLiteral)',
    (field: Field, value: string) =>
      graphql({ schema, source: `{ ${field}(value: ${JSON.stringify(value)}) }` }),
  ],
  [
    'a variable (parseValue)',
    (field: Field, value: string) =>
      graphql({
        schema,
        source: `query ($value: ${field === 'calendarDay' ? 'CalendarDay' : 'DateTime'}) { ${field}(value: $value) }`,
        variableValues: { value },
      }),
  ],
] as const

const CALENDAR_DAY_ERROR = 'CalendarDay scalars must be in the form of a full-date ISO 8601 string'
const DATE_TIME_ERROR = 'DateTime scalars must be in the form of a full ISO 8601 date-time string'

// dates that do not exist, but match the old YYYY-MM-DD format check (day 01-31)
const IMPOSSIBLE_DAYS = [
  '2021-02-29', // 2021 is not a leap year
  '2021-02-30',
  '2021-02-31',
  '2023-02-29', // 2023 is not a leap year
  '1900-02-29', // divisible by 100 but not 400, not a leap year
  '2100-02-29', // divisible by 100 but not 400, not a leap year
  '2024-02-30', // leap years still only have 29 days in February
  '2021-04-31', // 30-day months
  '2021-06-31',
  '2021-09-31',
  '2021-11-31',
]

// the last day of every month, plus 29 February in leap years
const REAL_DAYS = [
  '2021-01-31',
  '2021-02-28',
  '2021-03-31',
  '2021-04-30',
  '2021-05-31',
  '2021-06-30',
  '2021-07-31',
  '2021-08-31',
  '2021-09-30',
  '2021-10-31',
  '2021-11-30',
  '2021-12-31',
  '2024-02-29', // divisible by 4, a leap year
  '2000-02-29', // divisible by 400, a leap year
]

describe('Symptom 1: DateTime silently rolled 2021-02-30 over to 2021-03-02', () => {
  test('cause: JavaScript Date rolls impossible days forward instead of failing', () => {
    expect(new Date('2021-02-30T12:00:00.000Z').toISOString()).toBe('2021-03-02T12:00:00.000Z')
  })

  describe.each(PARSE_PATHS)('as %s', (_, run) => {
    test.each(IMPOSSIBLE_DAYS)('rejects %sT12:00:00.000Z with a GraphQL error', async day => {
      const result = await run('dateTime', `${day}T12:00:00.000Z`)
      expect(result.data).toBeUndefined()
      expect(result.errors).toHaveLength(1)
      expect(result.errors![0].message).toContain(DATE_TIME_ERROR)
    })

    test.each(REAL_DAYS)('keeps %sT12:00:00.000Z exactly as given', async day => {
      const value = `${day}T12:00:00.000Z`
      const result = await run('dateTime', value)
      expect(result.errors).toBeUndefined()
      expect(result.data).toEqual({ dateTime: value })
    })

    // the calendar check uses the date as written, before any timezone conversion
    test('accepts 2021-02-28 in UTC-5, even though it is 1 March in UTC', async () => {
      const result = await run('dateTime', '2021-02-28T23:00:00-05:00')
      expect(result.errors).toBeUndefined()
      expect(result.data).toEqual({ dateTime: '2021-03-01T04:00:00.000Z' })
    })

    test('rejects 2021-02-29 in UTC+5, even though it would be 28 February in UTC', async () => {
      const result = await run('dateTime', '2021-02-29T01:00:00+05:00')
      expect(result.errors).toHaveLength(1)
      expect(result.errors![0].message).toContain(DATE_TIME_ERROR)
    })
  })

  // resolvers can pass Date objects directly, e.g. through context.query
  test('rejects an invalid Date object passed from server-side code', () => {
    expect(() => DateTime.parseValue(new Date('not a date'))).toThrow(
      'DateTime scalars must be valid dates'
    )
  })

  test('accepts a valid Date object passed from server-side code', () => {
    const date = new Date('2024-02-29T00:00:00.000Z')
    expect(DateTime.parseValue(date)).toBe(date)
  })
})

describe('Symptom 2: CalendarDay was saved as a different date on PostgreSQL and MySQL', () => {
  // the same conversion the calendarDay field uses before writing to a native DATE column
  const toNativeDate = (day: string) => new Date(`${day}T00:00Z`)

  test('cause: the PostgreSQL/MySQL conversion rolls 2021-02-30 forward to 2021-03-02', () => {
    expect(toNativeDate('2021-02-30').toISOString().slice(0, 10)).toBe('2021-03-02')
  })

  describe.each(PARSE_PATHS)('as %s', (_, run) => {
    test.each(IMPOSSIBLE_DAYS)('rejects %s before it reaches the database', async day => {
      const result = await run('calendarDay', day)
      expect(result.data).toBeUndefined()
      expect(result.errors).toHaveLength(1)
      expect(result.errors![0].message).toContain(CALENDAR_DAY_ERROR)
    })

    test.each(REAL_DAYS)('accepts %s', async day => {
      const result = await run('calendarDay', day)
      expect(result.errors).toBeUndefined()
      expect(result.data).toEqual({ calendarDay: day })
    })
  })

  test.each(REAL_DAYS)(
    'every accepted day (%s) is saved unchanged by the PostgreSQL/MySQL conversion',
    day => {
      expect(() => CalendarDay.parseValue(day)).not.toThrow()
      expect(toNativeDate(day).toISOString().slice(0, 10)).toBe(day)
    }
  )
})

describe('Symptom 3: on SQLite, CalendarDay saved the bad text and the Admin UI crashed', () => {
  // SQLite stores CalendarDay as plain text, so whatever passes the scalar is saved as-is.
  // the Admin UI item page then parses that text with @internationalized/date's parseDate

  test('cause: the Admin UI date parser throws on a stored 2021-02-30', () => {
    expect(() => parseAdminUIDate('2021-02-30')).toThrow(RangeError)
  })

  describe.each(PARSE_PATHS)('as %s', (_, run) => {
    test.each(IMPOSSIBLE_DAYS)('rejects %s, so it is never stored as text', async day => {
      const result = await run('calendarDay', day)
      expect(result.data).toBeUndefined()
      expect(result.errors).toHaveLength(1)
      expect(result.errors![0].message).toContain(CALENDAR_DAY_ERROR)
    })
  })

  test.each(REAL_DAYS)('every accepted day (%s) can be opened in the Admin UI', day => {
    expect(() => CalendarDay.parseValue(day)).not.toThrow()
    expect(parseAdminUIDate(day).toString()).toBe(day)
  })
})
