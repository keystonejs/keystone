import * as graphqlTsSchema from '@graphql-ts/schema';
import { GraphQLJSON } from 'graphql-type-json';
// this is imported from a specific path so that we don't import busboy here because webpack doesn't like bundling it
// @ts-ignore
import GraphQLUpload from 'graphql-upload/public/GraphQLUpload.js';
import type { FileUpload } from 'graphql-upload';
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
export { field, fields, interface, interfaceField, object, union } from './schema-api-with-context';

export type Context = KeystoneContext;

export const JSON = graphqlTsSchema.graphql.scalar<JSONValue>(GraphQLJSON);
export const Upload = graphqlTsSchema.graphql.scalar<Promise<FileUpload>>(GraphQLUpload);

export type NullableType = graphqlTsSchema.NullableType<Context>;
export type Type = graphqlTsSchema.Type<Context>;
export type NullableOutputType = graphqlTsSchema.NullableOutputType<Context>;
export type OutputType = graphqlTsSchema.OutputType<Context>;
export type Field<
  RootVal,
  Args extends Record<string, graphqlTsSchema.Arg<any>>,
  TType extends OutputType,
  Key extends string
> = graphqlTsSchema.Field<RootVal, Args, TType, Key, Context>;
export type FieldResolver<
  RootVal,
  Args extends Record<string, graphqlTsSchema.Arg<any>>,
  TType extends OutputType
> = graphqlTsSchema.FieldResolver<RootVal, Args, TType, Context>;
export type ObjectType<RootVal> = graphqlTsSchema.ObjectType<RootVal, Context>;
export type UnionType<RootVal> = graphqlTsSchema.UnionType<RootVal, Context>;
export type InterfaceType<
  RootVal,
  Fields extends Record<string, graphqlTsSchema.InterfaceField<any, OutputType, Context>>
> = graphqlTsSchema.InterfaceType<RootVal, Fields, Context>;
export type InterfaceField<
  Args extends Record<string, graphqlTsSchema.Arg<any>>,
  TType extends OutputType
> = graphqlTsSchema.InterfaceField<Args, TType, Context>;
