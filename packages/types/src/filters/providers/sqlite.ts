import { schema } from '../../schema';

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

type BoolNullableFilterType = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<typeof schema.Boolean, undefined>;
  // can be null
  not: schema.Arg<typeof BoolNullableFilter, undefined>;
}>;

const BoolNullableFilter: BoolNullableFilterType = schema.inputObject({
  name: 'BooleanNullableFilter',
  fields: () => ({
    // can be null
    equals: schema.arg({ type: schema.Boolean }),
    // can be null
    not: schema.arg({ type: BoolNullableFilter }),
  }),
});

type BoolFilterType = schema.InputObjectType<{
  equals: schema.Arg<typeof schema.Boolean, undefined>;
  not: schema.Arg<typeof BoolFilter, undefined>;
}>;

const BoolFilter: BoolFilterType = schema.inputObject({
  name: 'BooleanFilter',
  fields: () => ({
    equals: schema.arg({ type: schema.Boolean }),
    not: schema.arg({ type: BoolFilter }),
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
  not: schema.Arg<typeof IntNullableFilter, undefined>;
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
    not: schema.arg({ type: IntNullableFilter }),
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
  not: schema.Arg<typeof IntFilter, undefined>;
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
    not: schema.arg({ type: IntFilter }),
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
  not: schema.Arg<typeof FloatNullableFilter, undefined>;
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
    not: schema.arg({ type: FloatNullableFilter }),
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
  not: schema.Arg<typeof FloatFilter, undefined>;
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
    not: schema.arg({ type: FloatFilter }),
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
  not: schema.Arg<typeof DateTimeNullableFilter, undefined>;
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
    not: schema.arg({ type: DateTimeNullableFilter }),
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
  not: schema.Arg<typeof DateTimeFilter, undefined>;
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
    not: schema.arg({ type: DateTimeFilter }),
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
  not: schema.Arg<typeof DecimalNullableFilter, undefined>;
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
    not: schema.arg({ type: DecimalNullableFilter }),
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
  not: schema.Arg<typeof DecimalFilter, undefined>;
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
    not: schema.arg({ type: DecimalFilter }),
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

export const Decimal = {
  optional: DecimalNullableFilter,
  required: DecimalFilter,
};

export { enumFilters as enum } from '../enum-filter';
