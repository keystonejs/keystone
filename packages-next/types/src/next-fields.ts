import { IdType } from '@keystone-next/keystone/src/lib/core/utils';
// import * as tsgql from '@ts-gql/schema';
import Decimal from 'decimal.js';
import { BaseGeneratedListTypes } from './utils';
import { CommonFieldConfig } from './config';
import { DatabaseProvider, FieldDefaultValue } from './core';
import { types } from './ts-gql-schema';
import { AdminMetaRootVal, JSONValue, KeystoneContext, MaybePromise } from '.';

export { Decimal };

export const QueryMeta = types.object<{ getCount: () => Promise<number> }>()({
  name: '_QueryMeta',
  fields: {
    count: types.field({
      type: types.Int,
      resolve({ getCount }) {
        return getCount();
      },
    }),
  },
});

// CacheScope and CacheHint are sort of duplicated from apollo-cache-control
// because they use an enum which means TS users have to import the CacheScope enum from apollo-cache-control which isn't great
// so we have a copy of it but using a union of string literals instead of an enum
// (note people importing the enum from apollo-cache-control will still be able to use it because you can use enums as their literal values but not the opposite)
export type CacheScope = 'PUBLIC' | 'PRIVATE';

export type CacheHint = {
  maxAge?: number;
  scope?: CacheScope;
};

export type ItemRootValue = { id: IdType; [key: string]: unknown };

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
  CreateArg extends types.Arg<types.InputType> | undefined = types.Arg<types.InputType> | undefined,
  UpdateArg extends types.Arg<types.InputType> = types.Arg<types.InputType>,
  UniqueWhereArg extends types.Arg<types.NullableInputType, undefined> = types.Arg<
    types.NullableInputType,
    undefined
  >,
  OrderByArg extends types.Arg<types.NullableInputType, undefined> = types.Arg<
    types.NullableInputType,
    undefined
  >
> = {
  dbField: TDBField;
} & FieldTypeWithoutDBField<TDBField, CreateArg, UpdateArg, UniqueWhereArg, OrderByArg>;

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

export const orderDirectionEnum = types.enum({
  name: 'OrderDirection',
  values: types.enumValues(['asc', 'desc']),
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
        count(args: FindManyArgsValue): Promise<number>;
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

export type OrderByFieldInputArg<Val, TArg extends types.Arg<types.NullableInputType>> = {
  arg: TArg;
} & ResolveFunc<
  (
    value: Exclude<types.InferValueFromArg<TArg>, null | undefined>,
    context: KeystoneContext
  ) => MaybePromise<Val>
>;

type FieldInputResolver<Input, Output, RelationshipInputResolver> = (
  value: Input,
  context: KeystoneContext,
  relationshipInputResolver: RelationshipInputResolver
) => MaybePromise<Output>;

export type UpdateFieldInputArg<
  TDBField extends DBField,
  TArg extends types.Arg<types.InputType, any>
> = {
  arg: TArg;
} & ResolveFunc<
  FieldInputResolver<
    types.InferValueFromArg<TArg>,
    DBFieldToInputValue<TDBField>,
    any
    // i think this is broken because variance?
    // TDBField extends RelationDBField<infer Mode>
    //   ? (
    //       input: types.InferValueFromArg<types.Arg<TypesForList['relateTo'][Mode]['create']>>
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
  //       input: types.InferValueFromArg<types.Arg<TypesForList['relateTo'][Mode]['create']>>
  //     ) => Promise<any>
  //   : undefined
>;

export type CreateFieldInputArg<
  TDBField extends DBField,
  TArg extends types.Arg<types.InputType, any> | undefined
> = {
  arg: TArg;
} & (TArg extends types.Arg<types.InputType, any>
  ? DBFieldToInputValue<TDBField> extends types.InferValueFromArg<TArg>
    ? {
        resolve?: CreateFieldInputResolver<types.InferValueFromArg<TArg>, TDBField>;
      }
    : {
        resolve: CreateFieldInputResolver<types.InferValueFromArg<TArg>, TDBField>;
      }
  : {
      resolve: CreateFieldInputResolver<undefined, TDBField>;
    });

type UnwrapMaybePromise<T> = T extends Promise<infer Resolved> ? Resolved : T;

type ResolveFunc<Func extends (firstArg: any, ...args: any[]) => any> =
  Parameters<Func>[0] extends UnwrapMaybePromise<ReturnType<Func>>
    ? { resolve?: Func }
    : { resolve: Func };

export type UniqueWhereFieldInputArg<Val, TArg extends types.Arg<types.InputType>> = {
  arg: TArg;
} & ResolveFunc<
  (
    value: Exclude<types.InferValueFromArg<TArg>, undefined | null>,
    context: KeystoneContext
  ) => MaybePromise<Val>
>;

type FieldTypeOutputField<TDBField extends DBField> = types.Field<
  { id: IdType; value: DBFieldToOutputValue<TDBField>; item: ItemRootValue },
  any,
  types.OutputType,
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
  CreateArg extends types.Arg<types.InputType> | undefined = types.Arg<types.InputType> | undefined,
  UpdateArg extends types.Arg<types.InputType> = types.Arg<types.InputType>,
  UniqueWhereArg extends types.Arg<types.NullableInputType, undefined> = types.Arg<
    types.NullableInputType,
    undefined
  >,
  OrderByArg extends types.Arg<types.NullableInputType, undefined> = types.Arg<
    types.NullableInputType,
    undefined
  >
> = {
  input?: {
    uniqueWhere?: UniqueWhereFieldInputArg<DBFieldUniqueWhere<TDBField>, UniqueWhereArg>;
    create?: CreateFieldInputArg<TDBField, CreateArg>;
    update?: UpdateFieldInputArg<TDBField, UpdateArg>;
    orderBy?: OrderByFieldInputArg<DBFieldToOrderByValue<TDBField>, OrderByArg>;
  };
  output: FieldTypeOutputField<TDBField>;
  views: string;
  extraOutputFields?: Record<string, FieldTypeOutputField<TDBField>>;
  getAdminMeta?: (adminMeta: AdminMetaRootVal) => JSONValue;
  unreferencedConcreteInterfaceImplementations?: types.ObjectType<any>[];
  __legacy?: {
    filters?: {
      fields: Record<string, types.Arg<any>>;
      impls: Record<
        string,
        (value: any, resolveForeignListWhereInput?: (val: any) => Promise<any>) => any
      >;
    };
    isRequired?: boolean;
    defaultValue?: FieldDefaultValue<any, BaseGeneratedListTypes>;
  };
} & CommonFieldConfig<BaseGeneratedListTypes>;

export function fieldType<TDBField extends DBField>(dbField: TDBField) {
  return function <
    CreateArg extends types.Arg<types.InputType> | undefined,
    UpdateArg extends types.Arg<types.InputType>,
    UniqueWhereArg extends types.Arg<types.NullableInputType, undefined>,
    OrderByArg extends types.Arg<types.NullableInputType, undefined>
  >(
    stuff: FieldTypeWithoutDBField<TDBField, CreateArg, UpdateArg, UniqueWhereArg, OrderByArg>
  ): NextFieldType<TDBField, CreateArg, UpdateArg, UniqueWhereArg, OrderByArg> {
    return { ...stuff, dbField };
  };
}

type AnyInputObj = types.InputObjectType<Record<string, types.Arg<types.InputType, any>>>;

type RelateToOneInput = types.InputObjectType<{
  create?: types.Arg<TypesForList['create']>;
  connect: types.Arg<TypesForList['uniqueWhere']>;
  disconnect: types.Arg<TypesForList['uniqueWhere']>;
  disconnectAll: types.Arg<typeof types.Boolean>;
}>;

type RelateToManyInput = types.InputObjectType<{
  create?: types.Arg<types.ListType<TypesForList['create']>>;
  connect: types.Arg<types.ListType<TypesForList['uniqueWhere']>>;
  disconnect: types.Arg<types.ListType<TypesForList['uniqueWhere']>>;
  disconnectAll: types.Arg<typeof types.Boolean>;
}>;

export type TypesForList = {
  update: AnyInputObj;
  create: AnyInputObj;
  uniqueWhere: AnyInputObj;
  where: AnyInputObj;
  orderBy: AnyInputObj;
  output: types.ObjectType<ItemRootValue>;
  findManyArgs: FindManyArgs;
  relateTo: {
    many: {
      create: RelateToManyInput;
      update: RelateToManyInput;
    };
    one: {
      create: RelateToOneInput;
      update: RelateToOneInput;
    };
  };
};

export type FindManyArgs = {
  where: types.Arg<types.NonNullType<TypesForList['where']>, {}>;
  orderBy: types.Arg<
    types.NonNullType<types.ListType<types.NonNullType<TypesForList['orderBy']>>>,
    Record<string, any>[]
  >;
  search: types.Arg<typeof types.String>;
  sortBy: types.Arg<
    types.ListType<types.NonNullType<types.EnumType<Record<string, types.EnumValue<string>>>>>
  >;
  first: types.Arg<typeof types.Int>;
  skip: types.Arg<types.NonNullType<typeof types.Int>, number>;
};

export type FindManyArgsValue = types.InferValueFromArgs<FindManyArgs>;
