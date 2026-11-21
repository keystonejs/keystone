import type { ReadStream } from 'node:fs'
// @ts-expect-error
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { GraphQLError, GraphQLScalarType } from 'graphql/index.js'
import { Decimal as DecimalValue } from 'decimal.js'
import type { JSONValue } from '../utils.ts'
import { toHex } from '../../lib/encoding.ts'

export const JSON = new GraphQLScalarType<JSONValue>({
  name: 'JSON',
  description:
    'The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).',
  specifiedByURL: 'http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf',
  // the defaults for serialize, parseValue and parseLiteral do what makes sense for JSON
})

// avoiding using Buffer.from/etc. because we want a plain Uint8Array and that would be an extra conversion
// when https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toHex and etc.
// is available we should use that instead

function hexToBytes(value: string): Uint8Array {
  if (!/^[0-9a-fA-F]*$/.test(value)) {
    throw new GraphQLError('Hex values must be a string of hexadecimal characters')
  }
  if (value.length % 2 !== 0) {
    throw new GraphQLError('Hex values must have an even number of characters')
  }
  const bytes = new Uint8Array(value.length / 2)
  for (let i = 0; i < bytes.byteLength; i += 1) {
    const start = i * 2
    bytes[i] = parseInt(value.slice(start, start + 2), 16)
  }
  return bytes
}

export const Hex = new GraphQLScalarType({
  name: 'Hex',
  description: 'The `Hex` scalar type represents bytes as a string of hexadecimal characters.',
  parseLiteral(value) {
    if (value.kind !== 'StringValue') {
      throw new GraphQLError('Hex only accepts values as strings')
    }
    return hexToBytes(value.value)
  },
  parseValue(value) {
    // so that when you're doing a mutation in a resolver, you can just pass in a Uint8Array directly
    if (value instanceof Uint8Array) {
      // duplicate it though to avoid any weirdness with the array being mutated
      // + ensuring that if you pass in a Buffer, resolvers receive a normal Uint8Array
      return Uint8Array.from(value)
    }
    if (typeof value !== 'string') {
      throw new GraphQLError('Hex only accepts values as strings')
    }
    return hexToBytes(value)
  },
  serialize(value) {
    if (!(value instanceof Uint8Array)) {
      throw new GraphQLError(`unexpected value provided to Hex scalar: ${value}`)
    }
    return toHex(value)
  },
})

type FileUpload = {
  filename: string
  mimetype: string
  encoding: string
  createReadStream(): ReadStream
}

export const Upload: GraphQLScalarType<Promise<FileUpload>, {}> = GraphQLUpload

// - Decimal.js throws on invalid inputs
// - Decimal.js can represent +Infinity and -Infinity, these aren't values in Postgres' decimal,
//   NaN is but Prisma doesn't support it
//   .isFinite refers to +Infinity, -Infinity and NaN
export const Decimal = new GraphQLScalarType<DecimalValue & { scaleToPrint?: number }, string>({
  name: 'Decimal',
  serialize(value) {
    if (!DecimalValue.isDecimal(value))
      throw new GraphQLError(`unexpected value provided to Decimal scalar: ${value}`)
    const cast = value as DecimalValue & { scaleToPrint?: number }
    if (cast.scaleToPrint !== undefined) return value.toFixed(cast.scaleToPrint)
    return value.toString()
  },
  parseLiteral(value) {
    if (value.kind !== 'StringValue')
      throw new GraphQLError('Decimal only accepts values as strings')
    const decimal = new DecimalValue(value.value)
    if (!decimal.isFinite()) throw new GraphQLError('Decimal values must be finite')
    return decimal
  },
  parseValue(value) {
    if (DecimalValue.isDecimal(value)) {
      if (!value.isFinite()) throw new GraphQLError('Decimal values must be finite')
      return value
    }
    if (typeof value !== 'string') throw new GraphQLError('Decimal only accepts values as strings')
    const decimal = new DecimalValue(value)
    if (!decimal.isFinite()) throw new GraphQLError('Decimal values must be finite')
    return decimal
  },
})

export const BigInt = new GraphQLScalarType({
  name: 'BigInt',
  serialize(value) {
    if (typeof value !== 'bigint')
      throw new GraphQLError(`unexpected value provided to BigInt scalar: ${value}`)
    return value.toString()
  },
  parseLiteral(value) {
    if (value.kind !== 'StringValue')
      throw new GraphQLError('BigInt only accepts values as strings')
    return globalThis.BigInt(value.value)
  },
  parseValue(value) {
    if (typeof value === 'bigint') return value
    if (typeof value !== 'string') throw new GraphQLError('BigInt only accepts values as strings')
    return globalThis.BigInt(value)
  },
})

// from https://github.com/excitement-engineer/graphql-iso-date/blob/master/src/utils/validator.js#L121
// this is also what prisma uses https://github.com/prisma/prisma/blob/20b58fe65d581bcb43c0d5c28d4b89cabc2d99b2/packages/client/src/runtime/utils/common.ts#L126-L128
const RFC_3339_REGEX =
  /^(\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60))(\.\d{1,})?(([Z])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

// the regexes only check that the day is between 01 and 31,
// this checks that the day actually exists in the given month and year
// (otherwise e.g. new Date('2021-02-30') silently rolls over to 2021-03-02)
function isValidCalendarDate(input: string) {
  const year = Number(input.slice(0, 4))
  const month = Number(input.slice(5, 7))
  const day = Number(input.slice(8, 10))
  const daysInMonth = month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1]
  return day <= daysInMonth
}

function parseDate(input: string): Date {
  if (!RFC_3339_REGEX.test(input) || !isValidCalendarDate(input)) {
    throw new GraphQLError(
      'DateTime scalars must be in the form of a full ISO 8601 date-time string'
    )
  }
  const parsed = new Date(input)
  if (isNaN(parsed.valueOf())) {
    throw new GraphQLError(
      'DateTime scalars must be in the form of a full ISO 8601 date-time string'
    )
  }
  return parsed
}

export const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  specifiedByURL: 'https://datatracker.ietf.org/doc/html/rfc3339#section-5.6',
  serialize(value: unknown) {
    if (!(value instanceof Date) || isNaN(value.valueOf())) {
      throw new GraphQLError(`unexpected value provided to DateTime scalar: ${value}`)
    }
    return value.toISOString()
  },
  parseLiteral(value) {
    if (value.kind !== 'StringValue') {
      throw new GraphQLError('DateTime only accepts values as strings')
    }
    return parseDate(value.value)
  },
  parseValue(value: unknown) {
    if (value instanceof Date) {
      if (isNaN(value.valueOf())) {
        throw new GraphQLError('DateTime scalars must be valid dates')
      }
      return value
    }
    if (typeof value !== 'string') {
      throw new GraphQLError('DateTime only accepts values as strings')
    }
    return parseDate(value)
  },
})

const RFC_3339_FULL_DATE_REGEX = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/

function validateCalendarDay(input: string) {
  if (!RFC_3339_FULL_DATE_REGEX.test(input) || !isValidCalendarDate(input)) {
    throw new GraphQLError('CalendarDay scalars must be in the form of a full-date ISO 8601 string')
  }
}

export const CalendarDay = new GraphQLScalarType({
  name: 'CalendarDay',
  specifiedByURL: 'https://datatracker.ietf.org/doc/html/rfc3339#section-5.6',
  serialize(value: unknown) {
    if (typeof value !== 'string') {
      throw new GraphQLError(`unexpected value provided to CalendarDay scalar: ${value}`)
    }
    return value
  },
  parseLiteral(value) {
    if (value.kind !== 'StringValue') {
      throw new GraphQLError('CalendarDay only accepts values as strings')
    }
    validateCalendarDay(value.value)
    return value.value
  },
  parseValue(value: unknown) {
    if (typeof value !== 'string') {
      throw new GraphQLError('CalendarDay only accepts values as strings')
    }
    validateCalendarDay(value)
    return value
  },
})

export const Empty = new GraphQLScalarType({
  name: 'Empty',
  serialize(value) {
    return null
  },
  parseLiteral(value) {
    return {}
  },
  parseValue(value) {
    return {}
  },
})
