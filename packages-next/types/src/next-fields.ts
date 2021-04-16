import * as tsgql from '@ts-gql/schema';
import GraphQLJSON from 'graphql-type-json';
import { JSONValue, KeystoneContext, MaybePromise } from '.';

export const types = {
  JSON: tsgql.types.scalar<JSONValue>(GraphQLJSON),
  ...tsgql.bindTypesToContext<KeystoneContext>(),
};

export type ItemRootValue = { id: string; [key: string]: unknown };

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
> = (data: FieldData) => FieldType<TDBField, CreateArg, UpdateArg, FilterArg>;

export type FieldType<
  TDBField extends DBField = DBField,
  CreateArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  UpdateArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>,
  FilterArg extends tsgql.Arg<tsgql.InputType, any> = tsgql.Arg<tsgql.InputType, any>
> = {
  dbField: TDBField;
  input?: {
    where?: FieldInputArg<DBFieldFilters<TDBField>, FilterArg>;
    create?: FieldInputArg<DBFieldToInputValue<TDBField>, CreateArg>;
    update?: FieldInputArg<DBFieldToInputValue<TDBField>, UpdateArg>;
  };
  output: tsgql.OutputField<
    {
      id: string;
      value: DBFieldToOutputValue<TDBField>;
      item: ItemRootValue;
    },
    any,
    any,
    'value',
    KeystoneContext
  >;
};

type ScalarPrismaTypes = {
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: Date;
  Json: unknown;
};

export type ScalarDBField<
  Scalar extends keyof ScalarPrismaTypes,
  Mode extends 'required' | 'many' | 'optional'
> = {
  kind: 'scalar';
  scalar: Scalar;
  mode: Mode;
  isUnique?: boolean;
  isOrderable?: boolean;
};

export type RelationDBField<Mode extends 'many' | 'one'> = {
  kind: 'relation';
  relation: { model: string; field: string };
  mode: Mode;
};

export type EnumDBField<Value extends string, Mode extends 'required' | 'many' | 'optional'> = {
  kind: 'enum';
  enum: Value[];
  mode: Mode;
  isUnique?: boolean;
  isOrderable?: boolean;
};

export type NoDBField = { kind: 'none' };

export type RealDBField =
  | ScalarDBField<keyof ScalarPrismaTypes, 'required' | 'many' | 'optional'>
  | RelationDBField<'many' | 'one'>
  | EnumDBField<string, 'required' | 'many' | 'optional'>;

type MultiDBField<Fields extends Record<string, RealDBField>> = { kind: 'multi'; fields: Fields };

export type DBField = RealDBField | NoDBField | MultiDBField<Record<string, RealDBField>>;

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
type DBFieldFilters<TDBField extends DBField> = any;

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
  arg: MaybeFunction<[types: Record<string, TypesForList>], TArg>;
} & (Val | undefined extends tsgql.InferValueFromArg<TArg>
  ? {
      resolve?(value: tsgql.InferValueFromArg<TArg>): MaybePromise<Val | undefined>;
    }
  : {
      resolve(value: tsgql.InferValueFromArg<TArg>): MaybePromise<Val | undefined>;
    });

export function fieldType<TDBField extends DBField>(dbField: TDBField) {
  return function <
    CreateArg extends tsgql.Arg<tsgql.InputType, any>,
    UpdateArg extends tsgql.Arg<tsgql.InputType, any>,
    FilterArg extends tsgql.Arg<tsgql.InputType, any>
  >(stuff: {
    input?: {
      where?: FieldInputArg<DBFieldFilters<TDBField>, FilterArg>;
      create?: FieldInputArg<DBFieldToInputValue<TDBField>, CreateArg>;
      update?: FieldInputArg<DBFieldToInputValue<TDBField>, UpdateArg>;
    };
    output: tsgql.OutputField<
      {
        id: string;
        value: DBFieldToOutputValue<TDBField>;
        item: ItemRootValue;
      },
      any,
      any,
      'value',
      KeystoneContext
    >;
  }): FieldType<TDBField, CreateArg, UpdateArg, FilterArg> {
    return { ...stuff, dbField };
  };
}

type AnyInputObj = tsgql.InputObjectType<
  {
    [Key in keyof any]: tsgql.Arg<tsgql.InputType, tsgql.InferValueFromInputType<tsgql.InputType>>;
  }
>;

export type TypesForList = {
  update: AnyInputObj;
  create: AnyInputObj;
  uniqueWhere: AnyInputObj;
  where: AnyInputObj;
  manyRelationFilter: AnyInputObj;
  relateToOne: AnyInputObj;
  relateToMany: AnyInputObj;
  sortBy: AnyInputObj;
  output: tsgql.ObjectType<{ id: string; [key: string]: unknown }, string, KeystoneContext>;
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
