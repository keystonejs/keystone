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
export { BigInt, CalendarDay, DateTime, Decimal, Empty, Hex, JSON, Upload } from './scalars'
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
