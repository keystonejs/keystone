import * as graphqlTsSchema from '@graphql-ts/schema';
import { KeystoneContext } from '../context';
export * from './api-without-context';
export { field, fields, interface, interfaceField, object, union } from './api-with-context';

export type Context = KeystoneContext;

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
