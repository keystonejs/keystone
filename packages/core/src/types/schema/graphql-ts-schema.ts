import type { ReadStream } from 'fs';
import * as graphqlTsSchema from '@graphql-ts/schema';
// @ts-ignore
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { GraphQLError, GraphQLScalarType } from 'graphql';
import { Decimal as DecimalValue } from 'decimal.js';
import { KeystoneContext } from '../context';
import { JSONValue } from '../utils';
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
} from '@graphql-ts/schema/api-without-context';
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
} from '@graphql-ts/schema/api-without-context';
export { bindGraphQLSchemaAPIToContext } from '@graphql-ts/schema';
export type { BaseSchemaMeta, Extension } from '@graphql-ts/extend';
export { extend, wrap } from '@graphql-ts/extend';
export { field, fields, interface, interfaceField, object, union } from './schema-api-with-context';

export type Context = KeystoneContext;

export const JSON = graphqlTsSchema.graphql.scalar<JSONValue>(
  new GraphQLScalarType({
    name: 'JSON',
    description:
      'The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).',
    specifiedByURL: 'http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf',
    // the defaults for serialize, parseValue and parseLiteral do what makes sense for JSON
  })
);

type FileUpload = {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream(): ReadStream;
};

export const Upload = graphqlTsSchema.graphql.scalar<Promise<FileUpload>>(GraphQLUpload);

// - Decimal.js throws on invalid inputs
// - Decimal.js can represent +Infinity and -Infinity, these aren't values in Postgres' decimal,
//   NaN is but Prisma doesn't support it
//   .isFinite refers to +Infinity, -Infinity and NaN
export const Decimal = graphqlTsSchema.graphql.scalar<DecimalValue & { scaleToPrint?: number }>(
  new GraphQLScalarType({
    name: 'Decimal',
    serialize(value) {
      if (!DecimalValue.isDecimal(value)) {
        throw new GraphQLError(`unexpected value provided to Decimal scalar: ${value}`);
      }
      const cast = value as DecimalValue & { scaleToPrint?: number };
      if (cast.scaleToPrint !== undefined) {
        return value.toFixed(cast.scaleToPrint);
      }
      return value.toString();
    },
    parseLiteral(value) {
      if (value.kind !== 'StringValue') {
        throw new GraphQLError('Decimal only accepts values as strings');
      }
      let decimal = new DecimalValue(value.value);
      if (!decimal.isFinite()) {
        throw new GraphQLError('Decimal values must be finite');
      }
      return decimal;
    },
    parseValue(value) {
      if (DecimalValue.isDecimal(value)) {
        if (!value.isFinite()) {
          throw new GraphQLError('Decimal values must be finite');
        }
        return value;
      }
      if (typeof value !== 'string') {
        throw new GraphQLError('Decimal only accepts values as strings');
      }
      let decimal = new DecimalValue(value);
      if (!decimal.isFinite()) {
        throw new GraphQLError('Decimal values must be finite');
      }
      return decimal;
    },
  })
);

export const BigInt = graphqlTsSchema.graphql.scalar<bigint>(
  new GraphQLScalarType({
    name: 'BigInt',
    serialize(value) {
      if (typeof value !== 'bigint') {
        throw new GraphQLError(`unexpected value provided to BigInt scalar: ${value}`);
      }
      return value.toString();
    },
    parseLiteral(value) {
      if (value.kind !== 'StringValue') {
        throw new GraphQLError('BigInt only accepts values as strings');
      }
      return globalThis.BigInt(value.value);
    },
    parseValue(value) {
      if (typeof value === 'bigint') {
        return value;
      }
      if (typeof value !== 'string') {
        throw new GraphQLError('BigInt only accepts values as strings');
      }
      return globalThis.BigInt(value);
    },
  })
);

// from https://github.com/excitement-engineer/graphql-iso-date/blob/master/src/utils/validator.js#L121
// this is also what prisma uses https://github.com/prisma/prisma/blob/20b58fe65d581bcb43c0d5c28d4b89cabc2d99b2/packages/client/src/runtime/utils/common.ts#L126-L128
const RFC_3339_REGEX =
  /^(\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60))(\.\d{1,})?(([Z])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/;

function parseDate(input: string): Date {
  if (!RFC_3339_REGEX.test(input)) {
    throw new GraphQLError(
      'DateTime scalars must be in the form of a full ISO 8601 date-time string'
    );
  }
  const parsed = new Date(input);
  if (isNaN(parsed.valueOf())) {
    throw new GraphQLError(
      'DateTime scalars must be in the form of a full ISO 8601 date-time string'
    );
  }
  return parsed;
}

export const DateTime = graphqlTsSchema.graphql.scalar<Date>(
  new GraphQLScalarType({
    name: 'DateTime',
    specifiedByURL: 'https://datatracker.ietf.org/doc/html/rfc3339#section-5.6',
    serialize(value: unknown) {
      if (!(value instanceof Date) || isNaN(value.valueOf())) {
        throw new GraphQLError(`unexpected value provided to DateTime scalar: ${value}`);
      }
      return value.toISOString();
    },
    parseLiteral(value) {
      if (value.kind !== 'StringValue') {
        throw new GraphQLError('DateTime only accepts values as strings');
      }
      return parseDate(value.value);
    },
    parseValue(value: unknown) {
      if (value instanceof Date) {
        return value;
      }
      if (typeof value !== 'string') {
        throw new GraphQLError('DateTime only accepts values as strings');
      }
      return parseDate(value);
    },
  })
);

const RFC_3339_FULL_DATE_REGEX = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;

function validateCalendarDay(input: string) {
  if (!RFC_3339_FULL_DATE_REGEX.test(input)) {
    throw new GraphQLError(
      'CalendarDay scalars must be in the form of a full-date ISO 8601 string'
    );
  }
}

export const CalendarDay = graphqlTsSchema.graphql.scalar<string>(
  new GraphQLScalarType({
    name: 'CalendarDay',
    specifiedByURL: 'https://datatracker.ietf.org/doc/html/rfc3339#section-5.6',
    serialize(value: unknown) {
      if (typeof value !== 'string') {
        throw new GraphQLError(`unexpected value provided to CalendarDay scalar: ${value}`);
      }
      return value;
    },
    parseLiteral(value) {
      if (value.kind !== 'StringValue') {
        throw new GraphQLError('CalendarDay only accepts values as strings');
      }
      validateCalendarDay(value.value);
      return value.value;
    },
    parseValue(value: unknown) {
      if (typeof value !== 'string') {
        throw new GraphQLError('CalendarDay only accepts values as strings');
      }
      validateCalendarDay(value);
      return value;
    },
  })
);

export type NullableType = graphqlTsSchema.NullableType<Context>;
export type Type = graphqlTsSchema.Type<Context>;
export type NullableOutputType = graphqlTsSchema.NullableOutputType<Context>;
export type OutputType = graphqlTsSchema.OutputType<Context>;
export type Field<
  Source,
  Args extends Record<string, graphqlTsSchema.Arg<any>>,
  TType extends OutputType,
  Key extends string
> = graphqlTsSchema.Field<Source, Args, TType, Key, Context>;
export type FieldResolver<
  Source,
  Args extends Record<string, graphqlTsSchema.Arg<any>>,
  TType extends OutputType
> = graphqlTsSchema.FieldResolver<Source, Args, TType, Context>;
export type ObjectType<Source> = graphqlTsSchema.ObjectType<Source, Context>;
export type UnionType<Source> = graphqlTsSchema.UnionType<Source, Context>;
export type InterfaceType<
  Source,
  Fields extends Record<string, graphqlTsSchema.InterfaceField<any, OutputType, Context>>
> = graphqlTsSchema.InterfaceType<Source, Fields, Context>;
export type InterfaceField<
  Args extends Record<string, graphqlTsSchema.Arg<any>>,
  TType extends OutputType
> = graphqlTsSchema.InterfaceField<Args, TType, Context>;
