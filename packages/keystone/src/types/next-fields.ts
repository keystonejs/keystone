import Decimal from 'decimal.js';
import { BaseGeneratedListTypes } from './utils';
import { CommonFieldConfig } from './config';
import { DatabaseProvider, FieldDefaultValue } from './core';
import { graphql } from './schema';
import { AdminMetaRootVal, JSONValue, KeystoneContext, MaybePromise } from '.';

export { Decimal };

export type ItemRootValue = { id: { toString(): string }; [key: string]: unknown };

export type MaybeFunction<Params extends any[], Ret> = Ret | ((...params: Params) => Ret);

export type ListInfo = { types: TypesForList };

export type FieldData = {
  lists: Record<string, ListInfo>;
  provider: DatabaseProvider;
  listKey: string;
  fieldKey: string;
};

export type FieldTypeFunc = (data: FieldData) => NextFieldType;

export type NextFieldType<
  TDBField extends DBField = DBField,
  CreateArg extends graphql.Arg<graphql.InputType> | undefined =
    | graphql.Arg<graphql.InputType>
    | undefined,
  UpdateArg extends graphql.Arg<graphql.InputType> = graphql.Arg<graphql.InputType>,
  UniqueWhereArg extends graphql.Arg<graphql.NullableInputType, false> = graphql.Arg<
    graphql.NullableInputType,
    false
  >,
  OrderByArg extends graphql.Arg<graphql.NullableInputType, false> = graphql.Arg<
    graphql.NullableInputType,
    false
  >,
  FilterArg extends graphql.Arg<graphql.NullableInputType, false> = graphql.Arg<
    graphql.NullableInputType,
    false
  >
> = {
  dbField: TDBField;
} & FieldTypeWithoutDBField<TDBField, CreateArg, UpdateArg, UniqueWhereArg, OrderByArg, FilterArg>;

type ScalarPrismaTypes = {
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: Date;
  BigInt: bigint;
  Json: JSONValue;
  Decimal: Decimal;
};

type NumberLiteralDefault = { kind: 'literal'; value: number };
type BigIntLiteralDefault = { kind: 'literal'; value: bigint };
type BooleanLiteralDefault = { kind: 'literal'; value: boolean };
type StringLiteralDefault = { kind: 'literal'; value: string };
// https://github.com/prisma/prisma-engines/blob/98490f4bb05f4a47cd715617154a06c2c0d05756/libs/datamodel/connectors/dml/src/default_value.rs#L183-L194
type DBGeneratedDefault = { kind: 'dbgenerated'; value: string };
type AutoIncrementDefault = { kind: 'autoincrement' };
type NowDefault = { kind: 'now' };
type UuidDefault = { kind: 'uuid' };
type CuidDefault = { kind: 'cuid' };
export type ScalarDBFieldDefault<
  Scalar extends keyof ScalarPrismaTypes = keyof ScalarPrismaTypes,
  Mode extends 'required' | 'many' | 'optional' = 'required' | 'many' | 'optional'
> = Mode extends 'many'
  ? never
  :
      | {
          String: StringLiteralDefault | UuidDefault | CuidDefault;
          Boolean: BooleanLiteralDefault;
          Json: StringLiteralDefault;
          Float: NumberLiteralDefault;
          Int: AutoIncrementDefault | NumberLiteralDefault;
          BigInt: AutoIncrementDefault | BigIntLiteralDefault;
          DateTime: NowDefault | StringLiteralDefault;
          Decimal: StringLiteralDefault;
        }[Scalar]
      | DBGeneratedDefault;

export type ScalarDBField<
  Scalar extends keyof ScalarPrismaTypes,
  Mode extends 'required' | 'many' | 'optional'
> = {
  kind: 'scalar';
  scalar: Scalar;
  mode: Mode;
  /**
   * The native database type that the field should use. See https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#model-field-scalar-types for what the possible native types should be
   * The native type should not include @datasourcename. so to specify the uuid type, the correct value for nativeType would be `Uuid`
   */
  nativeType?: string;
  default?: ScalarDBFieldDefault<Scalar, Mode>;
  index?: 'unique' | 'index';
};

export const orderDirectionEnum = graphql.enum({
  name: 'OrderDirection',
  values: graphql.enumValues(['asc', 'desc']),
});

export const QueryMode = graphql.enum({
  name: 'QueryMode',
  values: graphql.enumValues(['default', 'insensitive']),
});

export type RelationDBField<Mode extends 'many' | 'one'> = {
  kind: 'relation';
  list: string;
  field?: string;
  mode: Mode;
};

export type EnumDBField<Value extends string, Mode extends 'required' | 'many' | 'optional'> = {
  kind: 'enum';
  name: string;
  values: Value[];
  mode: Mode;
  default?: Value;
  index?: 'unique' | 'index';
};

export type NoDBField = { kind: 'none' };

export type ScalarishDBField =
  | ScalarDBField<keyof ScalarPrismaTypes, 'required' | 'many' | 'optional'>
  | EnumDBField<string, 'required' | 'many' | 'optional'>;

export type RealDBField = ScalarishDBField | RelationDBField<'many' | 'one'>;

export type MultiDBField<Fields extends Record<string, ScalarishDBField>> = {
  kind: 'multi';
  fields: Fields;
};

export type DBField = RealDBField | NoDBField | MultiDBField<Record<string, ScalarishDBField>>;

// TODO: this isn't right for create
// for create though, db level defaults need to be taken into account for when to not allow undefined
type DBFieldToInputValue<TDBField extends DBField> = TDBField extends ScalarDBField<
  infer Scalar,
  infer Mode
>
  ? {
      optional: ScalarPrismaTypes[Scalar] | null | undefined;
      required: ScalarPrismaTypes[Scalar] | undefined;
      many: ScalarPrismaTypes[Scalar][] | undefined;
    }[Mode]
  : TDBField extends RelationDBField<'many' | 'one'>
  ? { connect?: {}; disconnect?: boolean } | undefined
  : TDBField extends EnumDBField<infer Value, infer Mode>
  ? {
      optional: Value | null | undefined;
      required: Value | undefined;
      many: Value[] | undefined;
    }[Mode]
  : TDBField extends NoDBField
  ? undefined
  : TDBField extends MultiDBField<infer Fields>
  ? // note: this is very intentionally not optional and DBFieldToInputValue will add | undefined to force people to explicitly show what they are not setting
    { [Key in keyof Fields]: DBFieldToInputValue<Fields[Key]> }
  : never;

type DBFieldUniqueWhere<TDBField extends DBField> = TDBField extends ScalarDBField<
  infer Scalar,
  'optional' | 'required'
>
  ? Scalar extends 'String' | 'Int'
    ? {
        String: string;
        Int: number;
      }[Scalar]
    : any
  : any;

type DBFieldToOutputValue<TDBField extends DBField> = TDBField extends ScalarDBField<
  infer Scalar,
  infer Mode
>
  ? {
      optional: ScalarPrismaTypes[Scalar] | null;
      required: ScalarPrismaTypes[Scalar];
      many: ScalarPrismaTypes[Scalar][];
    }[Mode]
  : TDBField extends RelationDBField<infer Mode>
  ? {
      one: () => Promise<ItemRootValue>;
      many: {
        findMany(args: FindManyArgsValue): Promise<ItemRootValue[]>;
        count(args: { where: FindManyArgsValue['where'] }): Promise<number>;
      };
    }[Mode]
  : TDBField extends EnumDBField<infer Value, infer Mode>
  ? {
      optional: Value | null;
      required: Value;
      many: Value[];
    }[Mode]
  : TDBField extends NoDBField
  ? undefined
  : TDBField extends MultiDBField<infer Fields>
  ? { [Key in keyof Fields]: DBFieldToOutputValue<Fields[Key]> }
  : never;

export type OrderByFieldInputArg<Val, TArg extends graphql.Arg<graphql.NullableInputType>> = {
  arg: TArg;
} & ResolveFunc<
  (
    value: Exclude<graphql.InferValueFromArg<TArg>, null | undefined>,
    context: KeystoneContext
  ) => MaybePromise<Val>
>;

type FieldInputResolver<Input, Output, RelationshipInputResolver> = (
  value: Input,
  context: KeystoneContext,
  relationshipInputResolver: RelationshipInputResolver
) => MaybePromise<Output>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type DBFieldFiltersInner<TDBField extends DBField> = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type DBFieldFilters<TDBField extends DBField> =
  | ({
      AND?: DBFieldFiltersInner<TDBField>;
      OR?: DBFieldFiltersInner<TDBField>;
      NOT?: DBFieldFiltersInner<TDBField>;
    } & DBFieldFiltersInner<TDBField>)
  | null;

export type WhereFieldInputArg<
  TDBField extends DBField,
  TArg extends graphql.Arg<graphql.InputType, any>
> = {
  arg: TArg;
} & ResolveFunc<
  FieldInputResolver<
    Exclude<graphql.InferValueFromArg<TArg>, undefined>,
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
>;

export type UpdateFieldInputArg<
  TDBField extends DBField,
  TArg extends graphql.Arg<graphql.InputType, any>
> = {
  arg: TArg;
} & ResolveFunc<
  FieldInputResolver<
    graphql.InferValueFromArg<TArg>,
    DBFieldToInputValue<TDBField>,
    any
    // i think this is broken because variance?
    // TDBField extends RelationDBField<infer Mode>
    //   ? (
    //       input: graphql.InferValueFromArg<graphql.Arg<TypesForList['relateTo'][Mode]['create']>>
    //     ) => Promise<any>
    //   : undefined
  >
>;

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
>;

export type CreateFieldInputArg<
  TDBField extends DBField,
  TArg extends graphql.Arg<graphql.InputType, any> | undefined
> = {
  arg: TArg;
} & (TArg extends graphql.Arg<graphql.InputType, any>
  ? graphql.InferValueFromArg<TArg> extends DBFieldToInputValue<TDBField>
    ? {
        resolve?: CreateFieldInputResolver<graphql.InferValueFromArg<TArg>, TDBField>;
      }
    : {
        resolve: CreateFieldInputResolver<graphql.InferValueFromArg<TArg>, TDBField>;
      }
  : {
      resolve: CreateFieldInputResolver<undefined, TDBField>;
    });

type UnwrapMaybePromise<T> = T extends Promise<infer Resolved> ? Resolved : T;

type ResolveFunc<Func extends (firstArg: any, ...args: any[]) => any> =
  Parameters<Func>[0] extends UnwrapMaybePromise<ReturnType<Func>>
    ? { resolve?: Func }
    : { resolve: Func };

export type UniqueWhereFieldInputArg<Val, TArg extends graphql.Arg<graphql.InputType>> = {
  arg: TArg;
} & ResolveFunc<
  (
    value: Exclude<graphql.InferValueFromArg<TArg>, undefined | null>,
    context: KeystoneContext
  ) => MaybePromise<Val>
>;

type FieldTypeOutputField<TDBField extends DBField> = graphql.Field<
  { value: DBFieldToOutputValue<TDBField>; item: ItemRootValue },
  any,
  graphql.OutputType,
  'value'
>;

export type OrderDirection = 'asc' | 'desc';

type DBFieldToOrderByValue<TDBField extends DBField> = TDBField extends ScalarishDBField
  ? OrderDirection | undefined
  : TDBField extends MultiDBField<infer Fields>
  ? { [Key in keyof Fields]: DBFieldToOrderByValue<Fields[Key]> }
  : undefined;

export type FieldTypeWithoutDBField<
  TDBField extends DBField = DBField,
  CreateArg extends graphql.Arg<graphql.InputType> | undefined =
    | graphql.Arg<graphql.InputType>
    | undefined,
  UpdateArg extends graphql.Arg<graphql.InputType> = graphql.Arg<graphql.InputType>,
  UniqueWhereArg extends graphql.Arg<graphql.NullableInputType, false> = graphql.Arg<
    graphql.NullableInputType,
    false
  >,
  OrderByArg extends graphql.Arg<graphql.NullableInputType, false> = graphql.Arg<
    graphql.NullableInputType,
    false
  >,
  FilterArg extends graphql.Arg<graphql.NullableInputType, false> = graphql.Arg<
    graphql.NullableInputType,
    false
  >
> = {
  input?: {
    uniqueWhere?: UniqueWhereFieldInputArg<DBFieldUniqueWhere<TDBField>, UniqueWhereArg>;
    where?: WhereFieldInputArg<TDBField, FilterArg>;
    create?: CreateFieldInputArg<TDBField, CreateArg>;
    update?: UpdateFieldInputArg<TDBField, UpdateArg>;
    orderBy?: OrderByFieldInputArg<DBFieldToOrderByValue<TDBField>, OrderByArg>;
  };
  output: FieldTypeOutputField<TDBField>;
  views: string;
  extraOutputFields?: Record<string, FieldTypeOutputField<TDBField>>;
  getAdminMeta?: (adminMeta: AdminMetaRootVal) => JSONValue;
  unreferencedConcreteInterfaceImplementations?: graphql.ObjectType<any>[];
  __legacy?: {
    isRequired?: boolean;
    defaultValue?: FieldDefaultValue<any, BaseGeneratedListTypes>;
  };
} & CommonFieldConfig<BaseGeneratedListTypes>;

type AnyInputObj = graphql.InputObjectType<Record<string, graphql.Arg<graphql.InputType, any>>>;

export type TypesForList = {
  update: AnyInputObj;
  create: AnyInputObj;
  uniqueWhere: AnyInputObj;
  where: AnyInputObj;
  orderBy: AnyInputObj;
  output: graphql.ObjectType<ItemRootValue>;
  findManyArgs: FindManyArgs;
  relateTo: {
    many: {
      where: graphql.InputObjectType<{
        every: graphql.Arg<AnyInputObj>;
        some: graphql.Arg<AnyInputObj>;
        none: graphql.Arg<AnyInputObj>;
      }>;
      create?: graphql.InputObjectType<{
        connect: graphql.Arg<graphql.ListType<graphql.NonNullType<TypesForList['uniqueWhere']>>>;
        create?: graphql.Arg<graphql.ListType<graphql.NonNullType<TypesForList['create']>>>;
      }>;
      update?: graphql.InputObjectType<{
        disconnect: graphql.Arg<graphql.ListType<graphql.NonNullType<TypesForList['uniqueWhere']>>>;
        set: graphql.Arg<graphql.ListType<graphql.NonNullType<TypesForList['uniqueWhere']>>>;
        connect: graphql.Arg<graphql.ListType<graphql.NonNullType<TypesForList['uniqueWhere']>>>;
        create?: graphql.Arg<graphql.ListType<graphql.NonNullType<TypesForList['create']>>>;
      }>;
    };
    one: {
      create?: graphql.InputObjectType<{
        create?: graphql.Arg<TypesForList['create']>;
        connect: graphql.Arg<TypesForList['uniqueWhere']>;
      }>;
      update?: graphql.InputObjectType<{
        create?: graphql.Arg<TypesForList['create']>;
        connect: graphql.Arg<TypesForList['uniqueWhere']>;
        disconnect: graphql.Arg<typeof graphql.Boolean>;
      }>;
    };
  };
};

export type FindManyArgs = {
  where: graphql.Arg<graphql.NonNullType<TypesForList['where']>, true>;
  orderBy: graphql.Arg<
    graphql.NonNullType<graphql.ListType<graphql.NonNullType<TypesForList['orderBy']>>>,
    true
  >;
  take: graphql.Arg<typeof graphql.Int>;
  skip: graphql.Arg<graphql.NonNullType<typeof graphql.Int>, true>;
};

export type FindManyArgsValue = graphql.InferValueFromArgs<FindManyArgs>;

// fieldType(dbField)(fieldInfo) => { ...fieldInfo, dbField };
export function fieldType<TDBField extends DBField>(dbField: TDBField) {
  return function <
    CreateArg extends graphql.Arg<graphql.InputType> | undefined,
    UpdateArg extends graphql.Arg<graphql.InputType>,
    UniqueWhereArg extends graphql.Arg<graphql.NullableInputType, false>,
    OrderByArg extends graphql.Arg<graphql.NullableInputType, false>,
    FilterArg extends graphql.Arg<graphql.NullableInputType, false>
  >(
    graphQLInfo: FieldTypeWithoutDBField<
      TDBField,
      CreateArg,
      UpdateArg,
      UniqueWhereArg,
      OrderByArg,
      FilterArg
    >
  ): NextFieldType<TDBField, CreateArg, UpdateArg, UniqueWhereArg, OrderByArg> {
    return { ...graphQLInfo, dbField };
  };
}
