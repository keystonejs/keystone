import { schema } from '../../schema';

const QueryMode = schema.enum({
  name: 'QueryMode',
  values: schema.enumValues(['default', 'insensitive']),
});

type StringNullableFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<typeof schema.String, undefined>;
  // can be null
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  // can be null
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  lt: schema.Arg<typeof schema.String, undefined>;
  lte: schema.Arg<typeof schema.String, undefined>;
  gt: schema.Arg<typeof schema.String, undefined>;
  gte: schema.Arg<typeof schema.String, undefined>;
  contains: schema.Arg<typeof schema.String, undefined>;
  startsWith: schema.Arg<typeof schema.String, undefined>;
  endsWith: schema.Arg<typeof schema.String, undefined>;
  mode: schema.Arg<typeof QueryMode, undefined>;
  // can be null
  not: schema.Arg<typeof NestedStringNullableFilter, undefined>;
}>;

const StringNullableFilter: StringNullableFilterType = schema.inputObject({
  name: 'StringNullableFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.String }),
    // can be null
    in: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    // can be null
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    lt: schema.arg({ type: schema.String }),
    lte: schema.arg({ type: schema.String }),
    gt: schema.arg({ type: schema.String }),
    gte: schema.arg({ type: schema.String }),
    contains: schema.arg({ type: schema.String }),
    startsWith: schema.arg({ type: schema.String }),
    endsWith: schema.arg({ type: schema.String }),
    mode: schema.arg({ type: QueryMode }),
    // can be null
    not: schema.arg({ type: NestedStringNullableFilter }),
  }),
});

type NestedStringNullableFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<typeof schema.String, undefined>;
  // can be null
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  // can be null
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  lt: schema.Arg<typeof schema.String, undefined>;
  lte: schema.Arg<typeof schema.String, undefined>;
  gt: schema.Arg<typeof schema.String, undefined>;
  gte: schema.Arg<typeof schema.String, undefined>;
  contains: schema.Arg<typeof schema.String, undefined>;
  startsWith: schema.Arg<typeof schema.String, undefined>;
  endsWith: schema.Arg<typeof schema.String, undefined>;
  // can be null
  not: schema.Arg<typeof NestedStringNullableFilter, undefined>;
}>;

const NestedStringNullableFilter: NestedStringNullableFilterType = schema.inputObject({
  name: 'NestedStringNullableFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.String }),
    // can be null
    in: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    // can be null
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    lt: schema.arg({ type: schema.String }),
    lte: schema.arg({ type: schema.String }),
    gt: schema.arg({ type: schema.String }),
    gte: schema.arg({ type: schema.String }),
    contains: schema.arg({ type: schema.String }),
    startsWith: schema.arg({ type: schema.String }),
    endsWith: schema.arg({ type: schema.String }),
    // can be null
    not: schema.arg({ type: NestedStringNullableFilter }),
  }),
});

type StringFilterType = schema.InputObjectType<{
  equals: schema.Arg<typeof schema.String, undefined>;
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  lt: schema.Arg<typeof schema.String, undefined>;
  lte: schema.Arg<typeof schema.String, undefined>;
  gt: schema.Arg<typeof schema.String, undefined>;
  gte: schema.Arg<typeof schema.String, undefined>;
  contains: schema.Arg<typeof schema.String, undefined>;
  startsWith: schema.Arg<typeof schema.String, undefined>;
  endsWith: schema.Arg<typeof schema.String, undefined>;
  mode: schema.Arg<typeof QueryMode, undefined>;
  not: schema.Arg<typeof NestedStringFilter, undefined>;
}>;

const StringFilter: StringFilterType = schema.inputObject({
  name: 'StringFilter',
  fields: () => ({
    equals: schema.arg({ type: schema.String }),
    in: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    lt: schema.arg({ type: schema.String }),
    lte: schema.arg({ type: schema.String }),
    gt: schema.arg({ type: schema.String }),
    gte: schema.arg({ type: schema.String }),
    contains: schema.arg({ type: schema.String }),
    startsWith: schema.arg({ type: schema.String }),
    endsWith: schema.arg({ type: schema.String }),
    mode: schema.arg({ type: QueryMode }),
    not: schema.arg({ type: NestedStringFilter }),
  }),
});

type NestedStringFilterType = schema.InputObjectType<{
  equals: schema.Arg<typeof schema.String, undefined>;
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  lt: schema.Arg<typeof schema.String, undefined>;
  lte: schema.Arg<typeof schema.String, undefined>;
  gt: schema.Arg<typeof schema.String, undefined>;
  gte: schema.Arg<typeof schema.String, undefined>;
  contains: schema.Arg<typeof schema.String, undefined>;
  startsWith: schema.Arg<typeof schema.String, undefined>;
  endsWith: schema.Arg<typeof schema.String, undefined>;
  not: schema.Arg<typeof NestedStringFilter, undefined>;
}>;

const NestedStringFilter: NestedStringFilterType = schema.inputObject({
  name: 'NestedStringFilter',
  fields: () => ({
    equals: schema.arg({ type: schema.String }),
    in: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    lt: schema.arg({ type: schema.String }),
    lte: schema.arg({ type: schema.String }),
    gt: schema.arg({ type: schema.String }),
    gte: schema.arg({ type: schema.String }),
    contains: schema.arg({ type: schema.String }),
    startsWith: schema.arg({ type: schema.String }),
    endsWith: schema.arg({ type: schema.String }),
    not: schema.arg({ type: NestedStringFilter }),
  }),
});

type StringNullableListFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  // can be null
  has: schema.Arg<typeof schema.String, undefined>;
  hasEvery: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  hasSome: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  isEmpty: schema.Arg<typeof schema.Boolean, undefined>;
}>;

const StringNullableListFilter: StringNullableListFilterType = schema.inputObject({
  name: 'StringNullableListFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    // can be null
    has: schema.arg({ type: schema.String }),
    hasEvery: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    hasSome: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    isEmpty: schema.arg({ type: schema.Boolean }),
  }),
});

type BoolNullableFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<typeof schema.Boolean, undefined>;
  // can be null
  not: schema.Arg<typeof NestedBoolNullableFilter, undefined>;
}>;

const BoolNullableFilter: BoolNullableFilterType = schema.inputObject({
  name: 'BoolNullableFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.Boolean }),
    // can be null
    not: schema.arg({ type: NestedBoolNullableFilter }),
  }),
});

type NestedBoolNullableFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<typeof schema.Boolean, undefined>;
  // can be null
  not: schema.Arg<typeof NestedBoolNullableFilter, undefined>;
}>;

const NestedBoolNullableFilter: NestedBoolNullableFilterType = schema.inputObject({
  name: 'NestedBoolNullableFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.Boolean }),
    // can be null
    not: schema.arg({ type: NestedBoolNullableFilter }),
  }),
});

type BoolFilterType = schema.InputObjectType<{
  equals: schema.Arg<typeof schema.Boolean, undefined>;
  not: schema.Arg<typeof NestedBoolFilter, undefined>;
}>;

const BoolFilter: BoolFilterType = schema.inputObject({
  name: 'BoolFilter',
  fields: () => ({
    equals: schema.arg({ type: schema.Boolean }),
    not: schema.arg({ type: NestedBoolFilter }),
  }),
});

type NestedBoolFilterType = schema.InputObjectType<{
  equals: schema.Arg<typeof schema.Boolean, undefined>;
  not: schema.Arg<typeof NestedBoolFilter, undefined>;
}>;

const NestedBoolFilter: NestedBoolFilterType = schema.inputObject({
  name: 'NestedBoolFilter',
  fields: () => ({
    equals: schema.arg({ type: schema.Boolean }),
    not: schema.arg({ type: NestedBoolFilter }),
  }),
});

type BoolNullableListFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Boolean>>, undefined>;
  // can be null
  has: schema.Arg<typeof schema.Boolean, undefined>;
  hasEvery: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Boolean>>, undefined>;
  hasSome: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Boolean>>, undefined>;
  isEmpty: schema.Arg<typeof schema.Boolean, undefined>;
}>;

const BoolNullableListFilter: BoolNullableListFilterType = schema.inputObject({
  name: 'BoolNullableListFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.list(schema.nonNull(schema.Boolean)) }),
    // can be null
    has: schema.arg({ type: schema.Boolean }),
    hasEvery: schema.arg({ type: schema.list(schema.nonNull(schema.Boolean)) }),
    hasSome: schema.arg({ type: schema.list(schema.nonNull(schema.Boolean)) }),
    isEmpty: schema.arg({ type: schema.Boolean }),
  }),
});

type IntNullableFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<typeof schema.Int, undefined>;
  // can be null
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Int>>, undefined>;
  // can be null
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Int>>, undefined>;
  lt: schema.Arg<typeof schema.Int, undefined>;
  lte: schema.Arg<typeof schema.Int, undefined>;
  gt: schema.Arg<typeof schema.Int, undefined>;
  gte: schema.Arg<typeof schema.Int, undefined>;
  // can be null
  not: schema.Arg<typeof NestedIntNullableFilter, undefined>;
}>;

const IntNullableFilter: IntNullableFilterType = schema.inputObject({
  name: 'IntNullableFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.Int }),
    // can be null
    in: schema.arg({ type: schema.list(schema.nonNull(schema.Int)) }),
    // can be null
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.Int)) }),
    lt: schema.arg({ type: schema.Int }),
    lte: schema.arg({ type: schema.Int }),
    gt: schema.arg({ type: schema.Int }),
    gte: schema.arg({ type: schema.Int }),
    // can be null
    not: schema.arg({ type: NestedIntNullableFilter }),
  }),
});

type NestedIntNullableFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<typeof schema.Int, undefined>;
  // can be null
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Int>>, undefined>;
  // can be null
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Int>>, undefined>;
  lt: schema.Arg<typeof schema.Int, undefined>;
  lte: schema.Arg<typeof schema.Int, undefined>;
  gt: schema.Arg<typeof schema.Int, undefined>;
  gte: schema.Arg<typeof schema.Int, undefined>;
  // can be null
  not: schema.Arg<typeof NestedIntNullableFilter, undefined>;
}>;

const NestedIntNullableFilter: NestedIntNullableFilterType = schema.inputObject({
  name: 'NestedIntNullableFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.Int }),
    // can be null
    in: schema.arg({ type: schema.list(schema.nonNull(schema.Int)) }),
    // can be null
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.Int)) }),
    lt: schema.arg({ type: schema.Int }),
    lte: schema.arg({ type: schema.Int }),
    gt: schema.arg({ type: schema.Int }),
    gte: schema.arg({ type: schema.Int }),
    // can be null
    not: schema.arg({ type: NestedIntNullableFilter }),
  }),
});

type IntFilterType = schema.InputObjectType<{
  equals: schema.Arg<typeof schema.Int, undefined>;
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Int>>, undefined>;
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Int>>, undefined>;
  lt: schema.Arg<typeof schema.Int, undefined>;
  lte: schema.Arg<typeof schema.Int, undefined>;
  gt: schema.Arg<typeof schema.Int, undefined>;
  gte: schema.Arg<typeof schema.Int, undefined>;
  not: schema.Arg<typeof NestedIntFilter, undefined>;
}>;

const IntFilter: IntFilterType = schema.inputObject({
  name: 'IntFilter',
  fields: () => ({
    equals: schema.arg({ type: schema.Int }),
    in: schema.arg({ type: schema.list(schema.nonNull(schema.Int)) }),
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.Int)) }),
    lt: schema.arg({ type: schema.Int }),
    lte: schema.arg({ type: schema.Int }),
    gt: schema.arg({ type: schema.Int }),
    gte: schema.arg({ type: schema.Int }),
    not: schema.arg({ type: NestedIntFilter }),
  }),
});

type NestedIntFilterType = schema.InputObjectType<{
  equals: schema.Arg<typeof schema.Int, undefined>;
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Int>>, undefined>;
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Int>>, undefined>;
  lt: schema.Arg<typeof schema.Int, undefined>;
  lte: schema.Arg<typeof schema.Int, undefined>;
  gt: schema.Arg<typeof schema.Int, undefined>;
  gte: schema.Arg<typeof schema.Int, undefined>;
  not: schema.Arg<typeof NestedIntFilter, undefined>;
}>;

const NestedIntFilter: NestedIntFilterType = schema.inputObject({
  name: 'NestedIntFilter',
  fields: () => ({
    equals: schema.arg({ type: schema.Int }),
    in: schema.arg({ type: schema.list(schema.nonNull(schema.Int)) }),
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.Int)) }),
    lt: schema.arg({ type: schema.Int }),
    lte: schema.arg({ type: schema.Int }),
    gt: schema.arg({ type: schema.Int }),
    gte: schema.arg({ type: schema.Int }),
    not: schema.arg({ type: NestedIntFilter }),
  }),
});

type IntNullableListFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Int>>, undefined>;
  // can be null
  has: schema.Arg<typeof schema.Int, undefined>;
  hasEvery: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Int>>, undefined>;
  hasSome: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Int>>, undefined>;
  isEmpty: schema.Arg<typeof schema.Boolean, undefined>;
}>;

const IntNullableListFilter: IntNullableListFilterType = schema.inputObject({
  name: 'IntNullableListFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.list(schema.nonNull(schema.Int)) }),
    // can be null
    has: schema.arg({ type: schema.Int }),
    hasEvery: schema.arg({ type: schema.list(schema.nonNull(schema.Int)) }),
    hasSome: schema.arg({ type: schema.list(schema.nonNull(schema.Int)) }),
    isEmpty: schema.arg({ type: schema.Boolean }),
  }),
});

type FloatNullableFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<typeof schema.Float, undefined>;
  // can be null
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Float>>, undefined>;
  // can be null
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Float>>, undefined>;
  lt: schema.Arg<typeof schema.Float, undefined>;
  lte: schema.Arg<typeof schema.Float, undefined>;
  gt: schema.Arg<typeof schema.Float, undefined>;
  gte: schema.Arg<typeof schema.Float, undefined>;
  // can be null
  not: schema.Arg<typeof NestedFloatNullableFilter, undefined>;
}>;

const FloatNullableFilter: FloatNullableFilterType = schema.inputObject({
  name: 'FloatNullableFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.Float }),
    // can be null
    in: schema.arg({ type: schema.list(schema.nonNull(schema.Float)) }),
    // can be null
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.Float)) }),
    lt: schema.arg({ type: schema.Float }),
    lte: schema.arg({ type: schema.Float }),
    gt: schema.arg({ type: schema.Float }),
    gte: schema.arg({ type: schema.Float }),
    // can be null
    not: schema.arg({ type: NestedFloatNullableFilter }),
  }),
});

type NestedFloatNullableFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<typeof schema.Float, undefined>;
  // can be null
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Float>>, undefined>;
  // can be null
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Float>>, undefined>;
  lt: schema.Arg<typeof schema.Float, undefined>;
  lte: schema.Arg<typeof schema.Float, undefined>;
  gt: schema.Arg<typeof schema.Float, undefined>;
  gte: schema.Arg<typeof schema.Float, undefined>;
  // can be null
  not: schema.Arg<typeof NestedFloatNullableFilter, undefined>;
}>;

const NestedFloatNullableFilter: NestedFloatNullableFilterType = schema.inputObject({
  name: 'NestedFloatNullableFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.Float }),
    // can be null
    in: schema.arg({ type: schema.list(schema.nonNull(schema.Float)) }),
    // can be null
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.Float)) }),
    lt: schema.arg({ type: schema.Float }),
    lte: schema.arg({ type: schema.Float }),
    gt: schema.arg({ type: schema.Float }),
    gte: schema.arg({ type: schema.Float }),
    // can be null
    not: schema.arg({ type: NestedFloatNullableFilter }),
  }),
});

type FloatFilterType = schema.InputObjectType<{
  equals: schema.Arg<typeof schema.Float, undefined>;
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Float>>, undefined>;
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Float>>, undefined>;
  lt: schema.Arg<typeof schema.Float, undefined>;
  lte: schema.Arg<typeof schema.Float, undefined>;
  gt: schema.Arg<typeof schema.Float, undefined>;
  gte: schema.Arg<typeof schema.Float, undefined>;
  not: schema.Arg<typeof NestedFloatFilter, undefined>;
}>;

const FloatFilter: FloatFilterType = schema.inputObject({
  name: 'FloatFilter',
  fields: () => ({
    equals: schema.arg({ type: schema.Float }),
    in: schema.arg({ type: schema.list(schema.nonNull(schema.Float)) }),
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.Float)) }),
    lt: schema.arg({ type: schema.Float }),
    lte: schema.arg({ type: schema.Float }),
    gt: schema.arg({ type: schema.Float }),
    gte: schema.arg({ type: schema.Float }),
    not: schema.arg({ type: NestedFloatFilter }),
  }),
});

type NestedFloatFilterType = schema.InputObjectType<{
  equals: schema.Arg<typeof schema.Float, undefined>;
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Float>>, undefined>;
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Float>>, undefined>;
  lt: schema.Arg<typeof schema.Float, undefined>;
  lte: schema.Arg<typeof schema.Float, undefined>;
  gt: schema.Arg<typeof schema.Float, undefined>;
  gte: schema.Arg<typeof schema.Float, undefined>;
  not: schema.Arg<typeof NestedFloatFilter, undefined>;
}>;

const NestedFloatFilter: NestedFloatFilterType = schema.inputObject({
  name: 'NestedFloatFilter',
  fields: () => ({
    equals: schema.arg({ type: schema.Float }),
    in: schema.arg({ type: schema.list(schema.nonNull(schema.Float)) }),
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.Float)) }),
    lt: schema.arg({ type: schema.Float }),
    lte: schema.arg({ type: schema.Float }),
    gt: schema.arg({ type: schema.Float }),
    gte: schema.arg({ type: schema.Float }),
    not: schema.arg({ type: NestedFloatFilter }),
  }),
});

type FloatNullableListFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Float>>, undefined>;
  // can be null
  has: schema.Arg<typeof schema.Float, undefined>;
  hasEvery: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Float>>, undefined>;
  hasSome: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.Float>>, undefined>;
  isEmpty: schema.Arg<typeof schema.Boolean, undefined>;
}>;

const FloatNullableListFilter: FloatNullableListFilterType = schema.inputObject({
  name: 'FloatNullableListFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.list(schema.nonNull(schema.Float)) }),
    // can be null
    has: schema.arg({ type: schema.Float }),
    hasEvery: schema.arg({ type: schema.list(schema.nonNull(schema.Float)) }),
    hasSome: schema.arg({ type: schema.list(schema.nonNull(schema.Float)) }),
    isEmpty: schema.arg({ type: schema.Boolean }),
  }),
});

type DateTimeNullableFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<typeof schema.String, undefined>;
  // can be null
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  // can be null
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  lt: schema.Arg<typeof schema.String, undefined>;
  lte: schema.Arg<typeof schema.String, undefined>;
  gt: schema.Arg<typeof schema.String, undefined>;
  gte: schema.Arg<typeof schema.String, undefined>;
  // can be null
  not: schema.Arg<typeof NestedDateTimeNullableFilter, undefined>;
}>;

const DateTimeNullableFilter: DateTimeNullableFilterType = schema.inputObject({
  name: 'DateTimeNullableFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.String }),
    // can be null
    in: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    // can be null
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    lt: schema.arg({ type: schema.String }),
    lte: schema.arg({ type: schema.String }),
    gt: schema.arg({ type: schema.String }),
    gte: schema.arg({ type: schema.String }),
    // can be null
    not: schema.arg({ type: NestedDateTimeNullableFilter }),
  }),
});

type NestedDateTimeNullableFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<typeof schema.String, undefined>;
  // can be null
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  // can be null
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  lt: schema.Arg<typeof schema.String, undefined>;
  lte: schema.Arg<typeof schema.String, undefined>;
  gt: schema.Arg<typeof schema.String, undefined>;
  gte: schema.Arg<typeof schema.String, undefined>;
  // can be null
  not: schema.Arg<typeof NestedDateTimeNullableFilter, undefined>;
}>;

const NestedDateTimeNullableFilter: NestedDateTimeNullableFilterType = schema.inputObject({
  name: 'NestedDateTimeNullableFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.String }),
    // can be null
    in: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    // can be null
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    lt: schema.arg({ type: schema.String }),
    lte: schema.arg({ type: schema.String }),
    gt: schema.arg({ type: schema.String }),
    gte: schema.arg({ type: schema.String }),
    // can be null
    not: schema.arg({ type: NestedDateTimeNullableFilter }),
  }),
});

type DateTimeFilterType = schema.InputObjectType<{
  equals: schema.Arg<typeof schema.String, undefined>;
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  lt: schema.Arg<typeof schema.String, undefined>;
  lte: schema.Arg<typeof schema.String, undefined>;
  gt: schema.Arg<typeof schema.String, undefined>;
  gte: schema.Arg<typeof schema.String, undefined>;
  not: schema.Arg<typeof NestedDateTimeFilter, undefined>;
}>;

const DateTimeFilter: DateTimeFilterType = schema.inputObject({
  name: 'DateTimeFilter',
  fields: () => ({
    equals: schema.arg({ type: schema.String }),
    in: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    lt: schema.arg({ type: schema.String }),
    lte: schema.arg({ type: schema.String }),
    gt: schema.arg({ type: schema.String }),
    gte: schema.arg({ type: schema.String }),
    not: schema.arg({ type: NestedDateTimeFilter }),
  }),
});

type NestedDateTimeFilterType = schema.InputObjectType<{
  equals: schema.Arg<typeof schema.String, undefined>;
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  lt: schema.Arg<typeof schema.String, undefined>;
  lte: schema.Arg<typeof schema.String, undefined>;
  gt: schema.Arg<typeof schema.String, undefined>;
  gte: schema.Arg<typeof schema.String, undefined>;
  not: schema.Arg<typeof NestedDateTimeFilter, undefined>;
}>;

const NestedDateTimeFilter: NestedDateTimeFilterType = schema.inputObject({
  name: 'NestedDateTimeFilter',
  fields: () => ({
    equals: schema.arg({ type: schema.String }),
    in: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    lt: schema.arg({ type: schema.String }),
    lte: schema.arg({ type: schema.String }),
    gt: schema.arg({ type: schema.String }),
    gte: schema.arg({ type: schema.String }),
    not: schema.arg({ type: NestedDateTimeFilter }),
  }),
});

type DateTimeNullableListFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  // can be null
  has: schema.Arg<typeof schema.String, undefined>;
  hasEvery: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  hasSome: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  isEmpty: schema.Arg<typeof schema.Boolean, undefined>;
}>;

const DateTimeNullableListFilter: DateTimeNullableListFilterType = schema.inputObject({
  name: 'DateTimeNullableListFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    // can be null
    has: schema.arg({ type: schema.String }),
    hasEvery: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    hasSome: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    isEmpty: schema.arg({ type: schema.Boolean }),
  }),
});

type JsonNullableFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<typeof schema.JSON, undefined>;
  // can be null
  not: schema.Arg<typeof schema.JSON, undefined>;
}>;

const JsonNullableFilter: JsonNullableFilterType = schema.inputObject({
  name: 'JsonNullableFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.JSON }),
    // can be null
    not: schema.arg({ type: schema.JSON }),
  }),
});

type JsonFilterType = schema.InputObjectType<{
  equals: schema.Arg<typeof schema.JSON, undefined>;
  not: schema.Arg<typeof schema.JSON, undefined>;
}>;

const JsonFilter: JsonFilterType = schema.inputObject({
  name: 'JsonFilter',
  fields: () => ({
    equals: schema.arg({ type: schema.JSON }),
    not: schema.arg({ type: schema.JSON }),
  }),
});

type JsonNullableListFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.JSON>>, undefined>;
  // can be null
  has: schema.Arg<typeof schema.JSON, undefined>;
  hasEvery: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.JSON>>, undefined>;
  hasSome: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.JSON>>, undefined>;
  isEmpty: schema.Arg<typeof schema.Boolean, undefined>;
}>;

const JsonNullableListFilter: JsonNullableListFilterType = schema.inputObject({
  name: 'JsonNullableListFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.list(schema.nonNull(schema.JSON)) }),
    // can be null
    has: schema.arg({ type: schema.JSON }),
    hasEvery: schema.arg({ type: schema.list(schema.nonNull(schema.JSON)) }),
    hasSome: schema.arg({ type: schema.list(schema.nonNull(schema.JSON)) }),
    isEmpty: schema.arg({ type: schema.Boolean }),
  }),
});

type DecimalNullableFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<typeof schema.String, undefined>;
  // can be null
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  // can be null
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  lt: schema.Arg<typeof schema.String, undefined>;
  lte: schema.Arg<typeof schema.String, undefined>;
  gt: schema.Arg<typeof schema.String, undefined>;
  gte: schema.Arg<typeof schema.String, undefined>;
  // can be null
  not: schema.Arg<typeof NestedDecimalNullableFilter, undefined>;
}>;

const DecimalNullableFilter: DecimalNullableFilterType = schema.inputObject({
  name: 'DecimalNullableFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.String }),
    // can be null
    in: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    // can be null
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    lt: schema.arg({ type: schema.String }),
    lte: schema.arg({ type: schema.String }),
    gt: schema.arg({ type: schema.String }),
    gte: schema.arg({ type: schema.String }),
    // can be null
    not: schema.arg({ type: NestedDecimalNullableFilter }),
  }),
});

type NestedDecimalNullableFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<typeof schema.String, undefined>;
  // can be null
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  // can be null
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  lt: schema.Arg<typeof schema.String, undefined>;
  lte: schema.Arg<typeof schema.String, undefined>;
  gt: schema.Arg<typeof schema.String, undefined>;
  gte: schema.Arg<typeof schema.String, undefined>;
  // can be null
  not: schema.Arg<typeof NestedDecimalNullableFilter, undefined>;
}>;

const NestedDecimalNullableFilter: NestedDecimalNullableFilterType = schema.inputObject({
  name: 'NestedDecimalNullableFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.String }),
    // can be null
    in: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    // can be null
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    lt: schema.arg({ type: schema.String }),
    lte: schema.arg({ type: schema.String }),
    gt: schema.arg({ type: schema.String }),
    gte: schema.arg({ type: schema.String }),
    // can be null
    not: schema.arg({ type: NestedDecimalNullableFilter }),
  }),
});

type DecimalFilterType = schema.InputObjectType<{
  equals: schema.Arg<typeof schema.String, undefined>;
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  lt: schema.Arg<typeof schema.String, undefined>;
  lte: schema.Arg<typeof schema.String, undefined>;
  gt: schema.Arg<typeof schema.String, undefined>;
  gte: schema.Arg<typeof schema.String, undefined>;
  not: schema.Arg<typeof NestedDecimalFilter, undefined>;
}>;

const DecimalFilter: DecimalFilterType = schema.inputObject({
  name: 'DecimalFilter',
  fields: () => ({
    equals: schema.arg({ type: schema.String }),
    in: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    lt: schema.arg({ type: schema.String }),
    lte: schema.arg({ type: schema.String }),
    gt: schema.arg({ type: schema.String }),
    gte: schema.arg({ type: schema.String }),
    not: schema.arg({ type: NestedDecimalFilter }),
  }),
});

type NestedDecimalFilterType = schema.InputObjectType<{
  equals: schema.Arg<typeof schema.String, undefined>;
  in: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  notIn: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  lt: schema.Arg<typeof schema.String, undefined>;
  lte: schema.Arg<typeof schema.String, undefined>;
  gt: schema.Arg<typeof schema.String, undefined>;
  gte: schema.Arg<typeof schema.String, undefined>;
  not: schema.Arg<typeof NestedDecimalFilter, undefined>;
}>;

const NestedDecimalFilter: NestedDecimalFilterType = schema.inputObject({
  name: 'NestedDecimalFilter',
  fields: () => ({
    equals: schema.arg({ type: schema.String }),
    in: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    notIn: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    lt: schema.arg({ type: schema.String }),
    lte: schema.arg({ type: schema.String }),
    gt: schema.arg({ type: schema.String }),
    gte: schema.arg({ type: schema.String }),
    not: schema.arg({ type: NestedDecimalFilter }),
  }),
});

type DecimalNullableListFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  // can be null
  has: schema.Arg<typeof schema.String, undefined>;
  hasEvery: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  hasSome: schema.Arg<schema.ListType<schema.NonNullType<typeof schema.String>>, undefined>;
  isEmpty: schema.Arg<typeof schema.Boolean, undefined>;
}>;

const DecimalNullableListFilter: DecimalNullableListFilterType = schema.inputObject({
  name: 'DecimalNullableListFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    // can be null
    has: schema.arg({ type: schema.String }),
    hasEvery: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    hasSome: schema.arg({ type: schema.list(schema.nonNull(schema.String)) }),
    isEmpty: schema.arg({ type: schema.Boolean }),
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
