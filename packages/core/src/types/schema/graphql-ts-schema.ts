import type * as graphqlTsSchema from '@graphql-ts/schema'
import type { GraphQLFieldExtensions, GraphQLResolveInfo } from 'graphql'
import type { KeystoneContext } from '../context'
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
export { extend } from '@graphql-ts/extend'
export { fields, interface, interfaceField, object, union } from './schema-api-with-context'
export { BigInt, CalendarDay, DateTime, Decimal, Empty, Hex, JSON, Upload } from './scalars'
// TODO: remove when we use { graphql } from '.keystone'
type SomeTypeThatIsntARecordOfArgs = string

type ImpliedResolver<
  Args extends { [Key in keyof Args]: graphqlTsSchema.Arg<graphqlTsSchema.InputType> },
  Type extends OutputType<Context>,
  Context extends KeystoneContext<any>,
> =
  | graphqlTsSchema.InferValueFromOutputType<Type>
  | ((
      args: graphqlTsSchema.InferValueFromArgs<Args>,
      context: Context,
      info: GraphQLResolveInfo
    ) => graphqlTsSchema.InferValueFromOutputType<Type>)

export const field: <
  Source,
  Type extends OutputType<Context>,
  Resolve extends
    | undefined
    | ((
        source: Source,
        args: graphqlTsSchema.InferValueFromArgs<
          SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args
        >,
        context: Context,
        info: GraphQLResolveInfo
      ) => graphqlTsSchema.InferValueFromOutputType<Type>),
  Context extends KeystoneContext<any>,
  Args extends { [Key in keyof Args]: graphqlTsSchema.Arg<graphqlTsSchema.InputType> } = {},
>(
  field: {
    args?: Args
    type: Type
    deprecationReason?: string
    description?: string
    extensions?: Readonly<GraphQLFieldExtensions<Source, unknown>>
  } & (Resolve extends {}
    ? {
        resolve: ((
          source: Source,
          args: graphqlTsSchema.InferValueFromArgs<
            SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args
          >,
          context: Context,
          info: GraphQLResolveInfo
        ) => graphqlTsSchema.InferValueFromOutputType<Type>) &
          Resolve
      }
    : {
        resolve?: ((
          source: Source,
          args: graphqlTsSchema.InferValueFromArgs<
            SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args
          >,
          context: Context,
          info: GraphQLResolveInfo
        ) => graphqlTsSchema.InferValueFromOutputType<Type>) &
          Resolve
      })
) => Field<
  Source,
  Args,
  Type,
  undefined extends Resolve ? ImpliedResolver<Args, Type, Context> : unknown,
  Context
> = fieldd as any
// TODO: remove when we use { graphql } from '.keystone'

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
  SourceAtKey,
  Context extends KeystoneContext = KeystoneContext,
> = graphqlTsSchema.Field<Source, Args, TType, SourceAtKey, Context>
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
