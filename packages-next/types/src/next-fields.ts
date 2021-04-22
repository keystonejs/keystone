import { IdType } from '@keystone-next/keystone/src/lib/core/utils';
import * as tsgql from '@ts-gql/schema';
import GraphQLJSON from 'graphql-type-json';
import { InputResolvers } from '@keystone-next/keystone/src/lib/core/input-resolvers';
import { BaseGeneratedListTypes } from './utils';
import { ListHooks } from './config';
import { FieldAccessControl, JSONValue, KeystoneContext, MaybePromise } from '.';

export const types = {
  JSON: tsgql.types.scalar<JSONValue>(GraphQLJSON),
  ...tsgql.bindTypesToContext<KeystoneContext>(),
};

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

export type FieldData = {
  typesForLists: Record<string, TypesForList>;
  listKey: string;
  fieldPath: string;
};

export type FieldTypeFunc<
  TDBField extends DBField = DBField,
  CreateArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  UpdateArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  FilterArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>
> = (data: FieldData) => NextFieldType<TDBField, CreateArg, UpdateArg, FilterArg>;

export type NextFieldType<
  TDBField extends DBField = DBField,
  CreateArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  UpdateArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  FilterArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  UniqueFilterArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>
> = {
  dbField: TDBField;
  input?: {
    uniqueWhere?: FieldInputArg<DBFieldUniqueFilter<TDBField>, UniqueFilterArg>;
    where?: FieldInputArg<DBFieldFilters<TDBField>, FilterArg>;
    create?: FieldInputArg<DBFieldToInputValue<TDBField>, CreateArg>;
    update?: FieldInputArg<DBFieldToInputValue<TDBField>, UpdateArg>;
  };
  output: FieldTypeOutputField<TDBField>;
  extraOutputFields?: Record<string, FieldTypeOutputField<TDBField>>;
  cacheHint?: CacheHint;
  access?: FieldAccessControl<BaseGeneratedListTypes>;
  hooks?: ListHooks<BaseGeneratedListTypes>;
};

type ScalarPrismaTypes = {
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: Date;
  BigInt: bigint;
  Json: JSONValue;
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
  // TODO: type this nicely rather than just accepting a string(it can't just be a set of string literals though)
  nativeType?: string;
  default?: ScalarDBFieldDefault<Scalar, Mode>;
  index?: 'unique' | 'index';
  isOrderable?: boolean;
};

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
  isOrderable?: boolean;
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

type DBFieldToInputValue<TDBField extends DBField> = TDBField extends ScalarDBField<
  infer Scalar,
  infer Mode
>
  ? {
      optional: ScalarPrismaTypes[Scalar] | null;
      required: ScalarPrismaTypes[Scalar];
      many: ScalarPrismaTypes[Scalar][];
    }[Mode]
  : TDBField extends RelationDBField<'many' | 'one'>
  ? { connect?: {}; disconnect?: boolean }
  : TDBField extends EnumDBField<infer Value, infer Mode>
  ? {
      optional: Value | null;
      required: Value;
      many: Value[];
    }[Mode]
  : TDBField extends NoDBField
  ? undefined
  : TDBField extends MultiDBField<infer Fields>
  ? { [Key in keyof Fields]: DBFieldToInputValue<Fields[Key]> }
  : never;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type DBFieldFiltersInner<TDBField extends DBField> = Record<string, any>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type DBFieldFilters<TDBField extends DBField> = {
  AND?: DBFieldFiltersInner<TDBField>;
  OR?: DBFieldFiltersInner<TDBField>;
  NOT?: DBFieldFiltersInner<TDBField>;
} & DBFieldFiltersInner<TDBField>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type DBFieldUniqueFilter<TDBField extends DBField> = any;

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

type FieldInputArg<Val, TArg extends tsgql.Arg<tsgql.InputType, any>> = {
  arg: TArg;
} & (Val | undefined extends tsgql.InferValueFromArg<TArg>
  ? {
      resolve?(
        value: tsgql.InferValueFromArg<TArg>,
        resolvers: Record<string, InputResolvers>
      ): MaybePromise<Val | undefined>;
    }
  : {
      resolve(
        value: tsgql.InferValueFromArg<TArg>,
        resolvers: Record<string, InputResolvers>
      ): MaybePromise<Val | undefined>;
    });

type FieldTypeOutputField<TDBField extends DBField> = tsgql.OutputField<
  { id: IdType; value: DBFieldToOutputValue<TDBField>; item: ItemRootValue },
  any,
  any,
  'value',
  KeystoneContext
>;

export function fieldType<TDBField extends DBField>(dbField: TDBField) {
  return function <
    CreateArg extends tsgql.Arg<tsgql.InputType, any>,
    UpdateArg extends tsgql.Arg<tsgql.InputType, any>,
    FilterArg extends tsgql.Arg<tsgql.InputType, any>,
    UniqueFilterArg extends tsgql.Arg<tsgql.InputType, any>
  >(stuff: {
    input?: {
      uniqueWhere?: FieldInputArg<DBFieldUniqueFilter<TDBField>, UniqueFilterArg>;
      where?: FieldInputArg<DBFieldFilters<TDBField>, FilterArg>;
      create?: FieldInputArg<DBFieldToInputValue<TDBField>, CreateArg>;
      update?: FieldInputArg<DBFieldToInputValue<TDBField>, UpdateArg>;
    };
    output: FieldTypeOutputField<TDBField>;
    extraOutputFields?: Record<string, FieldTypeOutputField<TDBField>>;
    cacheHint?: CacheHint;
    access?: FieldAccessControl<BaseGeneratedListTypes>;
    hooks?: ListHooks<BaseGeneratedListTypes>;
  }): NextFieldType<TDBField, CreateArg, UpdateArg, FilterArg, UniqueFilterArg> {
    return { ...stuff, dbField };
  };
}

type AnyInputObj = tsgql.InputObjectType<
  Record<string, tsgql.Arg<tsgql.InputType, tsgql.InferValueFromInputType<tsgql.InputType>>>
>;

export type TypesForList = {
  update: AnyInputObj;
  create: AnyInputObj;
  uniqueWhere: AnyInputObj;
  where: AnyInputObj;
  sortBy: AnyInputObj;
  output: tsgql.ObjectType<ItemRootValue, string, KeystoneContext>;
};

export type FindManyArgs = {
  where: tsgql.Arg<TypesForList['where'], {}>;
  sortBy: tsgql.Arg<
    tsgql.NonNullType<tsgql.ListType<tsgql.NonNullType<TypesForList['sortBy']>>>,
    any
  >;
  search: tsgql.Arg<typeof types.String>;
  first: tsgql.Arg<typeof types.Int>;
  skip: tsgql.Arg<tsgql.NonNullType<typeof types.Int>, number>;
};

export type FindManyArgsValue = tsgql.InferValueFromArgs<FindManyArgs>;

export function getFindManyArgs(typesForList: TypesForList): FindManyArgs {
  return {
    where: types.arg({
      type: typesForList.where,
      defaultValue: {},
    }),
    sortBy: types.arg({
      type: types.nonNull(types.list(types.nonNull(typesForList.sortBy))),
      defaultValue: [],
    }),
    search: types.arg({
      type: types.String,
    }),
    first: types.arg({
      type: types.Int,
    }),
    skip: types.arg({
      type: types.nonNull(types.Int),
      defaultValue: 0,
    }),
  };
}
