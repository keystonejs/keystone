import { types, tsgql } from '../../next-fields';
const QueryMode = types.enum({
  name: 'QueryMode',
  values: types.enumValues(['default', 'insensitive']),
});

type StringNullableFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<typeof types.String>;
  // can be null
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  // can be null
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  lt: tsgql.Arg<typeof types.String>;
  lte: tsgql.Arg<typeof types.String>;
  gt: tsgql.Arg<typeof types.String>;
  gte: tsgql.Arg<typeof types.String>;
  contains: tsgql.Arg<typeof types.String>;
  startsWith: tsgql.Arg<typeof types.String>;
  endsWith: tsgql.Arg<typeof types.String>;
  mode: tsgql.Arg<typeof QueryMode>;
  // can be null
  not: tsgql.Arg<typeof NestedStringNullableFilter>;
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

type NestedStringNullableFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<typeof types.String>;
  // can be null
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  // can be null
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  lt: tsgql.Arg<typeof types.String>;
  lte: tsgql.Arg<typeof types.String>;
  gt: tsgql.Arg<typeof types.String>;
  gte: tsgql.Arg<typeof types.String>;
  contains: tsgql.Arg<typeof types.String>;
  startsWith: tsgql.Arg<typeof types.String>;
  endsWith: tsgql.Arg<typeof types.String>;
  // can be null
  not: tsgql.Arg<typeof NestedStringNullableFilter>;
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

type StringFilterType = tsgql.InputObjectType<{
  equals: tsgql.Arg<typeof types.String>;
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  lt: tsgql.Arg<typeof types.String>;
  lte: tsgql.Arg<typeof types.String>;
  gt: tsgql.Arg<typeof types.String>;
  gte: tsgql.Arg<typeof types.String>;
  contains: tsgql.Arg<typeof types.String>;
  startsWith: tsgql.Arg<typeof types.String>;
  endsWith: tsgql.Arg<typeof types.String>;
  mode: tsgql.Arg<typeof QueryMode>;
  not: tsgql.Arg<typeof NestedStringFilter>;
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

type NestedStringFilterType = tsgql.InputObjectType<{
  equals: tsgql.Arg<typeof types.String>;
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  lt: tsgql.Arg<typeof types.String>;
  lte: tsgql.Arg<typeof types.String>;
  gt: tsgql.Arg<typeof types.String>;
  gte: tsgql.Arg<typeof types.String>;
  contains: tsgql.Arg<typeof types.String>;
  startsWith: tsgql.Arg<typeof types.String>;
  endsWith: tsgql.Arg<typeof types.String>;
  not: tsgql.Arg<typeof NestedStringFilter>;
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

type StringNullableListFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  // can be null
  has: tsgql.Arg<typeof types.String>;
  hasEvery: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  hasSome: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  isEmpty: tsgql.Arg<typeof types.Boolean>;
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

type BoolNullableFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<typeof types.Boolean>;
  // can be null
  not: tsgql.Arg<typeof NestedBoolNullableFilter>;
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

type NestedBoolNullableFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<typeof types.Boolean>;
  // can be null
  not: tsgql.Arg<typeof NestedBoolNullableFilter>;
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

type BoolFilterType = tsgql.InputObjectType<{
  equals: tsgql.Arg<typeof types.Boolean>;
  not: tsgql.Arg<typeof NestedBoolFilter>;
}>;

const BoolFilter: BoolFilterType = types.inputObject({
  name: 'BoolFilter',
  fields: () => ({
    equals: types.arg({ type: types.Boolean }),
    not: types.arg({ type: NestedBoolFilter }),
  }),
});

type NestedBoolFilterType = tsgql.InputObjectType<{
  equals: tsgql.Arg<typeof types.Boolean>;
  not: tsgql.Arg<typeof NestedBoolFilter>;
}>;

const NestedBoolFilter: NestedBoolFilterType = types.inputObject({
  name: 'NestedBoolFilter',
  fields: () => ({
    equals: types.arg({ type: types.Boolean }),
    not: types.arg({ type: NestedBoolFilter }),
  }),
});

type BoolNullableListFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Boolean>>>;
  // can be null
  has: tsgql.Arg<typeof types.Boolean>;
  hasEvery: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Boolean>>>;
  hasSome: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Boolean>>>;
  isEmpty: tsgql.Arg<typeof types.Boolean>;
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

type IntNullableFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<typeof types.Int>;
  // can be null
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Int>>>;
  // can be null
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Int>>>;
  lt: tsgql.Arg<typeof types.Int>;
  lte: tsgql.Arg<typeof types.Int>;
  gt: tsgql.Arg<typeof types.Int>;
  gte: tsgql.Arg<typeof types.Int>;
  // can be null
  not: tsgql.Arg<typeof NestedIntNullableFilter>;
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

type NestedIntNullableFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<typeof types.Int>;
  // can be null
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Int>>>;
  // can be null
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Int>>>;
  lt: tsgql.Arg<typeof types.Int>;
  lte: tsgql.Arg<typeof types.Int>;
  gt: tsgql.Arg<typeof types.Int>;
  gte: tsgql.Arg<typeof types.Int>;
  // can be null
  not: tsgql.Arg<typeof NestedIntNullableFilter>;
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

type IntFilterType = tsgql.InputObjectType<{
  equals: tsgql.Arg<typeof types.Int>;
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Int>>>;
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Int>>>;
  lt: tsgql.Arg<typeof types.Int>;
  lte: tsgql.Arg<typeof types.Int>;
  gt: tsgql.Arg<typeof types.Int>;
  gte: tsgql.Arg<typeof types.Int>;
  not: tsgql.Arg<typeof NestedIntFilter>;
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

type NestedIntFilterType = tsgql.InputObjectType<{
  equals: tsgql.Arg<typeof types.Int>;
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Int>>>;
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Int>>>;
  lt: tsgql.Arg<typeof types.Int>;
  lte: tsgql.Arg<typeof types.Int>;
  gt: tsgql.Arg<typeof types.Int>;
  gte: tsgql.Arg<typeof types.Int>;
  not: tsgql.Arg<typeof NestedIntFilter>;
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

type IntNullableListFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Int>>>;
  // can be null
  has: tsgql.Arg<typeof types.Int>;
  hasEvery: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Int>>>;
  hasSome: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Int>>>;
  isEmpty: tsgql.Arg<typeof types.Boolean>;
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

type FloatNullableFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<typeof types.Float>;
  // can be null
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Float>>>;
  // can be null
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Float>>>;
  lt: tsgql.Arg<typeof types.Float>;
  lte: tsgql.Arg<typeof types.Float>;
  gt: tsgql.Arg<typeof types.Float>;
  gte: tsgql.Arg<typeof types.Float>;
  // can be null
  not: tsgql.Arg<typeof NestedFloatNullableFilter>;
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

type NestedFloatNullableFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<typeof types.Float>;
  // can be null
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Float>>>;
  // can be null
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Float>>>;
  lt: tsgql.Arg<typeof types.Float>;
  lte: tsgql.Arg<typeof types.Float>;
  gt: tsgql.Arg<typeof types.Float>;
  gte: tsgql.Arg<typeof types.Float>;
  // can be null
  not: tsgql.Arg<typeof NestedFloatNullableFilter>;
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

type FloatFilterType = tsgql.InputObjectType<{
  equals: tsgql.Arg<typeof types.Float>;
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Float>>>;
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Float>>>;
  lt: tsgql.Arg<typeof types.Float>;
  lte: tsgql.Arg<typeof types.Float>;
  gt: tsgql.Arg<typeof types.Float>;
  gte: tsgql.Arg<typeof types.Float>;
  not: tsgql.Arg<typeof NestedFloatFilter>;
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

type NestedFloatFilterType = tsgql.InputObjectType<{
  equals: tsgql.Arg<typeof types.Float>;
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Float>>>;
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Float>>>;
  lt: tsgql.Arg<typeof types.Float>;
  lte: tsgql.Arg<typeof types.Float>;
  gt: tsgql.Arg<typeof types.Float>;
  gte: tsgql.Arg<typeof types.Float>;
  not: tsgql.Arg<typeof NestedFloatFilter>;
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

type FloatNullableListFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Float>>>;
  // can be null
  has: tsgql.Arg<typeof types.Float>;
  hasEvery: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Float>>>;
  hasSome: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Float>>>;
  isEmpty: tsgql.Arg<typeof types.Boolean>;
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

type DateTimeNullableFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<typeof types.String>;
  // can be null
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  // can be null
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  lt: tsgql.Arg<typeof types.String>;
  lte: tsgql.Arg<typeof types.String>;
  gt: tsgql.Arg<typeof types.String>;
  gte: tsgql.Arg<typeof types.String>;
  // can be null
  not: tsgql.Arg<typeof NestedDateTimeNullableFilter>;
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

type NestedDateTimeNullableFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<typeof types.String>;
  // can be null
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  // can be null
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  lt: tsgql.Arg<typeof types.String>;
  lte: tsgql.Arg<typeof types.String>;
  gt: tsgql.Arg<typeof types.String>;
  gte: tsgql.Arg<typeof types.String>;
  // can be null
  not: tsgql.Arg<typeof NestedDateTimeNullableFilter>;
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

type DateTimeFilterType = tsgql.InputObjectType<{
  equals: tsgql.Arg<typeof types.String>;
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  lt: tsgql.Arg<typeof types.String>;
  lte: tsgql.Arg<typeof types.String>;
  gt: tsgql.Arg<typeof types.String>;
  gte: tsgql.Arg<typeof types.String>;
  not: tsgql.Arg<typeof NestedDateTimeFilter>;
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

type NestedDateTimeFilterType = tsgql.InputObjectType<{
  equals: tsgql.Arg<typeof types.String>;
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  lt: tsgql.Arg<typeof types.String>;
  lte: tsgql.Arg<typeof types.String>;
  gt: tsgql.Arg<typeof types.String>;
  gte: tsgql.Arg<typeof types.String>;
  not: tsgql.Arg<typeof NestedDateTimeFilter>;
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

type DateTimeNullableListFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  // can be null
  has: tsgql.Arg<typeof types.String>;
  hasEvery: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  hasSome: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  isEmpty: tsgql.Arg<typeof types.Boolean>;
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

type BigIntNullableFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<typeof types.String>;
  // can be null
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  // can be null
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  lt: tsgql.Arg<typeof types.String>;
  lte: tsgql.Arg<typeof types.String>;
  gt: tsgql.Arg<typeof types.String>;
  gte: tsgql.Arg<typeof types.String>;
  // can be null
  not: tsgql.Arg<typeof NestedBigIntNullableFilter>;
}>;

const BigIntNullableFilter: BigIntNullableFilterType = types.inputObject({
  name: 'BigIntNullableFilter',
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
    not: types.arg({ type: NestedBigIntNullableFilter }),
  }),
});

type NestedBigIntNullableFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<typeof types.String>;
  // can be null
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  // can be null
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  lt: tsgql.Arg<typeof types.String>;
  lte: tsgql.Arg<typeof types.String>;
  gt: tsgql.Arg<typeof types.String>;
  gte: tsgql.Arg<typeof types.String>;
  // can be null
  not: tsgql.Arg<typeof NestedBigIntNullableFilter>;
}>;

const NestedBigIntNullableFilter: NestedBigIntNullableFilterType = types.inputObject({
  name: 'NestedBigIntNullableFilter',
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
    not: types.arg({ type: NestedBigIntNullableFilter }),
  }),
});

type BigIntFilterType = tsgql.InputObjectType<{
  equals: tsgql.Arg<typeof types.String>;
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  lt: tsgql.Arg<typeof types.String>;
  lte: tsgql.Arg<typeof types.String>;
  gt: tsgql.Arg<typeof types.String>;
  gte: tsgql.Arg<typeof types.String>;
  not: tsgql.Arg<typeof NestedBigIntFilter>;
}>;

const BigIntFilter: BigIntFilterType = types.inputObject({
  name: 'BigIntFilter',
  fields: () => ({
    equals: types.arg({ type: types.String }),
    in: types.arg({ type: types.list(types.nonNull(types.String)) }),
    notIn: types.arg({ type: types.list(types.nonNull(types.String)) }),
    lt: types.arg({ type: types.String }),
    lte: types.arg({ type: types.String }),
    gt: types.arg({ type: types.String }),
    gte: types.arg({ type: types.String }),
    not: types.arg({ type: NestedBigIntFilter }),
  }),
});

type NestedBigIntFilterType = tsgql.InputObjectType<{
  equals: tsgql.Arg<typeof types.String>;
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  lt: tsgql.Arg<typeof types.String>;
  lte: tsgql.Arg<typeof types.String>;
  gt: tsgql.Arg<typeof types.String>;
  gte: tsgql.Arg<typeof types.String>;
  not: tsgql.Arg<typeof NestedBigIntFilter>;
}>;

const NestedBigIntFilter: NestedBigIntFilterType = types.inputObject({
  name: 'NestedBigIntFilter',
  fields: () => ({
    equals: types.arg({ type: types.String }),
    in: types.arg({ type: types.list(types.nonNull(types.String)) }),
    notIn: types.arg({ type: types.list(types.nonNull(types.String)) }),
    lt: types.arg({ type: types.String }),
    lte: types.arg({ type: types.String }),
    gt: types.arg({ type: types.String }),
    gte: types.arg({ type: types.String }),
    not: types.arg({ type: NestedBigIntFilter }),
  }),
});

type BigIntNullableListFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  // can be null
  has: tsgql.Arg<typeof types.String>;
  hasEvery: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  hasSome: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.String>>>;
  isEmpty: tsgql.Arg<typeof types.Boolean>;
}>;

const BigIntNullableListFilter: BigIntNullableListFilterType = types.inputObject({
  name: 'BigIntNullableListFilter',
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

type JsonNullableFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<typeof types.JSON>;
  // can be null
  not: tsgql.Arg<typeof types.JSON>;
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

type JsonFilterType = tsgql.InputObjectType<{
  equals: tsgql.Arg<typeof types.JSON>;
  not: tsgql.Arg<typeof types.JSON>;
}>;

const JsonFilter: JsonFilterType = types.inputObject({
  name: 'JsonFilter',
  fields: () => ({
    equals: types.arg({ type: types.JSON }),
    not: types.arg({ type: types.JSON }),
  }),
});

type JsonNullableListFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.JSON>>>;
  // can be null
  has: tsgql.Arg<typeof types.JSON>;
  hasEvery: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.JSON>>>;
  hasSome: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.JSON>>>;
  isEmpty: tsgql.Arg<typeof types.Boolean>;
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

type DecimalNullableFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<typeof types.Decimal>;
  // can be null
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Decimal>>>;
  // can be null
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Decimal>>>;
  lt: tsgql.Arg<typeof types.Decimal>;
  lte: tsgql.Arg<typeof types.Decimal>;
  gt: tsgql.Arg<typeof types.Decimal>;
  gte: tsgql.Arg<typeof types.Decimal>;
  // can be null
  not: tsgql.Arg<typeof NestedDecimalNullableFilter>;
}>;

const DecimalNullableFilter: DecimalNullableFilterType = types.inputObject({
  name: 'DecimalNullableFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.Decimal }),
    // can be null
    in: types.arg({ type: types.list(types.nonNull(types.Decimal)) }),
    // can be null
    notIn: types.arg({ type: types.list(types.nonNull(types.Decimal)) }),
    lt: types.arg({ type: types.Decimal }),
    lte: types.arg({ type: types.Decimal }),
    gt: types.arg({ type: types.Decimal }),
    gte: types.arg({ type: types.Decimal }),
    // can be null
    not: types.arg({ type: NestedDecimalNullableFilter }),
  }),
});

type NestedDecimalNullableFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<typeof types.Decimal>;
  // can be null
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Decimal>>>;
  // can be null
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Decimal>>>;
  lt: tsgql.Arg<typeof types.Decimal>;
  lte: tsgql.Arg<typeof types.Decimal>;
  gt: tsgql.Arg<typeof types.Decimal>;
  gte: tsgql.Arg<typeof types.Decimal>;
  // can be null
  not: tsgql.Arg<typeof NestedDecimalNullableFilter>;
}>;

const NestedDecimalNullableFilter: NestedDecimalNullableFilterType = types.inputObject({
  name: 'NestedDecimalNullableFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.Decimal }),
    // can be null
    in: types.arg({ type: types.list(types.nonNull(types.Decimal)) }),
    // can be null
    notIn: types.arg({ type: types.list(types.nonNull(types.Decimal)) }),
    lt: types.arg({ type: types.Decimal }),
    lte: types.arg({ type: types.Decimal }),
    gt: types.arg({ type: types.Decimal }),
    gte: types.arg({ type: types.Decimal }),
    // can be null
    not: types.arg({ type: NestedDecimalNullableFilter }),
  }),
});

type DecimalFilterType = tsgql.InputObjectType<{
  equals: tsgql.Arg<typeof types.Decimal>;
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Decimal>>>;
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Decimal>>>;
  lt: tsgql.Arg<typeof types.Decimal>;
  lte: tsgql.Arg<typeof types.Decimal>;
  gt: tsgql.Arg<typeof types.Decimal>;
  gte: tsgql.Arg<typeof types.Decimal>;
  not: tsgql.Arg<typeof NestedDecimalFilter>;
}>;

const DecimalFilter: DecimalFilterType = types.inputObject({
  name: 'DecimalFilter',
  fields: () => ({
    equals: types.arg({ type: types.Decimal }),
    in: types.arg({ type: types.list(types.nonNull(types.Decimal)) }),
    notIn: types.arg({ type: types.list(types.nonNull(types.Decimal)) }),
    lt: types.arg({ type: types.Decimal }),
    lte: types.arg({ type: types.Decimal }),
    gt: types.arg({ type: types.Decimal }),
    gte: types.arg({ type: types.Decimal }),
    not: types.arg({ type: NestedDecimalFilter }),
  }),
});

type NestedDecimalFilterType = tsgql.InputObjectType<{
  equals: tsgql.Arg<typeof types.Decimal>;
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Decimal>>>;
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Decimal>>>;
  lt: tsgql.Arg<typeof types.Decimal>;
  lte: tsgql.Arg<typeof types.Decimal>;
  gt: tsgql.Arg<typeof types.Decimal>;
  gte: tsgql.Arg<typeof types.Decimal>;
  not: tsgql.Arg<typeof NestedDecimalFilter>;
}>;

const NestedDecimalFilter: NestedDecimalFilterType = types.inputObject({
  name: 'NestedDecimalFilter',
  fields: () => ({
    equals: types.arg({ type: types.Decimal }),
    in: types.arg({ type: types.list(types.nonNull(types.Decimal)) }),
    notIn: types.arg({ type: types.list(types.nonNull(types.Decimal)) }),
    lt: types.arg({ type: types.Decimal }),
    lte: types.arg({ type: types.Decimal }),
    gt: types.arg({ type: types.Decimal }),
    gte: types.arg({ type: types.Decimal }),
    not: types.arg({ type: NestedDecimalFilter }),
  }),
});

type DecimalNullableListFilterType = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Decimal>>>;
  // can be null
  has: tsgql.Arg<typeof types.Decimal>;
  hasEvery: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Decimal>>>;
  hasSome: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<typeof types.Decimal>>>;
  isEmpty: tsgql.Arg<typeof types.Boolean>;
}>;

const DecimalNullableListFilter: DecimalNullableListFilterType = types.inputObject({
  name: 'DecimalNullableListFilter',
  fields: () => ({
    // can be null
    equals: types.arg({ type: types.list(types.nonNull(types.Decimal)) }),
    // can be null
    has: types.arg({ type: types.Decimal }),
    hasEvery: types.arg({ type: types.list(types.nonNull(types.Decimal)) }),
    hasSome: types.arg({ type: types.list(types.nonNull(types.Decimal)) }),
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
