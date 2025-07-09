import Decimal from 'decimal.js'
import { g } from '../types/schema'
import type { BaseListTypeInfo } from './type-info'
import type { BaseFieldTypeInfo, CommonFieldConfig } from './config'
import type { DatabaseProvider } from './core'
import type {
  GArg,
  GInputType,
  GNullableInputType,
  InferValueFromArg,
  GField,
  GOutputType,
  GInputObjectType,
  GList,
  GNonNull,
  InferValueFromArgs,
  GObjectType,
  InferValueFromInputType,
} from '@graphql-ts/schema'
import type { JSONValue, KeystoneContext, MaybePromise } from '.'
import type { filters } from '../fields/filters'

export { Decimal }

export type BaseItem = { id: { toString(): string }; [key: string]: unknown }

export type ListGraphQLTypes<ListTypeInfo extends BaseListTypeInfo> = {
  types: GraphQLTypesForList<ListTypeInfo>
}

export type FieldData<ListTypeInfo extends BaseListTypeInfo = BaseListTypeInfo> = {
  lists: {
    [Key in keyof ListTypeInfo['all']['lists']]: ListGraphQLTypes<ListTypeInfo['all']['lists'][Key]>
  }
  provider: DatabaseProvider
  listKey: ListTypeInfo['key']
  fieldKey: string
}

type ScalarNames = Exclude<keyof (typeof filters)[DatabaseProvider], 'enum'>

export type SimpleFieldTypeInfo<Scalar extends ScalarNames> = {
  item: ScalarPrismaTypes[Scalar] | null
  inputs: {
    create: ScalarPrismaTypes[Scalar] | null | undefined
    update: ScalarPrismaTypes[Scalar] | null | undefined
    where: InferValueFromInputType<(typeof filters)[DatabaseProvider][Scalar]['required']> | null
    uniqueWhere: ScalarPrismaTypes[Scalar] | null | undefined
    orderBy: 'asc' | 'desc' | null
  }
  prisma: {
    create:
      | ScalarPrismaTypes[Scalar]
      | { set?: ScalarPrismaTypes[Scalar] | null }
      | null
      | undefined
    update:
      | ScalarPrismaTypes[Scalar]
      | { set?: ScalarPrismaTypes[Scalar] | null }
      | null
      | undefined
  }
}

export type FieldTypeFunc<ListTypeInfo extends BaseListTypeInfo> = (
  data: FieldData<ListTypeInfo>
) => NextFieldType<
  DBField,
  GArg<GInputType> | undefined,
  GArg<GInputType>,
  GArg<GNullableInputType, false>,
  GArg<GNullableInputType, false>,
  GArg<GNullableInputType, false>,
  ListTypeInfo
>

export type NextFieldType<
  TDBField extends DBField = DBField,
  CreateArg extends GArg<GInputType> | undefined = GArg<GInputType> | undefined,
  UpdateArg extends GArg<GInputType> = GArg<GInputType>,
  UniqueWhereArg extends GArg<GNullableInputType, false> = GArg<GNullableInputType, false>,
  OrderByArg extends GArg<GNullableInputType, false> = GArg<GNullableInputType, false>,
  FilterArg extends GArg<GNullableInputType, false> = GArg<GNullableInputType, false>,
  ListTypeInfo extends BaseListTypeInfo = BaseListTypeInfo,
> = {
  dbField: TDBField
} & FieldTypeWithoutDBField<
  TDBField,
  CreateArg,
  UpdateArg,
  UniqueWhereArg,
  OrderByArg,
  FilterArg,
  ListTypeInfo
>

export type ScalarPrismaTypes = {
  String: string
  Boolean: boolean
  Int: number
  Float: number
  DateTime: Date
  BigInt: bigint
  Json: JSONValue
  Decimal: Decimal
  Bytes: Uint8Array
}

type Literal<T> = {
  kind: 'literal'
  value: T
}

export type ScalarDBFieldDefault<
  Scalar extends keyof ScalarPrismaTypes = keyof ScalarPrismaTypes,
  Mode extends 'required' | 'many' | 'optional' = 'required' | 'many' | 'optional',
> = Mode extends 'many'
  ? never
  :
      | {
          String:
            | Literal<string>
            | { kind: 'uuid'; version?: 4 | 7 }
            | { kind: 'cuid'; version?: 1 | 2 }
            | { kind: 'ulid' }
            | { kind: 'nanoid'; length?: number }
            | { kind: 'random'; bytes: number; encoding: 'hex' | 'base64url' }
          Boolean: Literal<boolean>
          Json: Literal<string>
          Float: Literal<number>
          Int: Literal<number> | { kind: 'autoincrement' }
          BigInt: Literal<bigint> | { kind: 'autoincrement' }
          DateTime: Literal<string> | { kind: 'now' }
          Decimal: Literal<string>
          Bytes: Literal<Uint8Array>
        }[Scalar]
      | { kind: 'dbgenerated'; value: string }

export type ScalarDBField<
  Scalar extends keyof ScalarPrismaTypes,
  Mode extends 'required' | 'many' | 'optional',
> = {
  kind: 'scalar'
  scalar: Scalar
  mode: Mode
  default?: ScalarDBFieldDefault<Scalar, Mode> | undefined
  extendPrismaSchema?: (field: string) => string
  index?: 'unique' | 'index' | undefined

  map?: string
  nativeType?: string
  updatedAt?: Scalar extends 'DateTime' ? boolean : never
}

export type RelationDBField<Mode extends 'many' | 'one'> = {
  kind: 'relation'
  mode: Mode
  extendPrismaSchema?: (field: string) => string

  list: string
  field?: string
  foreignKey?: { one: true | { map: string }; many: undefined }[Mode]
  relationName?: { one: undefined; many: string }[Mode]
}

export type EnumDBField<Value extends string, Mode extends 'required' | 'many' | 'optional'> = {
  kind: 'enum'
  name: string
  mode: Mode
  default?: { kind: 'literal'; value: Value }
  extendPrismaSchema?: (field: string) => string
  index?: 'unique' | 'index'

  map?: string
  values: readonly Value[]
}

export const orderDirectionEnum = g.enum({
  name: 'OrderDirection',
  values: g.enumValues(['asc', 'desc']),
})

export const QueryMode = g.enum({
  name: 'QueryMode',
  values: g.enumValues(['default', 'insensitive']),
})

export type NoDBField = { kind: 'none' }

// TODO: merge
export type ScalarishDBField =
  | ScalarDBField<keyof ScalarPrismaTypes, 'required' | 'many' | 'optional'>
  | EnumDBField<string, 'required' | 'many' | 'optional'>

export type RealDBField = ScalarishDBField | RelationDBField<'many' | 'one'>

export type MultiDBField<Fields extends Record<string, ScalarishDBField>> = {
  kind: 'multi'
  fields: Fields
  extendPrismaSchema?: (field: string) => string
}

export type DBField = RealDBField | NoDBField | MultiDBField<Record<string, ScalarishDBField>>

// TODO: this isn't right for create
// for create though, db level defaults need to be taken into account for when to not allow undefined
type DBFieldToInputValue<TDBField extends DBField> =
  TDBField extends ScalarDBField<infer Scalar, infer Mode>
    ? {
        optional: ScalarPrismaTypes[Scalar] | null | undefined
        required: ScalarPrismaTypes[Scalar] | undefined
        many: readonly ScalarPrismaTypes[Scalar][] | undefined
      }[Mode]
    : TDBField extends RelationDBField<'many' | 'one'>
      ? { connect?: object; disconnect?: boolean } | undefined
      : TDBField extends EnumDBField<infer Value, infer Mode>
        ? {
            optional: Value | null | undefined
            required: Value | undefined
            many: readonly Value[] | undefined
          }[Mode]
        : TDBField extends NoDBField
          ? undefined
          : TDBField extends MultiDBField<infer Fields>
            ? // note: this is very intentionally not optional and DBFieldToInputValue will add | undefined to force people to explicitly show what they are not setting
              { [Key in keyof Fields]: DBFieldToInputValue<Fields[Key]> }
            : never

type DBFieldUniqueWhere<TDBField extends DBField> =
  TDBField extends ScalarDBField<infer Scalar, 'optional' | 'required'>
    ? Scalar extends 'String' | 'Int'
      ? {
          String: string
          Int: number
        }[Scalar]
      : any
    : any

type DBFieldToOutputValue<TDBField extends DBField> =
  TDBField extends ScalarDBField<infer Scalar, infer Mode>
    ? {
        optional: ScalarPrismaTypes[Scalar] | null
        required: ScalarPrismaTypes[Scalar]
        many: readonly ScalarPrismaTypes[Scalar][]
      }[Mode]
    : TDBField extends RelationDBField<infer Mode>
      ? {
          one: () => Promise<BaseItem>
          many: {
            findMany(args: FindManyArgsValue): Promise<BaseItem[]>
            count(args: { where: FindManyArgsValue['where'] }): Promise<number>
          }
        }[Mode]
      : TDBField extends EnumDBField<infer Value, infer Mode>
        ? {
            optional: Value | null
            required: Value
            many: readonly Value[]
          }[Mode]
        : TDBField extends NoDBField
          ? undefined
          : TDBField extends MultiDBField<infer Fields>
            ? { [Key in keyof Fields]: DBFieldToOutputValue<Fields[Key]> }
            : never

export type OrderByFieldInputArg<Val, TArg extends GArg<GNullableInputType>> = {
  arg: TArg
} & ResolveFunc<
  (
    value: Exclude<InferValueFromArg<TArg>, null | undefined>,
    context: KeystoneContext
  ) => MaybePromise<Val>
>

type FieldInputResolver<Input, Output, RelationshipInputResolver> = (
  value: Input,
  context: KeystoneContext,
  relationshipInputResolver: RelationshipInputResolver
) => MaybePromise<Output>

type DBFieldFiltersInner<TDBField extends DBField> = Record<string, any>

type DBFieldFilters<TDBField extends DBField> =
  | ({
      AND?: DBFieldFiltersInner<TDBField>
      OR?: DBFieldFiltersInner<TDBField>
      NOT?: DBFieldFiltersInner<TDBField>
    } & DBFieldFiltersInner<TDBField>)
  | null

export type WhereFieldInputArg<TDBField extends DBField, TArg extends GArg<GInputType, any>> = {
  arg: TArg
} & ResolveFunc<
  FieldInputResolver<
    Exclude<InferValueFromArg<TArg>, undefined>,
    DBFieldFilters<TDBField>,
    any
    // i think this is broken because variance?
    // TDBField extends RelationDBField<infer Mode>
    //   ? (
    //       input: {
    //         many: types.InferValueFromArg<types.Arg<TypesForList['manyRelationWhere']>>;
    //         one: types.InferValueFromArg<types.Arg<TypesForList['where']>>;
    //       }[Mode]
    //     ) => Promise<any>
    //   : undefined
  >
>

export type UpdateFieldInputArg<TDBField extends DBField, TArg extends GArg<GInputType, any>> = {
  arg: TArg
} & ResolveFunc<
  FieldInputResolver<
    InferValueFromArg<TArg>,
    DBFieldToInputValue<TDBField>,
    any
    // i think this is broken because variance?
    // TDBField extends RelationDBField<infer Mode>
    //   ? (
    //       input: graphql.InferValueFromArg<graphql.Arg<TypesForList['relateTo'][Mode]['create']>>
    //     ) => Promise<any>
    //   : undefined
  >
>

type CreateFieldInputResolver<Input, TDBField extends DBField> = FieldInputResolver<
  Input,
  DBFieldToInputValue<TDBField>,
  any
  // i think this is broken because variance?
  // TDBField extends RelationDBField<infer Mode>
  //   ? (
  //       input: graphql.InferValueFromArg<graphql.Arg<TypesForList['relateTo'][Mode]['create']>>
  //     ) => Promise<any>
  //   : undefined
>

export type CreateFieldInputArg<
  TDBField extends DBField,
  TArg extends GArg<GInputType, any> | undefined,
> = {
  arg: TArg
} & (TArg extends GArg<GInputType, any>
  ? InferValueFromArg<TArg> extends DBFieldToInputValue<TDBField>
    ? {
        resolve?: CreateFieldInputResolver<InferValueFromArg<TArg>, TDBField>
      }
    : {
        resolve: CreateFieldInputResolver<InferValueFromArg<TArg>, TDBField>
      }
  : {
      resolve: CreateFieldInputResolver<undefined, TDBField>
    })

type UnwrapMaybePromise<T> = T extends Promise<infer Resolved> ? Resolved : T

type ResolveFunc<Func extends (firstArg: any, ...args: any[]) => any> =
  Parameters<Func>[0] extends UnwrapMaybePromise<ReturnType<Func>>
    ? { resolve?: Func }
    : { resolve: Func }

export type UniqueWhereFieldInputArg<Val, TArg extends GArg<GInputType>> = {
  arg: TArg
} & ResolveFunc<
  (
    value: Exclude<InferValueFromArg<TArg>, undefined | null>,
    context: KeystoneContext
  ) => MaybePromise<Val>
>

type FieldTypeOutputField<TDBField extends DBField> = GField<
  { value: DBFieldToOutputValue<TDBField>; item: BaseItem },
  any,
  GOutputType<KeystoneContext>,
  DBFieldToOutputValue<TDBField>,
  KeystoneContext
>

export type OrderDirection = 'asc' | 'desc'

type DBFieldToOrderByValue<TDBField extends DBField> = TDBField extends ScalarishDBField
  ? OrderDirection | undefined
  : TDBField extends MultiDBField<infer Fields>
    ? { [Key in keyof Fields]: DBFieldToOrderByValue<Fields[Key]> }
    : undefined

export type FieldTypeWithoutDBField<
  TDBField extends DBField = DBField,
  CreateArg extends GArg<GInputType> | undefined = GArg<GInputType> | undefined,
  UpdateArg extends GArg<GInputType> = GArg<GInputType>,
  UniqueWhereArg extends GArg<GNullableInputType, false> = GArg<GNullableInputType, false>,
  OrderByArg extends GArg<GNullableInputType, false> = GArg<GNullableInputType, false>,
  FilterArg extends GArg<GNullableInputType, false> = GArg<GNullableInputType, false>,
  ListTypeInfo extends BaseListTypeInfo = BaseListTypeInfo,
  FieldTypeInfo extends BaseFieldTypeInfo = BaseFieldTypeInfo,
> = {
  input?: {
    uniqueWhere?: UniqueWhereFieldInputArg<DBFieldUniqueWhere<TDBField>, UniqueWhereArg>
    where?: WhereFieldInputArg<TDBField, FilterArg>
    create?: CreateFieldInputArg<TDBField, CreateArg>
    update?: UpdateFieldInputArg<TDBField, UpdateArg>
    orderBy?: OrderByFieldInputArg<DBFieldToOrderByValue<TDBField>, OrderByArg>
  }
  output: FieldTypeOutputField<TDBField>
  views: string
  extraOutputFields?: Record<string, FieldTypeOutputField<TDBField>>
  getAdminMeta?: () => JSONValue
  unreferencedConcreteInterfaceImplementations?: readonly g<typeof g.object<any>>[]
  __ksTelemetryFieldTypeName?: string
} & CommonFieldConfig<ListTypeInfo, FieldTypeInfo>

type AnyInputObj = GInputObjectType<Record<string, GArg<GInputType>>>

export type GraphQLTypesForList<ListTypeInfo extends BaseListTypeInfo = BaseListTypeInfo> = {
  create: AnyInputObj | typeof g.Empty
  update: AnyInputObj | typeof g.Empty
  uniqueWhere: GInputObjectType<{
    id: GArg<typeof g.ID>
    [key: string]: GArg<GNullableInputType>
  }>
  where: AnyInputObj
  orderBy: AnyInputObj
  output: GObjectType<ListTypeInfo['item'], KeystoneContext<ListTypeInfo['all']>>
  findManyArgs: FindManyArgs
  relateTo: {
    one: {
      create: GInputObjectType<{
        create?: GArg<GraphQLTypesForList<ListTypeInfo>['create']>
        connect: GArg<GraphQLTypesForList<ListTypeInfo>['uniqueWhere']>
      }>
      update: GInputObjectType<{
        create?: GArg<GraphQLTypesForList<ListTypeInfo>['create']>
        connect: GArg<GraphQLTypesForList<ListTypeInfo>['uniqueWhere']>
        disconnect: GArg<typeof g.Boolean>
      }>
    }
    many: {
      where: GInputObjectType<{
        every: GArg<AnyInputObj>
        some: GArg<AnyInputObj>
        none: GArg<AnyInputObj>
      }>
      create: GInputObjectType<{
        create?: GArg<GList<GNonNull<GraphQLTypesForList<ListTypeInfo>['create']>>>
        connect: GArg<GList<GNonNull<GraphQLTypesForList<ListTypeInfo>['uniqueWhere']>>>
        set: GArg<GList<GNonNull<GraphQLTypesForList<ListTypeInfo>['uniqueWhere']>>>
      }>
      update: GInputObjectType<{
        create?: GArg<GList<GNonNull<GraphQLTypesForList<ListTypeInfo>['create']>>>
        connect: GArg<GList<GNonNull<GraphQLTypesForList<ListTypeInfo>['uniqueWhere']>>>
        disconnect: GArg<GList<GNonNull<GraphQLTypesForList<ListTypeInfo>['uniqueWhere']>>>
        set: GArg<GList<GNonNull<GraphQLTypesForList<ListTypeInfo>['uniqueWhere']>>>
      }>
    }
  }
}

export type FindManyArgs = {
  where: GArg<GNonNull<GraphQLTypesForList['where']>, true>
  orderBy: GArg<GNonNull<GList<GNonNull<GraphQLTypesForList['orderBy']>>>, true>
  take: GArg<typeof g.Int>
  skip: GArg<GNonNull<typeof g.Int>, true>
  cursor: GArg<GraphQLTypesForList['uniqueWhere']>
}

export type FindManyArgsValue = InferValueFromArgs<FindManyArgs>

// fieldType(dbField)(fieldInfo) => { ...fieldInfo, dbField };
export function fieldType<TDBField extends DBField, ListTypeInfo extends BaseListTypeInfo>(
  dbField: TDBField
) {
  return function fieldTypeWrapper<
    CreateArg extends GArg<GInputType> | undefined,
    UpdateArg extends GArg<GInputType>,
    UniqueWhereArg extends GArg<GNullableInputType, false>,
    OrderByArg extends GArg<GNullableInputType, false>,
    FilterArg extends GArg<GNullableInputType, false>,
  >(
    graphQLInfo: FieldTypeWithoutDBField<
      TDBField,
      CreateArg,
      UpdateArg,
      UniqueWhereArg,
      OrderByArg,
      FilterArg,
      ListTypeInfo
    >
  ): NextFieldType<
    DBField,
    GArg<GInputType> | undefined,
    GArg<GInputType>,
    GArg<GNullableInputType, false>,
    GArg<GNullableInputType, false>,
    GArg<GNullableInputType, false>,
    any
  > {
    return { ...graphQLInfo, dbField } as any
  }
}
