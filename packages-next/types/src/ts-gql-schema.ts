import * as tsgqlSchema from '@ts-gql/schema';
import { GraphQLJSON } from 'graphql-type-json';
// this is imported from a specific path so that we don't import busboy here because webpack doesn't like bundling it
// @ts-ignore
import GraphQLUpload from 'graphql-upload/public/GraphQLUpload.js';
import type { FileUpload } from 'graphql-upload';
import { KeystoneContext } from './context';
import { JSONValue } from './utils';
export * from '@ts-gql/schema/types-without-context';

export type Context = KeystoneContext;

export const bindTypesToContext = tsgqlSchema.bindTypesToContext;

const types = tsgqlSchema.bindTypesToContext<Context>();

export const { fields, interfaceField, object, union, field } = types;

export const JSON = tsgqlSchema.types.scalar<JSONValue>(GraphQLJSON);
export const Upload = tsgqlSchema.types.scalar<Promise<FileUpload>>(GraphQLUpload);

const interfaceType = types.interface;
export { interfaceType as interface };

export type NullableType = tsgqlSchema.NullableType<Context>;
export type Type = tsgqlSchema.Type<Context>;
export type NullableOutputType = tsgqlSchema.NullableOutputType<Context>;
export type OutputType = tsgqlSchema.OutputType<Context>;
export type Field<
  RootVal,
  Args extends Record<string, tsgqlSchema.Arg<any>>,
  TType extends OutputType,
  Key extends string
> = tsgqlSchema.Field<RootVal, Args, TType, Key, Context>;
export type FieldResolver<
  RootVal,
  Args extends Record<string, tsgqlSchema.Arg<any>>,
  TType extends OutputType
> = tsgqlSchema.FieldResolver<RootVal, Args, TType, Context>;
export type ObjectType<RootVal> = tsgqlSchema.ObjectType<RootVal, Context>;
export type UnionType<RootVal> = tsgqlSchema.UnionType<RootVal, Context>;
export type InterfaceType<
  RootVal,
  Fields extends Record<string, tsgqlSchema.InterfaceField<any, OutputType, Context>>
> = tsgqlSchema.InterfaceType<RootVal, Fields, Context>;
export type InterfaceField<
  Args extends Record<string, tsgqlSchema.Arg<any>>,
  TType extends OutputType
> = tsgqlSchema.InterfaceField<Args, TType, Context>;
