import { types } from '../..';

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

type BigIntNullableFilterType = types.InputObjectType<{
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
  not: types.Arg<typeof NestedBigIntNullableFilter>;
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

type NestedBigIntNullableFilterType = types.InputObjectType<{
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
  not: types.Arg<typeof NestedBigIntNullableFilter>;
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

type BigIntFilterType = types.InputObjectType<{
  equals: types.Arg<typeof types.String>;
  in: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  lt: types.Arg<typeof types.String>;
  lte: types.Arg<typeof types.String>;
  gt: types.Arg<typeof types.String>;
  gte: types.Arg<typeof types.String>;
  not: types.Arg<typeof NestedBigIntFilter>;
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

type NestedBigIntFilterType = types.InputObjectType<{
  equals: types.Arg<typeof types.String>;
  in: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  notIn: types.Arg<types.ListType<types.NonNullType<typeof types.String>>>;
  lt: types.Arg<typeof types.String>;
  lte: types.Arg<typeof types.String>;
  gt: types.Arg<typeof types.String>;
  gte: types.Arg<typeof types.String>;
  not: types.Arg<typeof NestedBigIntFilter>;
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

export const Decimal = {
  optional: DecimalNullableFilter,
  required: DecimalFilter,
};

export { enumFilters as enum } from '../enum-filter';
