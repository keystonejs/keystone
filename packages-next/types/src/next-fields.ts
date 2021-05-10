import { IdType } from '@keystone-next/keystone/src/lib/core/utils';
import * as tsgql from '@ts-gql/schema';
import GraphQLJSON from 'graphql-type-json';
import {
  FilterInputResolvers,
  CreateAndUpdateInputResolvers,
} from '@keystone-next/keystone/src/lib/core/input-resolvers';
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
  CreateArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  UpdateArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  FilterArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  UniqueFilterArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>
> = (data: FieldData) => NextFieldType<TDBField, CreateArg, UpdateArg, FilterArg, UniqueFilterArg>;

export type NextFieldType<
  TDBField extends DBField = DBField,
  CreateArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
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
  // TODO: type this nicely rather than just accepting a string(it can't just be a set of string literals though)
  nativeType?: string;
  default?: ScalarDBFieldDefault<Scalar, Mode>;
  index?: 'unique' | 'index';
};

export const sortDirectionEnum = types.enum({
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

// TODO: this probably isn't totally right for create
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
  ? // note: this is very intentionally not optional and instead | undefined to force people to explicitly show what they are not setting
    { [Key in keyof Fields]: DBFieldToInputValue<Fields[Key]> | undefined }
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

export type FieldInputArg<Val, TArg extends tsgql.Arg<tsgql.InputType, any>> = {
  arg: TArg;
} & (Val | undefined extends tsgql.InferValueFromArg<TArg>
  ? {
      resolve?(
        value: tsgql.InferValueFromArg<TArg>,
        context: KeystoneContext
      ): MaybePromise<Val | undefined>;
    }
  : {
      resolve(
        value: tsgql.InferValueFromArg<TArg>,
        context: KeystoneContext
      ): MaybePromise<Val | undefined>;
    });

export type FieldInputArgWithInputResolvers<
  Val,
  TArg extends tsgql.Arg<tsgql.InputType, any>,
  InputResolvers
> = {
  arg: TArg;
} & (Val | undefined extends tsgql.InferValueFromArg<TArg>
  ? {
      resolve?(
        value: tsgql.InferValueFromArg<TArg>,
        context: KeystoneContext,
        inputResolversByList: Record<string, InputResolvers>
      ): MaybePromise<Val | undefined>;
    }
  : {
      resolve(
        value: tsgql.InferValueFromArg<TArg>,
        context: KeystoneContext,
        inputResolversByList: Record<string, InputResolvers>
      ): MaybePromise<Val | undefined>;
    });

export type FieldInputArgWithInputResolversWithOptionalArg<
  Val,
  TArg extends tsgql.Arg<tsgql.InputType, any>,
  InputResolvers
> =
  | ({
      arg: TArg;
    } & (Val | undefined extends tsgql.InferValueFromArg<TArg>
      ? {
          resolve?(
            value: tsgql.InferValueFromArg<TArg>,
            context: KeystoneContext,
            inputResolversByList: Record<string, InputResolvers>
          ): MaybePromise<Val | undefined>;
        }
      : {
          resolve(
            value: tsgql.InferValueFromArg<TArg>,
            context: KeystoneContext,
            inputResolversByList: Record<string, InputResolvers>
          ): MaybePromise<Val | undefined>;
        }))
  | {
      arg?: undefined;
      resolve(
        value: undefined,
        context: KeystoneContext,
        inputResolversByList: Record<string, InputResolvers>
      ): MaybePromise<Val | undefined>;
    };

export type FieldInputArgWithInputResolversWithoutUndefined<
  Val,
  TArg extends tsgql.Arg<tsgql.InputType, any>,
  InputResolvers
> = {
  arg: TArg;
} & (Val | undefined extends tsgql.InferValueFromArg<TArg>
  ? {
      resolve?(
        value: Exclude<tsgql.InferValueFromArg<TArg>, undefined>,
        context: KeystoneContext,
        inputResolversByList: Record<string, InputResolvers>
      ): MaybePromise<Val | undefined>;
    }
  : {
      resolve(
        value: Exclude<tsgql.InferValueFromArg<TArg>, undefined>,
        context: KeystoneContext,
        inputResolversByList: Record<string, InputResolvers>
      ): MaybePromise<Val | undefined>;
    });

export type FieldInputArgWithoutUndefinedOrNull<
  Val,
  TArg extends tsgql.Arg<tsgql.InputType, any>
> = {
  arg: TArg;
} & (Val | undefined extends tsgql.InferValueFromArg<TArg>
  ? {
      resolve?(
        value: Exclude<tsgql.InferValueFromArg<TArg>, undefined | null>,
        context: KeystoneContext
      ): MaybePromise<Val | undefined>;
    }
  : {
      resolve(
        value: Exclude<tsgql.InferValueFromArg<TArg>, undefined | null>,
        context: KeystoneContext
      ): MaybePromise<Val | undefined>;
    });

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
  CreateArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  UpdateArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  FilterArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  UniqueFilterArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  OrderByArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>
> = {
  input?: {
    uniqueWhere?: FieldInputArgWithoutUndefinedOrNull<
      DBFieldUniqueFilter<TDBField>,
      UniqueFilterArg
    >;
    where?: FieldInputArgWithInputResolversWithoutUndefined<
      DBFieldFilters<TDBField>,
      FilterArg,
      FilterInputResolvers
    >;
    create?: FieldInputArgWithInputResolversWithOptionalArg<
      DBFieldToInputValue<TDBField>,
      CreateArg,
      CreateAndUpdateInputResolvers
    >;
    update?: FieldInputArgWithInputResolvers<
      DBFieldToInputValue<TDBField>,
      UpdateArg,
      CreateAndUpdateInputResolvers
    >;
    orderBy?: FieldInputArg<DBFieldToOrderByValue<TDBField>, OrderByArg>;
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
    CreateArg extends tsgql.Arg<tsgql.InputType, any>,
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

export function getFindManyArgs(typesForList: TypesForList): FindManyArgs {
  return {
    where: types.arg({
      type: types.nonNull(typesForList.where),
      defaultValue: {},
    }),
    orderBy: types.arg({
      type: types.nonNull(types.list(types.nonNull(typesForList.orderBy))),
      defaultValue: [],
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
