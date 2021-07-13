import * as types from '../../ts-gql-schema';

const QueryMode = types.enum({
  name: 'QueryMode',
  values: types.enumValues(['default', 'insensitive']),
});

type StringNullableFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<typeof types.String>;
  // can be null
  in: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  // can be null
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  lt: types.Arg<typeof types.String>;
  lte: types.Arg<typeof types.String>;
  gt: types.Arg<typeof types.String>;
  gte: types.Arg<typeof types.String>;
  contains: types.Arg<typeof types.String>;
  startsWith: types.Arg<typeof types.String>;
  endsWith: types.Arg<typeof types.String>;
  mode: types.Arg<typeof QueryMode>;
  // can be null
  not: types.Arg<typeof NestedStringNullableFilter>;
}>;

const StringNullableFilter: StringNullableFilterType = types.inputObject({
  name: 'StringNullableFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.String }),
    // can be null
    in: types.arg({ type: types.list(types.nonNull(types.String)) }),
    // can be null
    notIn: types.arg({ type: types.list(types.nonNull(types.String)) }),
    lt: types.arg({ type: types.String }),
    lte: types.arg({ type: types.String }),
    gt: types.arg({ type: types.String }),
    gte: types.arg({ type: types.String }),
    contains: types.arg({ type: types.String }),
    startsWith: types.arg({ type: types.String }),
    endsWith: types.arg({ type: types.String }),
    mode: types.arg({ type: QueryMode }),
    // can be null
    not: types.arg({ type: NestedStringNullableFilter }),
  }),
});

type NestedStringNullableFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<typeof types.String>;
  // can be null
  in: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  // can be null
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  lt: types.Arg<typeof types.String>;
  lte: types.Arg<typeof types.String>;
  gt: types.Arg<typeof types.String>;
  gte: types.Arg<typeof types.String>;
  contains: types.Arg<typeof types.String>;
  startsWith: types.Arg<typeof types.String>;
  endsWith: types.Arg<typeof types.String>;
  // can be null
  not: types.Arg<typeof NestedStringNullableFilter>;
}>;

const NestedStringNullableFilter: NestedStringNullableFilterType = types.inputObject({
  name: 'NestedStringNullableFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.String }),
    // can be null
    in: types.arg({ type: types.list(types.nonNull(types.String)) }),
    // can be null
    notIn: types.arg({ type: types.list(types.nonNull(types.String)) }),
    lt: types.arg({ type: types.String }),
    lte: types.arg({ type: types.String }),
    gt: types.arg({ type: types.String }),
    gte: types.arg({ type: types.String }),
    contains: types.arg({ type: types.String }),
    startsWith: types.arg({ type: types.String }),
    endsWith: types.arg({ type: types.String }),
    // can be null
    not: types.arg({ type: NestedStringNullableFilter }),
  }),
});

type StringFilterType = types.InputObjectType<{
  equals: types.Arg<typeof types.String>;
  in: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  lt: types.Arg<typeof types.String>;
  lte: types.Arg<typeof types.String>;
  gt: types.Arg<typeof types.String>;
  gte: types.Arg<typeof types.String>;
  contains: types.Arg<typeof types.String>;
  startsWith: types.Arg<typeof types.String>;
  endsWith: types.Arg<typeof types.String>;
  mode: types.Arg<typeof QueryMode>;
  not: types.Arg<typeof NestedStringFilter>;
}>;

const StringFilter: StringFilterType = types.inputObject({
  name: 'StringFilter',
  fields: () => ({
    equals: types.arg({ type: types.String }),
    in: types.arg({ type: types.list(types.nonNull(types.String)) }),
    notIn: types.arg({ type: types.list(types.nonNull(types.String)) }),
    lt: types.arg({ type: types.String }),
    lte: types.arg({ type: types.String }),
    gt: types.arg({ type: types.String }),
    gte: types.arg({ type: types.String }),
    contains: types.arg({ type: types.String }),
    startsWith: types.arg({ type: types.String }),
    endsWith: types.arg({ type: types.String }),
    mode: types.arg({ type: QueryMode }),
    not: types.arg({ type: NestedStringFilter }),
  }),
});

type NestedStringFilterType = types.InputObjectType<{
  equals: types.Arg<typeof types.String>;
  in: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  lt: types.Arg<typeof types.String>;
  lte: types.Arg<typeof types.String>;
  gt: types.Arg<typeof types.String>;
  gte: types.Arg<typeof types.String>;
  contains: types.Arg<typeof types.String>;
  startsWith: types.Arg<typeof types.String>;
  endsWith: types.Arg<typeof types.String>;
  not: types.Arg<typeof NestedStringFilter>;
}>;

const NestedStringFilter: NestedStringFilterType = types.inputObject({
  name: 'NestedStringFilter',
  fields: () => ({
    equals: types.arg({ type: types.String }),
    in: types.arg({ type: types.list(types.nonNull(types.String)) }),
    notIn: types.arg({ type: types.list(types.nonNull(types.String)) }),
    lt: types.arg({ type: types.String }),
    lte: types.arg({ type: types.String }),
    gt: types.arg({ type: types.String }),
    gte: types.arg({ type: types.String }),
    contains: types.arg({ type: types.String }),
    startsWith: types.arg({ type: types.String }),
    endsWith: types.arg({ type: types.String }),
    not: types.arg({ type: NestedStringFilter }),
  }),
});

type StringNullableListFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  // can be null
  has: types.Arg<typeof types.String>;
  hasEvery: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  hasSome: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  isEmpty: types.Arg<typeof types.Boolean>;
}>;

const StringNullableListFilter: StringNullableListFilterType = types.inputObject({
  name: 'StringNullableListFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.list(types.nonNull(types.String)) }),
    // can be null
    has: types.arg({ type: types.String }),
    hasEvery: types.arg({ type: types.list(types.nonNull(types.String)) }),
    hasSome: types.arg({ type: types.list(types.nonNull(types.String)) }),
    isEmpty: types.arg({ type: types.Boolean }),
  }),
});

type BoolNullableFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<typeof types.Boolean>;
  // can be null
  not: types.Arg<typeof NestedBoolNullableFilter>;
}>;

const BoolNullableFilter: BoolNullableFilterType = types.inputObject({
  name: 'BoolNullableFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.Boolean }),
    // can be null
    not: types.arg({ type: NestedBoolNullableFilter }),
  }),
});

type NestedBoolNullableFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<typeof types.Boolean>;
  // can be null
  not: types.Arg<typeof NestedBoolNullableFilter>;
}>;

const NestedBoolNullableFilter: NestedBoolNullableFilterType = types.inputObject({
  name: 'NestedBoolNullableFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.Boolean }),
    // can be null
    not: types.arg({ type: NestedBoolNullableFilter }),
  }),
});

type BoolFilterType = types.InputObjectType<{
  equals: types.Arg<typeof types.Boolean>;
  not: types.Arg<typeof NestedBoolFilter>;
}>;

const BoolFilter: BoolFilterType = types.inputObject({
  name: 'BoolFilter',
  fields: () => ({
    equals: types.arg({ type: types.Boolean }),
    not: types.arg({ type: NestedBoolFilter }),
  }),
});

type NestedBoolFilterType = types.InputObjectType<{
  equals: types.Arg<typeof types.Boolean>;
  not: types.Arg<typeof NestedBoolFilter>;
}>;

const NestedBoolFilter: NestedBoolFilterType = types.inputObject({
  name: 'NestedBoolFilter',
  fields: () => ({
    equals: types.arg({ type: types.Boolean }),
    not: types.arg({ type: NestedBoolFilter }),
  }),
});

type BoolNullableListFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<types.ListType<types.NonNullType<typeof types.Boolean>>>;
  // can be null
  has: types.Arg<typeof types.Boolean>;
  hasEvery: types.Arg<types.ListType<types.NonNullType<typeof types.Boolean>>>;
  hasSome: types.Arg<types.ListType<types.NonNullType<typeof types.Boolean>>>;
  isEmpty: types.Arg<typeof types.Boolean>;
}>;

const BoolNullableListFilter: BoolNullableListFilterType = types.inputObject({
  name: 'BoolNullableListFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.list(types.nonNull(types.Boolean)) }),
    // can be null
    has: types.arg({ type: types.Boolean }),
    hasEvery: types.arg({ type: types.list(types.nonNull(types.Boolean)) }),
    hasSome: types.arg({ type: types.list(types.nonNull(types.Boolean)) }),
    isEmpty: types.arg({ type: types.Boolean }),
  }),
});

type IntNullableFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<typeof types.Int>;
  // can be null
  in: types.Arg<types.ListType<types.NonNullType<typeof types.Int>>>;
  // can be null
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.Int>>>;
  lt: types.Arg<typeof types.Int>;
  lte: types.Arg<typeof types.Int>;
  gt: types.Arg<typeof types.Int>;
  gte: types.Arg<typeof types.Int>;
  // can be null
  not: types.Arg<typeof NestedIntNullableFilter>;
}>;

const IntNullableFilter: IntNullableFilterType = types.inputObject({
  name: 'IntNullableFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.Int }),
    // can be null
    in: types.arg({ type: types.list(types.nonNull(types.Int)) }),
    // can be null
    notIn: types.arg({ type: types.list(types.nonNull(types.Int)) }),
    lt: types.arg({ type: types.Int }),
    lte: types.arg({ type: types.Int }),
    gt: types.arg({ type: types.Int }),
    gte: types.arg({ type: types.Int }),
    // can be null
    not: types.arg({ type: NestedIntNullableFilter }),
  }),
});

type NestedIntNullableFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<typeof types.Int>;
  // can be null
  in: types.Arg<types.ListType<types.NonNullType<typeof types.Int>>>;
  // can be null
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.Int>>>;
  lt: types.Arg<typeof types.Int>;
  lte: types.Arg<typeof types.Int>;
  gt: types.Arg<typeof types.Int>;
  gte: types.Arg<typeof types.Int>;
  // can be null
  not: types.Arg<typeof NestedIntNullableFilter>;
}>;

const NestedIntNullableFilter: NestedIntNullableFilterType = types.inputObject({
  name: 'NestedIntNullableFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.Int }),
    // can be null
    in: types.arg({ type: types.list(types.nonNull(types.Int)) }),
    // can be null
    notIn: types.arg({ type: types.list(types.nonNull(types.Int)) }),
    lt: types.arg({ type: types.Int }),
    lte: types.arg({ type: types.Int }),
    gt: types.arg({ type: types.Int }),
    gte: types.arg({ type: types.Int }),
    // can be null
    not: types.arg({ type: NestedIntNullableFilter }),
  }),
});

type IntFilterType = types.InputObjectType<{
  equals: types.Arg<typeof types.Int>;
  in: types.Arg<types.ListType<types.NonNullType<typeof types.Int>>>;
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.Int>>>;
  lt: types.Arg<typeof types.Int>;
  lte: types.Arg<typeof types.Int>;
  gt: types.Arg<typeof types.Int>;
  gte: types.Arg<typeof types.Int>;
  not: types.Arg<typeof NestedIntFilter>;
}>;

const IntFilter: IntFilterType = types.inputObject({
  name: 'IntFilter',
  fields: () => ({
    equals: types.arg({ type: types.Int }),
    in: types.arg({ type: types.list(types.nonNull(types.Int)) }),
    notIn: types.arg({ type: types.list(types.nonNull(types.Int)) }),
    lt: types.arg({ type: types.Int }),
    lte: types.arg({ type: types.Int }),
    gt: types.arg({ type: types.Int }),
    gte: types.arg({ type: types.Int }),
    not: types.arg({ type: NestedIntFilter }),
  }),
});

type NestedIntFilterType = types.InputObjectType<{
  equals: types.Arg<typeof types.Int>;
  in: types.Arg<types.ListType<types.NonNullType<typeof types.Int>>>;
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.Int>>>;
  lt: types.Arg<typeof types.Int>;
  lte: types.Arg<typeof types.Int>;
  gt: types.Arg<typeof types.Int>;
  gte: types.Arg<typeof types.Int>;
  not: types.Arg<typeof NestedIntFilter>;
}>;

const NestedIntFilter: NestedIntFilterType = types.inputObject({
  name: 'NestedIntFilter',
  fields: () => ({
    equals: types.arg({ type: types.Int }),
    in: types.arg({ type: types.list(types.nonNull(types.Int)) }),
    notIn: types.arg({ type: types.list(types.nonNull(types.Int)) }),
    lt: types.arg({ type: types.Int }),
    lte: types.arg({ type: types.Int }),
    gt: types.arg({ type: types.Int }),
    gte: types.arg({ type: types.Int }),
    not: types.arg({ type: NestedIntFilter }),
  }),
});

type IntNullableListFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<types.ListType<types.NonNullType<typeof types.Int>>>;
  // can be null
  has: types.Arg<typeof types.Int>;
  hasEvery: types.Arg<types.ListType<types.NonNullType<typeof types.Int>>>;
  hasSome: types.Arg<types.ListType<types.NonNullType<typeof types.Int>>>;
  isEmpty: types.Arg<typeof types.Boolean>;
}>;

const IntNullableListFilter: IntNullableListFilterType = types.inputObject({
  name: 'IntNullableListFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.list(types.nonNull(types.Int)) }),
    // can be null
    has: types.arg({ type: types.Int }),
    hasEvery: types.arg({ type: types.list(types.nonNull(types.Int)) }),
    hasSome: types.arg({ type: types.list(types.nonNull(types.Int)) }),
    isEmpty: types.arg({ type: types.Boolean }),
  }),
});

type FloatNullableFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<typeof types.Float>;
  // can be null
  in: types.Arg<types.ListType<types.NonNullType<typeof types.Float>>>;
  // can be null
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.Float>>>;
  lt: types.Arg<typeof types.Float>;
  lte: types.Arg<typeof types.Float>;
  gt: types.Arg<typeof types.Float>;
  gte: types.Arg<typeof types.Float>;
  // can be null
  not: types.Arg<typeof NestedFloatNullableFilter>;
}>;

const FloatNullableFilter: FloatNullableFilterType = types.inputObject({
  name: 'FloatNullableFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.Float }),
    // can be null
    in: types.arg({ type: types.list(types.nonNull(types.Float)) }),
    // can be null
    notIn: types.arg({ type: types.list(types.nonNull(types.Float)) }),
    lt: types.arg({ type: types.Float }),
    lte: types.arg({ type: types.Float }),
    gt: types.arg({ type: types.Float }),
    gte: types.arg({ type: types.Float }),
    // can be null
    not: types.arg({ type: NestedFloatNullableFilter }),
  }),
});

type NestedFloatNullableFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<typeof types.Float>;
  // can be null
  in: types.Arg<types.ListType<types.NonNullType<typeof types.Float>>>;
  // can be null
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.Float>>>;
  lt: types.Arg<typeof types.Float>;
  lte: types.Arg<typeof types.Float>;
  gt: types.Arg<typeof types.Float>;
  gte: types.Arg<typeof types.Float>;
  // can be null
  not: types.Arg<typeof NestedFloatNullableFilter>;
}>;

const NestedFloatNullableFilter: NestedFloatNullableFilterType = types.inputObject({
  name: 'NestedFloatNullableFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.Float }),
    // can be null
    in: types.arg({ type: types.list(types.nonNull(types.Float)) }),
    // can be null
    notIn: types.arg({ type: types.list(types.nonNull(types.Float)) }),
    lt: types.arg({ type: types.Float }),
    lte: types.arg({ type: types.Float }),
    gt: types.arg({ type: types.Float }),
    gte: types.arg({ type: types.Float }),
    // can be null
    not: types.arg({ type: NestedFloatNullableFilter }),
  }),
});

type FloatFilterType = types.InputObjectType<{
  equals: types.Arg<typeof types.Float>;
  in: types.Arg<types.ListType<types.NonNullType<typeof types.Float>>>;
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.Float>>>;
  lt: types.Arg<typeof types.Float>;
  lte: types.Arg<typeof types.Float>;
  gt: types.Arg<typeof types.Float>;
  gte: types.Arg<typeof types.Float>;
  not: types.Arg<typeof NestedFloatFilter>;
}>;

const FloatFilter: FloatFilterType = types.inputObject({
  name: 'FloatFilter',
  fields: () => ({
    equals: types.arg({ type: types.Float }),
    in: types.arg({ type: types.list(types.nonNull(types.Float)) }),
    notIn: types.arg({ type: types.list(types.nonNull(types.Float)) }),
    lt: types.arg({ type: types.Float }),
    lte: types.arg({ type: types.Float }),
    gt: types.arg({ type: types.Float }),
    gte: types.arg({ type: types.Float }),
    not: types.arg({ type: NestedFloatFilter }),
  }),
});

type NestedFloatFilterType = types.InputObjectType<{
  equals: types.Arg<typeof types.Float>;
  in: types.Arg<types.ListType<types.NonNullType<typeof types.Float>>>;
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.Float>>>;
  lt: types.Arg<typeof types.Float>;
  lte: types.Arg<typeof types.Float>;
  gt: types.Arg<typeof types.Float>;
  gte: types.Arg<typeof types.Float>;
  not: types.Arg<typeof NestedFloatFilter>;
}>;

const NestedFloatFilter: NestedFloatFilterType = types.inputObject({
  name: 'NestedFloatFilter',
  fields: () => ({
    equals: types.arg({ type: types.Float }),
    in: types.arg({ type: types.list(types.nonNull(types.Float)) }),
    notIn: types.arg({ type: types.list(types.nonNull(types.Float)) }),
    lt: types.arg({ type: types.Float }),
    lte: types.arg({ type: types.Float }),
    gt: types.arg({ type: types.Float }),
    gte: types.arg({ type: types.Float }),
    not: types.arg({ type: NestedFloatFilter }),
  }),
});

type FloatNullableListFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<types.ListType<types.NonNullType<typeof types.Float>>>;
  // can be null
  has: types.Arg<typeof types.Float>;
  hasEvery: types.Arg<types.ListType<types.NonNullType<typeof types.Float>>>;
  hasSome: types.Arg<types.ListType<types.NonNullType<typeof types.Float>>>;
  isEmpty: types.Arg<typeof types.Boolean>;
}>;

const FloatNullableListFilter: FloatNullableListFilterType = types.inputObject({
  name: 'FloatNullableListFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.list(types.nonNull(types.Float)) }),
    // can be null
    has: types.arg({ type: types.Float }),
    hasEvery: types.arg({ type: types.list(types.nonNull(types.Float)) }),
    hasSome: types.arg({ type: types.list(types.nonNull(types.Float)) }),
    isEmpty: types.arg({ type: types.Boolean }),
  }),
});

type DateTimeNullableFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<typeof types.String>;
  // can be null
  in: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  // can be null
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  lt: types.Arg<typeof types.String>;
  lte: types.Arg<typeof types.String>;
  gt: types.Arg<typeof types.String>;
  gte: types.Arg<typeof types.String>;
  // can be null
  not: types.Arg<typeof NestedDateTimeNullableFilter>;
}>;

const DateTimeNullableFilter: DateTimeNullableFilterType = types.inputObject({
  name: 'DateTimeNullableFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.String }),
    // can be null
    in: types.arg({ type: types.list(types.nonNull(types.String)) }),
    // can be null
    notIn: types.arg({ type: types.list(types.nonNull(types.String)) }),
    lt: types.arg({ type: types.String }),
    lte: types.arg({ type: types.String }),
    gt: types.arg({ type: types.String }),
    gte: types.arg({ type: types.String }),
    // can be null
    not: types.arg({ type: NestedDateTimeNullableFilter }),
  }),
});

type NestedDateTimeNullableFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<typeof types.String>;
  // can be null
  in: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  // can be null
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  lt: types.Arg<typeof types.String>;
  lte: types.Arg<typeof types.String>;
  gt: types.Arg<typeof types.String>;
  gte: types.Arg<typeof types.String>;
  // can be null
  not: types.Arg<typeof NestedDateTimeNullableFilter>;
}>;

const NestedDateTimeNullableFilter: NestedDateTimeNullableFilterType = types.inputObject({
  name: 'NestedDateTimeNullableFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.String }),
    // can be null
    in: types.arg({ type: types.list(types.nonNull(types.String)) }),
    // can be null
    notIn: types.arg({ type: types.list(types.nonNull(types.String)) }),
    lt: types.arg({ type: types.String }),
    lte: types.arg({ type: types.String }),
    gt: types.arg({ type: types.String }),
    gte: types.arg({ type: types.String }),
    // can be null
    not: types.arg({ type: NestedDateTimeNullableFilter }),
  }),
});

type DateTimeFilterType = types.InputObjectType<{
  equals: types.Arg<typeof types.String>;
  in: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  lt: types.Arg<typeof types.String>;
  lte: types.Arg<typeof types.String>;
  gt: types.Arg<typeof types.String>;
  gte: types.Arg<typeof types.String>;
  not: types.Arg<typeof NestedDateTimeFilter>;
}>;

const DateTimeFilter: DateTimeFilterType = types.inputObject({
  name: 'DateTimeFilter',
  fields: () => ({
    equals: types.arg({ type: types.String }),
    in: types.arg({ type: types.list(types.nonNull(types.String)) }),
    notIn: types.arg({ type: types.list(types.nonNull(types.String)) }),
    lt: types.arg({ type: types.String }),
    lte: types.arg({ type: types.String }),
    gt: types.arg({ type: types.String }),
    gte: types.arg({ type: types.String }),
    not: types.arg({ type: NestedDateTimeFilter }),
  }),
});

type NestedDateTimeFilterType = types.InputObjectType<{
  equals: types.Arg<typeof types.String>;
  in: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  lt: types.Arg<typeof types.String>;
  lte: types.Arg<typeof types.String>;
  gt: types.Arg<typeof types.String>;
  gte: types.Arg<typeof types.String>;
  not: types.Arg<typeof NestedDateTimeFilter>;
}>;

const NestedDateTimeFilter: NestedDateTimeFilterType = types.inputObject({
  name: 'NestedDateTimeFilter',
  fields: () => ({
    equals: types.arg({ type: types.String }),
    in: types.arg({ type: types.list(types.nonNull(types.String)) }),
    notIn: types.arg({ type: types.list(types.nonNull(types.String)) }),
    lt: types.arg({ type: types.String }),
    lte: types.arg({ type: types.String }),
    gt: types.arg({ type: types.String }),
    gte: types.arg({ type: types.String }),
    not: types.arg({ type: NestedDateTimeFilter }),
  }),
});

type DateTimeNullableListFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  // can be null
  has: types.Arg<typeof types.String>;
  hasEvery: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  hasSome: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  isEmpty: types.Arg<typeof types.Boolean>;
}>;

const DateTimeNullableListFilter: DateTimeNullableListFilterType = types.inputObject({
  name: 'DateTimeNullableListFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.list(types.nonNull(types.String)) }),
    // can be null
    has: types.arg({ type: types.String }),
    hasEvery: types.arg({ type: types.list(types.nonNull(types.String)) }),
    hasSome: types.arg({ type: types.list(types.nonNull(types.String)) }),
    isEmpty: types.arg({ type: types.Boolean }),
  }),
});

type BigIntNullableFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<typeof BigInt>;
  // can be null
  in: types.Arg<types.ListType<types.NonNullType<typeof BigInt>>>;
  // can be null
  notIn: types.Arg<types.ListType<types.NonNullType<typeof BigInt>>>;
  lt: types.Arg<typeof BigInt>;
  lte: types.Arg<typeof BigInt>;
  gt: types.Arg<typeof BigInt>;
  gte: types.Arg<typeof BigInt>;
  // can be null
  not: types.Arg<typeof NestedBigIntNullableFilter>;
}>;

const BigIntNullableFilter: BigIntNullableFilterType = types.inputObject({
  name: 'BigIntNullableFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: BigInt }),
    // can be null
    in: types.arg({ type: types.list(types.nonNull(BigInt)) }),
    // can be null
    notIn: types.arg({ type: types.list(types.nonNull(BigInt)) }),
    lt: types.arg({ type: BigInt }),
    lte: types.arg({ type: BigInt }),
    gt: types.arg({ type: BigInt }),
    gte: types.arg({ type: BigInt }),
    // can be null
    not: types.arg({ type: NestedBigIntNullableFilter }),
  }),
});

type NestedBigIntNullableFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<typeof BigInt>;
  // can be null
  in: types.Arg<types.ListType<types.NonNullType<typeof BigInt>>>;
  // can be null
  notIn: types.Arg<types.ListType<types.NonNullType<typeof BigInt>>>;
  lt: types.Arg<typeof BigInt>;
  lte: types.Arg<typeof BigInt>;
  gt: types.Arg<typeof BigInt>;
  gte: types.Arg<typeof BigInt>;
  // can be null
  not: types.Arg<typeof NestedBigIntNullableFilter>;
}>;

const NestedBigIntNullableFilter: NestedBigIntNullableFilterType = types.inputObject({
  name: 'NestedBigIntNullableFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: BigInt }),
    // can be null
    in: types.arg({ type: types.list(types.nonNull(BigInt)) }),
    // can be null
    notIn: types.arg({ type: types.list(types.nonNull(BigInt)) }),
    lt: types.arg({ type: BigInt }),
    lte: types.arg({ type: BigInt }),
    gt: types.arg({ type: BigInt }),
    gte: types.arg({ type: BigInt }),
    // can be null
    not: types.arg({ type: NestedBigIntNullableFilter }),
  }),
});

type BigIntFilterType = types.InputObjectType<{
  equals: types.Arg<typeof BigInt>;
  in: types.Arg<types.ListType<types.NonNullType<typeof BigInt>>>;
  notIn: types.Arg<types.ListType<types.NonNullType<typeof BigInt>>>;
  lt: types.Arg<typeof BigInt>;
  lte: types.Arg<typeof BigInt>;
  gt: types.Arg<typeof BigInt>;
  gte: types.Arg<typeof BigInt>;
  not: types.Arg<typeof NestedBigIntFilter>;
}>;

const BigIntFilter: BigIntFilterType = types.inputObject({
  name: 'BigIntFilter',
  fields: () => ({
    equals: types.arg({ type: BigInt }),
    in: types.arg({ type: types.list(types.nonNull(BigInt)) }),
    notIn: types.arg({ type: types.list(types.nonNull(BigInt)) }),
    lt: types.arg({ type: BigInt }),
    lte: types.arg({ type: BigInt }),
    gt: types.arg({ type: BigInt }),
    gte: types.arg({ type: BigInt }),
    not: types.arg({ type: NestedBigIntFilter }),
  }),
});

type NestedBigIntFilterType = types.InputObjectType<{
  equals: types.Arg<typeof BigInt>;
  in: types.Arg<types.ListType<types.NonNullType<typeof BigInt>>>;
  notIn: types.Arg<types.ListType<types.NonNullType<typeof BigInt>>>;
  lt: types.Arg<typeof BigInt>;
  lte: types.Arg<typeof BigInt>;
  gt: types.Arg<typeof BigInt>;
  gte: types.Arg<typeof BigInt>;
  not: types.Arg<typeof NestedBigIntFilter>;
}>;

const NestedBigIntFilter: NestedBigIntFilterType = types.inputObject({
  name: 'NestedBigIntFilter',
  fields: () => ({
    equals: types.arg({ type: BigInt }),
    in: types.arg({ type: types.list(types.nonNull(BigInt)) }),
    notIn: types.arg({ type: types.list(types.nonNull(BigInt)) }),
    lt: types.arg({ type: BigInt }),
    lte: types.arg({ type: BigInt }),
    gt: types.arg({ type: BigInt }),
    gte: types.arg({ type: BigInt }),
    not: types.arg({ type: NestedBigIntFilter }),
  }),
});

type BigIntNullableListFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<types.ListType<types.NonNullType<typeof BigInt>>>;
  // can be null
  has: types.Arg<typeof BigInt>;
  hasEvery: types.Arg<types.ListType<types.NonNullType<typeof BigInt>>>;
  hasSome: types.Arg<types.ListType<types.NonNullType<typeof BigInt>>>;
  isEmpty: types.Arg<typeof types.Boolean>;
}>;

const BigIntNullableListFilter: BigIntNullableListFilterType = types.inputObject({
  name: 'BigIntNullableListFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.list(types.nonNull(BigInt)) }),
    // can be null
    has: types.arg({ type: BigInt }),
    hasEvery: types.arg({ type: types.list(types.nonNull(BigInt)) }),
    hasSome: types.arg({ type: types.list(types.nonNull(BigInt)) }),
    isEmpty: types.arg({ type: types.Boolean }),
  }),
});

type JsonNullableFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<typeof types.JSON>;
  // can be null
  not: types.Arg<typeof types.JSON>;
}>;

const JsonNullableFilter: JsonNullableFilterType = types.inputObject({
  name: 'JsonNullableFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.JSON }),
    // can be null
    not: types.arg({ type: types.JSON }),
  }),
});

type JsonFilterType = types.InputObjectType<{
  equals: types.Arg<typeof types.JSON>;
  not: types.Arg<typeof types.JSON>;
}>;

const JsonFilter: JsonFilterType = types.inputObject({
  name: 'JsonFilter',
  fields: () => ({
    equals: types.arg({ type: types.JSON }),
    not: types.arg({ type: types.JSON }),
  }),
});

type JsonNullableListFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<types.ListType<types.NonNullType<typeof types.JSON>>>;
  // can be null
  has: types.Arg<typeof types.JSON>;
  hasEvery: types.Arg<types.ListType<types.NonNullType<typeof types.JSON>>>;
  hasSome: types.Arg<types.ListType<types.NonNullType<typeof types.JSON>>>;
  isEmpty: types.Arg<typeof types.Boolean>;
}>;

const JsonNullableListFilter: JsonNullableListFilterType = types.inputObject({
  name: 'JsonNullableListFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.list(types.nonNull(types.JSON)) }),
    // can be null
    has: types.arg({ type: types.JSON }),
    hasEvery: types.arg({ type: types.list(types.nonNull(types.JSON)) }),
    hasSome: types.arg({ type: types.list(types.nonNull(types.JSON)) }),
    isEmpty: types.arg({ type: types.Boolean }),
  }),
});

type DecimalNullableFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<typeof types.String>;
  // can be null
  in: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  // can be null
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  lt: types.Arg<typeof types.String>;
  lte: types.Arg<typeof types.String>;
  gt: types.Arg<typeof types.String>;
  gte: types.Arg<typeof types.String>;
  // can be null
  not: types.Arg<typeof NestedDecimalNullableFilter>;
}>;

const DecimalNullableFilter: DecimalNullableFilterType = types.inputObject({
  name: 'DecimalNullableFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.String }),
    // can be null
    in: types.arg({ type: types.list(types.nonNull(types.String)) }),
    // can be null
    notIn: types.arg({ type: types.list(types.nonNull(types.String)) }),
    lt: types.arg({ type: types.String }),
    lte: types.arg({ type: types.String }),
    gt: types.arg({ type: types.String }),
    gte: types.arg({ type: types.String }),
    // can be null
    not: types.arg({ type: NestedDecimalNullableFilter }),
  }),
});

type NestedDecimalNullableFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<typeof types.String>;
  // can be null
  in: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  // can be null
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  lt: types.Arg<typeof types.String>;
  lte: types.Arg<typeof types.String>;
  gt: types.Arg<typeof types.String>;
  gte: types.Arg<typeof types.String>;
  // can be null
  not: types.Arg<typeof NestedDecimalNullableFilter>;
}>;

const NestedDecimalNullableFilter: NestedDecimalNullableFilterType = types.inputObject({
  name: 'NestedDecimalNullableFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.String }),
    // can be null
    in: types.arg({ type: types.list(types.nonNull(types.String)) }),
    // can be null
    notIn: types.arg({ type: types.list(types.nonNull(types.String)) }),
    lt: types.arg({ type: types.String }),
    lte: types.arg({ type: types.String }),
    gt: types.arg({ type: types.String }),
    gte: types.arg({ type: types.String }),
    // can be null
    not: types.arg({ type: NestedDecimalNullableFilter }),
  }),
});

type DecimalFilterType = types.InputObjectType<{
  equals: types.Arg<typeof types.String>;
  in: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  lt: types.Arg<typeof types.String>;
  lte: types.Arg<typeof types.String>;
  gt: types.Arg<typeof types.String>;
  gte: types.Arg<typeof types.String>;
  not: types.Arg<typeof NestedDecimalFilter>;
}>;

const DecimalFilter: DecimalFilterType = types.inputObject({
  name: 'DecimalFilter',
  fields: () => ({
    equals: types.arg({ type: types.String }),
    in: types.arg({ type: types.list(types.nonNull(types.String)) }),
    notIn: types.arg({ type: types.list(types.nonNull(types.String)) }),
    lt: types.arg({ type: types.String }),
    lte: types.arg({ type: types.String }),
    gt: types.arg({ type: types.String }),
    gte: types.arg({ type: types.String }),
    not: types.arg({ type: NestedDecimalFilter }),
  }),
});

type NestedDecimalFilterType = types.InputObjectType<{
  equals: types.Arg<typeof types.String>;
  in: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  lt: types.Arg<typeof types.String>;
  lte: types.Arg<typeof types.String>;
  gt: types.Arg<typeof types.String>;
  gte: types.Arg<typeof types.String>;
  not: types.Arg<typeof NestedDecimalFilter>;
}>;

const NestedDecimalFilter: NestedDecimalFilterType = types.inputObject({
  name: 'NestedDecimalFilter',
  fields: () => ({
    equals: types.arg({ type: types.String }),
    in: types.arg({ type: types.list(types.nonNull(types.String)) }),
    notIn: types.arg({ type: types.list(types.nonNull(types.String)) }),
    lt: types.arg({ type: types.String }),
    lte: types.arg({ type: types.String }),
    gt: types.arg({ type: types.String }),
    gte: types.arg({ type: types.String }),
    not: types.arg({ type: NestedDecimalFilter }),
  }),
});

type DecimalNullableListFilterType = types.InputObjectType<{
  // can be null
  equals: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  // can be null
  has: types.Arg<typeof types.String>;
  hasEvery: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  hasSome: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  isEmpty: types.Arg<typeof types.Boolean>;
}>;

const DecimalNullableListFilter: DecimalNullableListFilterType = types.inputObject({
  name: 'DecimalNullableListFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.list(types.nonNull(types.String)) }),
    // can be null
    has: types.arg({ type: types.String }),
    hasEvery: types.arg({ type: types.list(types.nonNull(types.String)) }),
    hasSome: types.arg({ type: types.list(types.nonNull(types.String)) }),
    isEmpty: types.arg({ type: types.Boolean }),
  }),
});

export const String = {
  optional: StringNullableFilter,
  required: StringFilter,
  many: StringNullableListFilter,
};

export const Boolean = {
  optional: BoolNullableFilter,
  required: BoolFilter,
  many: BoolNullableListFilter,
};

export const Int = {
  optional: IntNullableFilter,
  required: IntFilter,
  many: IntNullableListFilter,
};

export const Float = {
  optional: FloatNullableFilter,
  required: FloatFilter,
  many: FloatNullableListFilter,
};

export const DateTime = {
  optional: DateTimeNullableFilter,
  required: DateTimeFilter,
  many: DateTimeNullableListFilter,
};

export const BigInt = {
  optional: BigIntNullableFilter,
  required: BigIntFilter,
  many: BigIntNullableListFilter,
};

export const Json = {
  optional: JsonNullableFilter,
  required: JsonFilter,
  many: JsonNullableListFilter,
};

export const Decimal = {
  optional: DecimalNullableFilter,
  required: DecimalFilter,
  many: DecimalNullableListFilter,
};

export { enumFilters as enum } from '../enum-filter';
