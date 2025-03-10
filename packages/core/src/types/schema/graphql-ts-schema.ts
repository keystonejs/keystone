import type { ReadStream } from 'node:fs'
import * as graphqlTsSchema from '@graphql-ts/schema'
// @ts-expect-error
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import type { GraphQLFieldExtensions, GraphQLResolveInfo } from 'graphql'
import { GraphQLError, GraphQLScalarType } from 'graphql'
import { Decimal as DecimalValue } from 'decimal.js'
import type { KeystoneContext } from '../context'
import type { JSONValue } from '../utils'
import { field as fieldd } from './schema-api-with-context'

export {
  Boolean,
  Float,
  ID,
  Int,
  String,
  enum,
  enumValues,
  arg,
  inputObject,
  list,
  nonNull,
  scalar,
} from '@graphql-ts/schema/api-without-context'
export type {
  Arg,
  EnumType,
  EnumValue,
  InferValueFromArg,
  InferValueFromArgs,
  InferValueFromInputType,
  InputObjectType,
  InferValueFromOutputType,
  InputType,
  ListType,
  NonNullType,
  NullableInputType,
  ScalarType,
} from '@graphql-ts/schema/api-without-context'
export { bindGraphQLSchemaAPIToContext } from '@graphql-ts/schema'
export type { BaseSchemaMeta, Extension } from '@graphql-ts/extend'
export { extend, wrap } from '@graphql-ts/extend'
export { fields, interface, interfaceField, object, union } from './schema-api-with-context'

// TODO: remove when we use { graphql } from '.keystone'
type SomeTypeThatIsntARecordOfArgs = string
export type FieldFuncResolve<
  Source,
  Args extends { [Key in keyof Args]: graphqlTsSchema.Arg<graphqlTsSchema.InputType> },
  Type extends OutputType<Context>,
  Key extends string,
  Context extends KeystoneContext<any>,
> =
  // the tuple is here because we _don't_ want this to be distributive
  // if this was distributive then it would optional when it should be required e.g.
  // graphql.object<{ id: string } | { id: boolean }>()({
  //   name: "Node",
  //   fields: {
  //     id: graphql.field({
  //       type: graphql.nonNull(graphql.ID),
  //     }),
  //   },
  // });
  [Key] extends [keyof Source]
    ? Source[Key] extends
        | graphqlTsSchema.InferValueFromOutputType<Type>
        | ((
            args: graphqlTsSchema.InferValueFromArgs<Args>,
            context: Context,
            info: GraphQLResolveInfo
          ) => graphqlTsSchema.InferValueFromOutputType<Type>)
      ? {
          resolve?: graphqlTsSchema.FieldResolver<
            Source,
            SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args,
            Type,
            Context
          >
        }
      : {
          resolve: graphqlTsSchema.FieldResolver<
            Source,
            SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args,
            Type,
            Context
          >
        }
    : {
        resolve: graphqlTsSchema.FieldResolver<
          Source,
          SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args,
          Type,
          Context
        >
      }

type FieldFuncArgs<
  Source,
  Args extends { [Key in keyof Args]: graphqlTsSchema.Arg<graphqlTsSchema.InputType> },
  Type extends OutputType<Context>,
  Key extends string,
  Context extends KeystoneContext,
> = {
  args?: Args
  type: Type
  deprecationReason?: string
  description?: string
  extensions?: Readonly<GraphQLFieldExtensions<Source, unknown>>
} & FieldFuncResolve<Source, Args, Type, Key, Context>

type FieldFunc = <
  Source,
  Type extends OutputType<Context>,
  Key extends string,
  Context extends KeystoneContext<any>,
  Args extends { [Key in keyof Args]: graphqlTsSchema.Arg<graphqlTsSchema.InputType> } = object,
>(
  field: FieldFuncArgs<Source, Args, Type, Key, Context>
) => graphqlTsSchema.Field<Source, Args, Type, Key, Context>

export const field = fieldd as FieldFunc
// TODO: remove when we use { graphql } from '.keystone'

export const JSON = graphqlTsSchema.g.scalar<JSONValue>(
  new GraphQLScalarType({
    name: 'JSON',
    description:
      'The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).',
    specifiedByURL: 'http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf',
    // the defaults for serialize, parseValue and parseLiteral do what makes sense for JSON
  })
)

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

function bytesToHex(bytes: Uint8Array): string {
  let str = ''
  for (const byte of bytes) {
    str += byte.toString(16).padStart(2, '0')
  }
  return str
}

export const Hex = graphqlTsSchema.g.scalar<Uint8Array>(
  new GraphQLScalarType({
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
        // + ensuring that if you pass in a Buffer, resolvers recieve a normal Uint8Array
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
      return bytesToHex(value)
    },
  })
)

type FileUpload = {
  filename: string
  mimetype: string
  encoding: string
  createReadStream(): ReadStream
}

export const Upload = graphqlTsSchema.g.scalar<Promise<FileUpload>>(GraphQLUpload)

// - Decimal.js throws on invalid inputs
// - Decimal.js can represent +Infinity and -Infinity, these aren't values in Postgres' decimal,
//   NaN is but Prisma doesn't support it
//   .isFinite refers to +Infinity, -Infinity and NaN
export const Decimal = graphqlTsSchema.graphql.scalar<DecimalValue & { scaleToPrint?: number }>(
  new GraphQLScalarType({
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
      if (typeof value !== 'string')
        throw new GraphQLError('Decimal only accepts values as strings')
      const decimal = new DecimalValue(value)
      if (!decimal.isFinite()) throw new GraphQLError('Decimal values must be finite')
      return decimal
    },
  })
)

export const BigInt = graphqlTsSchema.graphql.scalar<bigint>(
  new GraphQLScalarType({
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
)

// from https://github.com/excitement-engineer/graphql-iso-date/blob/master/src/utils/validator.js#L121
// this is also what prisma uses https://github.com/prisma/prisma/blob/20b58fe65d581bcb43c0d5c28d4b89cabc2d99b2/packages/client/src/runtime/utils/common.ts#L126-L128
const RFC_3339_REGEX =
  /^(\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60))(\.\d{1,})?(([Z])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/

function parseDate(input: string): Date {
  if (!RFC_3339_REGEX.test(input)) {
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

export const DateTime = graphqlTsSchema.g.scalar<Date>(
  new GraphQLScalarType({
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
      if (value instanceof Date) return value
      if (typeof value !== 'string') {
        throw new GraphQLError('DateTime only accepts values as strings')
      }
      return parseDate(value)
    },
  })
)

const RFC_3339_FULL_DATE_REGEX = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/

function validateCalendarDay(input: string) {
  if (!RFC_3339_FULL_DATE_REGEX.test(input)) {
    throw new GraphQLError('CalendarDay scalars must be in the form of a full-date ISO 8601 string')
  }
}

export const CalendarDay = graphqlTsSchema.g.scalar<string>(
  new GraphQLScalarType({
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
)

export const Empty = graphqlTsSchema.g.scalar<{}>(
  new GraphQLScalarType({
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
)

export type NullableType<Context extends KeystoneContext = KeystoneContext> =
  graphqlTsSchema.NullableType<Context>
export type Type<Context extends KeystoneContext = KeystoneContext> = graphqlTsSchema.Type<Context>
export type NullableOutputType<Context extends KeystoneContext = KeystoneContext> =
  graphqlTsSchema.NullableOutputType<Context>
export type OutputType<Context extends KeystoneContext = KeystoneContext> =
  graphqlTsSchema.OutputType<Context>
export type Field<
  Source,
  Args extends Record<string, graphqlTsSchema.Arg<any>>,
  TType extends OutputType<Context>,
  Key extends string,
  Context extends KeystoneContext = KeystoneContext,
> = graphqlTsSchema.Field<Source, Args, TType, Key, Context>
export type FieldResolver<
  Source,
  Args extends Record<string, graphqlTsSchema.Arg<any>>,
  TType extends OutputType<Context>,
  Context extends KeystoneContext = KeystoneContext,
> = graphqlTsSchema.FieldResolver<Source, Args, TType, Context>
export type ObjectType<
  Source,
  Context extends KeystoneContext = KeystoneContext,
> = graphqlTsSchema.ObjectType<Source, Context>
export type UnionType<
  Source,
  Context extends KeystoneContext = KeystoneContext,
> = graphqlTsSchema.UnionType<Source, Context>
export type InterfaceType<
  Source,
  Fields extends Record<string, graphqlTsSchema.InterfaceField<any, OutputType<Context>, Context>>,
  Context extends KeystoneContext = KeystoneContext,
> = graphqlTsSchema.InterfaceType<Source, Fields, Context>
export type InterfaceField<
  Args extends Record<string, graphqlTsSchema.Arg<any>>,
  TType extends OutputType<Context>,
  Context extends KeystoneContext = KeystoneContext,
> = graphqlTsSchema.InterfaceField<Args, TType, Context>
