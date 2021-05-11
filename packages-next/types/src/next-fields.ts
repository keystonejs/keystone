import { IdType } from '@keystone-next/keystone/src/lib/core/utils';
import * as tsgql from '@ts-gql/schema';
import GraphQLJSON from 'graphql-type-json';
import type { FileUpload } from 'graphql-upload';
// this is imported from a specific path so that we don't import busboy here because webpack doesn't like bundling it
// @ts-ignore
import GraphQLUpload from 'graphql-upload/public/GraphQLUpload';
import { BaseGeneratedListTypes } from './utils';
import { CommonFieldConfig } from './config';
import { Provider } from './core';
import { AdminMetaRootVal, JSONValue, KeystoneContext, MaybePromise } from '.';

export const types = {
  JSON: tsgql.types.scalar<JSONValue>(GraphQLJSON),
  Upload: tsgql.types.scalar<Promise<FileUpload>>(GraphQLUpload),
  ...tsgql.bindTypesToContext<KeystoneContext>(),
};

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

export { tsgql };

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
  provider: Provider;
  listKey: string;
  fieldKey: string;
};

export type FieldTypeFunc<
  TDBField extends DBField = DBField,
  CreateArg extends tsgql.Arg<tsgql.InputType, any> | undefined =
    | tsgql.Arg<tsgql.InputType, any>
    | undefined,
  UpdateArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  FilterArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  UniqueFilterArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>
> = (data: FieldData) => NextFieldType<TDBField, CreateArg, UpdateArg, FilterArg, UniqueFilterArg>;

export type NextFieldType<
  TDBField extends DBField = DBField,
  CreateArg extends tsgql.Arg<tsgql.InputType, any> | undefined =
    | tsgql.Arg<tsgql.InputType, any>
    | undefined,
  UpdateArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  FilterArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  UniqueFilterArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>
> = {
  dbField: TDBField;
} & FieldTypeWithoutDBField<TDBField, CreateArg, UpdateArg, FilterArg, UniqueFilterArg>;

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
  // TODO: type this well rather than just accepting a string(it can't just be a set of string literals though)
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

export type OrderByFieldInputArg<Val, TArg extends tsgql.Arg<tsgql.InputType, any>> = {
  arg: TArg;
} & ResolveFunc<
  (value: tsgql.InferValueFromArg<TArg>, context: KeystoneContext) => MaybePromise<Val | undefined>
>;

type FieldInputResolver<Input, Output, RelationshipInputResolver> = (
  value: Input,
  context: KeystoneContext,
  relationshipInputResolver: RelationshipInputResolver
) => MaybePromise<Output>;

export type UpdateFieldInputArg<
  TDBField extends DBField,
  TArg extends tsgql.Arg<tsgql.InputType, any>
> = {
  arg: TArg;
} & ResolveFunc<
  FieldInputResolver<
    tsgql.InferValueFromArg<TArg>,
    DBFieldToInputValue<TDBField>,
    TDBField extends RelationDBField<infer Mode>
      ? (
          input: tsgql.InferValueFromArg<tsgql.Arg<TypesForList['relateTo'][Mode]['create']>>
        ) => Promise<any>
      : undefined
  >
>;

type CreateFieldInputResolver<Input, TDBField extends DBField> = FieldInputResolver<
  Input,
  DBFieldToInputValue<TDBField>,
  TDBField extends RelationDBField<infer Mode>
    ? (
        input: tsgql.InferValueFromArg<tsgql.Arg<TypesForList['relateTo'][Mode]['create']>>
      ) => Promise<any>
    : undefined
>;

export type CreateFieldInputArg<
  TDBField extends DBField,
  TArg extends tsgql.Arg<tsgql.InputType, any> | undefined
> = {
  arg: TArg;
} & (TArg extends tsgql.Arg<tsgql.InputType, any>
  ? DBFieldToInputValue<TDBField> extends tsgql.InferValueFromArg<TArg>
    ? {
        resolve?: CreateFieldInputResolver<tsgql.InferValueFromArg<TArg>, TDBField>;
      }
    : {
        resolve: CreateFieldInputResolver<tsgql.InferValueFromArg<TArg>, TDBField>;
      }
  : {
      resolve: CreateFieldInputResolver<undefined, TDBField>;
    });

export type WhereFieldInputArg<
  TDBField extends DBField,
  TArg extends tsgql.Arg<tsgql.InputType, any>
> = {
  arg: TArg;
} & ResolveFunc<
  FieldInputResolver<
    Exclude<tsgql.InferValueFromArg<TArg>, undefined>,
    DBFieldFilters<TDBField>,
    TDBField extends RelationDBField<infer Mode>
      ? (
          input: {
            many: tsgql.InferValueFromArg<tsgql.Arg<TypesForList['manyRelationWhere']>>;
            one: tsgql.InferValueFromArg<tsgql.Arg<TypesForList['where']>>;
          }[Mode]
        ) => Promise<any>
      : undefined
  >
>;

type UnwrapMaybePromise<T> = T extends Promise<infer Resolved> ? Resolved : T;

type ResolveFunc<Func extends (firstArg: any, ...args: any[]) => any> =
  Parameters<Func>[0] extends UnwrapMaybePromise<ReturnType<ReturnType<Func>>>
    ? { resolve?: Func }
    : { resolve: Func };

export type UniqueWhereFieldInputArg<Val, TArg extends tsgql.Arg<tsgql.InputType, any>> = {
  arg: TArg;
} & ResolveFunc<
  (
    value: Exclude<tsgql.InferValueFromArg<TArg>, undefined | null>,
    context: KeystoneContext
  ) => MaybePromise<Val>
>;

type FieldTypeOutputField<TDBField extends DBField> = tsgql.OutputField<
  { id: IdType; value: DBFieldToOutputValue<TDBField>; item: ItemRootValue },
  any,
  any,
  'value',
  KeystoneContext
>;

export type OrderDirection = 'asc' | 'desc';

type DBFieldToOrderByValue<TDBField extends DBField> = TDBField extends ScalarishDBField
  ? OrderDirection
  : TDBField extends MultiDBField<infer Fields>
  ? { [Key in keyof Fields]: DBFieldToOrderByValue<Fields[Key]> }
  : undefined;

export type FieldTypeWithoutDBField<
  TDBField extends DBField = DBField,
  CreateArg extends tsgql.Arg<tsgql.InputType, any> | undefined =
    | tsgql.Arg<tsgql.InputType, any>
    | undefined,
  UpdateArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  FilterArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  UniqueFilterArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  OrderByArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>
> = {
  input?: {
    uniqueWhere?: UniqueWhereFieldInputArg<DBFieldUniqueFilter<TDBField>, UniqueFilterArg>;
    where?: WhereFieldInputArg<TDBField, FilterArg>;
    create?: CreateFieldInputArg<TDBField, CreateArg>;
    update?: UpdateFieldInputArg<TDBField, UpdateArg>;
    orderBy?: OrderByFieldInputArg<DBFieldToOrderByValue<TDBField>, OrderByArg>;
  };
  output: FieldTypeOutputField<TDBField>;
  views: string;
  extraOutputFields?: Record<string, FieldTypeOutputField<TDBField>>;
  cacheHint?: CacheHint;
  getAdminMeta?: (adminMeta: AdminMetaRootVal) => JSONValue;
  // maybe this should be called `types` and accept any type?
  // the long and weird name is kinda good though because it tells people they shouldn't use it unless they know what this means
  unreferencedConcreteInterfaceImplementations?: tsgql.ObjectType<any, string, KeystoneContext>[];
} & CommonFieldConfig<BaseGeneratedListTypes>;

export function fieldType<TDBField extends DBField>(dbField: TDBField) {
  return function <
    CreateArg extends tsgql.Arg<tsgql.InputType, any> | undefined,
    UpdateArg extends tsgql.Arg<tsgql.InputType, any>,
    FilterArg extends tsgql.Arg<tsgql.InputType, any>,
    UniqueFilterArg extends tsgql.Arg<tsgql.InputType, any>
  >(
    stuff: FieldTypeWithoutDBField<TDBField, CreateArg, UpdateArg, FilterArg, UniqueFilterArg>
  ): NextFieldType<TDBField, CreateArg, UpdateArg, FilterArg, UniqueFilterArg> {
    return { ...stuff, dbField };
  };
}

type AnyInputObj = tsgql.InputObjectType<
  Record<string, tsgql.Arg<tsgql.InputType, tsgql.InferValueFromInputType<tsgql.InputType>>>
>;

type NonNullListArgWithDefault<Type extends tsgql.TypesExcludingNonNull> = tsgql.Arg<
  tsgql.NonNullType<tsgql.ListType<tsgql.NonNullType<Type>>>,
  any[]
>;

type RelateToOneInput = tsgql.InputObjectType<{
  create: tsgql.Arg<TypesForList['create'], any>;
  connect: tsgql.Arg<TypesForList['uniqueWhere'], any>;
}>;

export type TypesForList = {
  update: AnyInputObj;
  create: AnyInputObj;
  uniqueWhere: AnyInputObj;
  where: AnyInputObj;
  orderBy: AnyInputObj;
  output: tsgql.ObjectType<ItemRootValue, string, KeystoneContext>;
  manyRelationWhere: tsgql.InputObjectType<{
    every: tsgql.Arg<AnyInputObj>;
    some: tsgql.Arg<AnyInputObj>;
    none: tsgql.Arg<AnyInputObj>;
  }>;
  findManyArgs: FindManyArgs;
  relateTo: {
    many: {
      create: tsgql.InputObjectType<{
        create: NonNullListArgWithDefault<TypesForList['create']>;
        connect: NonNullListArgWithDefault<TypesForList['uniqueWhere']>;
      }>;
      update: tsgql.InputObjectType<{
        create: NonNullListArgWithDefault<TypesForList['create']>;
        connect: NonNullListArgWithDefault<TypesForList['uniqueWhere']>;
        disconnect: NonNullListArgWithDefault<TypesForList['uniqueWhere']>;
        disconnectAll: tsgql.Arg<tsgql.NonNullType<typeof types.Boolean>, boolean>;
      }>;
    };
    one: {
      create: RelateToOneInput;
      update: RelateToOneInput;
    };
  };
};

export type FindManyArgs = {
  where: tsgql.Arg<tsgql.NonNullType<TypesForList['where']>, {}>;
  orderBy: tsgql.Arg<
    tsgql.NonNullType<tsgql.ListType<tsgql.NonNullType<TypesForList['orderBy']>>>,
    Record<string, any>[]
  >;
  first: tsgql.Arg<typeof types.Int>;
  skip: tsgql.Arg<tsgql.NonNullType<typeof types.Int>, number>;
};

export type FindManyArgsValue = tsgql.InferValueFromArgs<FindManyArgs>;
