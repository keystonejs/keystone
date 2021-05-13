import { types, tsgql } from '../../next-fields';

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

export const String = {
  optional: StringNullableFilter,
  required: StringFilter,
};

export const Boolean = {
  optional: BoolNullableFilter,
  required: BoolFilter,
};

export const Int = {
  optional: IntNullableFilter,
  required: IntFilter,
};

export const Float = {
  optional: FloatNullableFilter,
  required: FloatFilter,
};

export const DateTime = {
  optional: DateTimeNullableFilter,
  required: DateTimeFilter,
};

export const BigInt = {
  optional: BigIntNullableFilter,
  required: BigIntFilter,
};

export { enumFilters as enum } from '../enum-filter';
