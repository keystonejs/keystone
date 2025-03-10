// Do not manually modify this file, it is automatically generated by the package at /prisma-utils in this repo.

import { g } from '../../../types/schema'

import type { GInputObjectType, GNonNull, GList, GArg } from '@graphql-ts/schema'

type StringNullableFilterType = GInputObjectType<{
  equals: GArg<typeof g.String> // can be null
  in: GArg<GList<GNonNull<typeof g.String>>> // can be null
  notIn: GArg<GList<GNonNull<typeof g.String>>> // can be null
  lt: GArg<typeof g.String>
  lte: GArg<typeof g.String>
  gt: GArg<typeof g.String>
  gte: GArg<typeof g.String>
  contains: GArg<typeof g.String>
  startsWith: GArg<typeof g.String>
  endsWith: GArg<typeof g.String>
  not: GArg<StringNullableFilterType> // can be null
}>

const StringNullableFilter: StringNullableFilterType = g.inputObject({
  name: 'StringNullableFilter',
  fields: () => ({
    equals: g.arg({ type: g.String }), // can be null
    in: g.arg({ type: g.list(g.nonNull(g.String)) }), // can be null
    notIn: g.arg({ type: g.list(g.nonNull(g.String)) }), // can be null
    lt: g.arg({ type: g.String }),
    lte: g.arg({ type: g.String }),
    gt: g.arg({ type: g.String }),
    gte: g.arg({ type: g.String }),
    contains: g.arg({ type: g.String }),
    startsWith: g.arg({ type: g.String }),
    endsWith: g.arg({ type: g.String }),
    not: g.arg({ type: StringNullableFilter }), // can be null
  }),
})

type StringFilterType = GInputObjectType<{
  equals: GArg<typeof g.String>
  in: GArg<GList<GNonNull<typeof g.String>>>
  notIn: GArg<GList<GNonNull<typeof g.String>>>
  lt: GArg<typeof g.String>
  lte: GArg<typeof g.String>
  gt: GArg<typeof g.String>
  gte: GArg<typeof g.String>
  contains: GArg<typeof g.String>
  startsWith: GArg<typeof g.String>
  endsWith: GArg<typeof g.String>
  not: GArg<NestedStringFilterType>
}>

const StringFilter: StringFilterType = g.inputObject({
  name: 'StringFilter',
  fields: () => ({
    equals: g.arg({ type: g.String }),
    in: g.arg({ type: g.list(g.nonNull(g.String)) }),
    notIn: g.arg({ type: g.list(g.nonNull(g.String)) }),
    lt: g.arg({ type: g.String }),
    lte: g.arg({ type: g.String }),
    gt: g.arg({ type: g.String }),
    gte: g.arg({ type: g.String }),
    contains: g.arg({ type: g.String }),
    startsWith: g.arg({ type: g.String }),
    endsWith: g.arg({ type: g.String }),
    not: g.arg({ type: NestedStringFilter }),
  }),
})

type NestedStringNullableFilterType = GInputObjectType<{
  equals: GArg<typeof g.String> // can be null
  in: GArg<GList<GNonNull<typeof g.String>>> // can be null
  notIn: GArg<GList<GNonNull<typeof g.String>>> // can be null
  lt: GArg<typeof g.String>
  lte: GArg<typeof g.String>
  gt: GArg<typeof g.String>
  gte: GArg<typeof g.String>
  contains: GArg<typeof g.String>
  startsWith: GArg<typeof g.String>
  endsWith: GArg<typeof g.String>
  not: GArg<NestedStringNullableFilterType> // can be null
}>

const NestedStringNullableFilter: NestedStringNullableFilterType = g.inputObject({
  name: 'NestedStringNullableFilter',
  fields: () => ({
    equals: g.arg({ type: g.String }), // can be null
    in: g.arg({ type: g.list(g.nonNull(g.String)) }), // can be null
    notIn: g.arg({ type: g.list(g.nonNull(g.String)) }), // can be null
    lt: g.arg({ type: g.String }),
    lte: g.arg({ type: g.String }),
    gt: g.arg({ type: g.String }),
    gte: g.arg({ type: g.String }),
    contains: g.arg({ type: g.String }),
    startsWith: g.arg({ type: g.String }),
    endsWith: g.arg({ type: g.String }),
    not: g.arg({ type: NestedStringNullableFilter }), // can be null
  }),
})

type NestedStringFilterType = GInputObjectType<{
  equals: GArg<typeof g.String>
  in: GArg<GList<GNonNull<typeof g.String>>>
  notIn: GArg<GList<GNonNull<typeof g.String>>>
  lt: GArg<typeof g.String>
  lte: GArg<typeof g.String>
  gt: GArg<typeof g.String>
  gte: GArg<typeof g.String>
  contains: GArg<typeof g.String>
  startsWith: GArg<typeof g.String>
  endsWith: GArg<typeof g.String>
  not: GArg<NestedStringFilterType>
}>

const NestedStringFilter: NestedStringFilterType = g.inputObject({
  name: 'NestedStringFilter',
  fields: () => ({
    equals: g.arg({ type: g.String }),
    in: g.arg({ type: g.list(g.nonNull(g.String)) }),
    notIn: g.arg({ type: g.list(g.nonNull(g.String)) }),
    lt: g.arg({ type: g.String }),
    lte: g.arg({ type: g.String }),
    gt: g.arg({ type: g.String }),
    gte: g.arg({ type: g.String }),
    contains: g.arg({ type: g.String }),
    startsWith: g.arg({ type: g.String }),
    endsWith: g.arg({ type: g.String }),
    not: g.arg({ type: NestedStringFilter }),
  }),
})

type BooleanNullableFilterType = GInputObjectType<{
  equals: GArg<typeof g.Boolean> // can be null
  not: GArg<BooleanNullableFilterType> // can be null
}>

const BooleanNullableFilter: BooleanNullableFilterType = g.inputObject({
  name: 'BooleanNullableFilter',
  fields: () => ({
    equals: g.arg({ type: g.Boolean }), // can be null
    not: g.arg({ type: BooleanNullableFilter }), // can be null
  }),
})

type BooleanFilterType = GInputObjectType<{
  equals: GArg<typeof g.Boolean>
  not: GArg<BooleanFilterType>
}>

const BooleanFilter: BooleanFilterType = g.inputObject({
  name: 'BooleanFilter',
  fields: () => ({
    equals: g.arg({ type: g.Boolean }),
    not: g.arg({ type: BooleanFilter }),
  }),
})

type IntFilterType = GInputObjectType<{
  equals: GArg<typeof g.Int>
  in: GArg<GList<GNonNull<typeof g.Int>>>
  notIn: GArg<GList<GNonNull<typeof g.Int>>>
  lt: GArg<typeof g.Int>
  lte: GArg<typeof g.Int>
  gt: GArg<typeof g.Int>
  gte: GArg<typeof g.Int>
  not: GArg<IntFilterType>
}>

const IntFilter: IntFilterType = g.inputObject({
  name: 'IntFilter',
  fields: () => ({
    equals: g.arg({ type: g.Int }),
    in: g.arg({ type: g.list(g.nonNull(g.Int)) }),
    notIn: g.arg({ type: g.list(g.nonNull(g.Int)) }),
    lt: g.arg({ type: g.Int }),
    lte: g.arg({ type: g.Int }),
    gt: g.arg({ type: g.Int }),
    gte: g.arg({ type: g.Int }),
    not: g.arg({ type: IntFilter }),
  }),
})

type IntNullableFilterType = GInputObjectType<{
  equals: GArg<typeof g.Int> // can be null
  in: GArg<GList<GNonNull<typeof g.Int>>> // can be null
  notIn: GArg<GList<GNonNull<typeof g.Int>>> // can be null
  lt: GArg<typeof g.Int>
  lte: GArg<typeof g.Int>
  gt: GArg<typeof g.Int>
  gte: GArg<typeof g.Int>
  not: GArg<IntNullableFilterType> // can be null
}>

const IntNullableFilter: IntNullableFilterType = g.inputObject({
  name: 'IntNullableFilter',
  fields: () => ({
    equals: g.arg({ type: g.Int }), // can be null
    in: g.arg({ type: g.list(g.nonNull(g.Int)) }), // can be null
    notIn: g.arg({ type: g.list(g.nonNull(g.Int)) }), // can be null
    lt: g.arg({ type: g.Int }),
    lte: g.arg({ type: g.Int }),
    gt: g.arg({ type: g.Int }),
    gte: g.arg({ type: g.Int }),
    not: g.arg({ type: IntNullableFilter }), // can be null
  }),
})

type FloatNullableFilterType = GInputObjectType<{
  equals: GArg<typeof g.Float> // can be null
  in: GArg<GList<GNonNull<typeof g.Float>>> // can be null
  notIn: GArg<GList<GNonNull<typeof g.Float>>> // can be null
  lt: GArg<typeof g.Float>
  lte: GArg<typeof g.Float>
  gt: GArg<typeof g.Float>
  gte: GArg<typeof g.Float>
  not: GArg<FloatNullableFilterType> // can be null
}>

const FloatNullableFilter: FloatNullableFilterType = g.inputObject({
  name: 'FloatNullableFilter',
  fields: () => ({
    equals: g.arg({ type: g.Float }), // can be null
    in: g.arg({ type: g.list(g.nonNull(g.Float)) }), // can be null
    notIn: g.arg({ type: g.list(g.nonNull(g.Float)) }), // can be null
    lt: g.arg({ type: g.Float }),
    lte: g.arg({ type: g.Float }),
    gt: g.arg({ type: g.Float }),
    gte: g.arg({ type: g.Float }),
    not: g.arg({ type: FloatNullableFilter }), // can be null
  }),
})

type FloatFilterType = GInputObjectType<{
  equals: GArg<typeof g.Float>
  in: GArg<GList<GNonNull<typeof g.Float>>>
  notIn: GArg<GList<GNonNull<typeof g.Float>>>
  lt: GArg<typeof g.Float>
  lte: GArg<typeof g.Float>
  gt: GArg<typeof g.Float>
  gte: GArg<typeof g.Float>
  not: GArg<FloatFilterType>
}>

const FloatFilter: FloatFilterType = g.inputObject({
  name: 'FloatFilter',
  fields: () => ({
    equals: g.arg({ type: g.Float }),
    in: g.arg({ type: g.list(g.nonNull(g.Float)) }),
    notIn: g.arg({ type: g.list(g.nonNull(g.Float)) }),
    lt: g.arg({ type: g.Float }),
    lte: g.arg({ type: g.Float }),
    gt: g.arg({ type: g.Float }),
    gte: g.arg({ type: g.Float }),
    not: g.arg({ type: FloatFilter }),
  }),
})

type DateTimeNullableFilterType = GInputObjectType<{
  equals: GArg<typeof g.DateTime> // can be null
  in: GArg<GList<GNonNull<typeof g.DateTime>>> // can be null
  notIn: GArg<GList<GNonNull<typeof g.DateTime>>> // can be null
  lt: GArg<typeof g.DateTime>
  lte: GArg<typeof g.DateTime>
  gt: GArg<typeof g.DateTime>
  gte: GArg<typeof g.DateTime>
  not: GArg<DateTimeNullableFilterType> // can be null
}>

const DateTimeNullableFilter: DateTimeNullableFilterType = g.inputObject({
  name: 'DateTimeNullableFilter',
  fields: () => ({
    equals: g.arg({ type: g.DateTime }), // can be null
    in: g.arg({ type: g.list(g.nonNull(g.DateTime)) }), // can be null
    notIn: g.arg({ type: g.list(g.nonNull(g.DateTime)) }), // can be null
    lt: g.arg({ type: g.DateTime }),
    lte: g.arg({ type: g.DateTime }),
    gt: g.arg({ type: g.DateTime }),
    gte: g.arg({ type: g.DateTime }),
    not: g.arg({ type: DateTimeNullableFilter }), // can be null
  }),
})

type DateTimeFilterType = GInputObjectType<{
  equals: GArg<typeof g.DateTime>
  in: GArg<GList<GNonNull<typeof g.DateTime>>>
  notIn: GArg<GList<GNonNull<typeof g.DateTime>>>
  lt: GArg<typeof g.DateTime>
  lte: GArg<typeof g.DateTime>
  gt: GArg<typeof g.DateTime>
  gte: GArg<typeof g.DateTime>
  not: GArg<DateTimeFilterType>
}>

const DateTimeFilter: DateTimeFilterType = g.inputObject({
  name: 'DateTimeFilter',
  fields: () => ({
    equals: g.arg({ type: g.DateTime }),
    in: g.arg({ type: g.list(g.nonNull(g.DateTime)) }),
    notIn: g.arg({ type: g.list(g.nonNull(g.DateTime)) }),
    lt: g.arg({ type: g.DateTime }),
    lte: g.arg({ type: g.DateTime }),
    gt: g.arg({ type: g.DateTime }),
    gte: g.arg({ type: g.DateTime }),
    not: g.arg({ type: DateTimeFilter }),
  }),
})

type DecimalNullableFilterType = GInputObjectType<{
  equals: GArg<typeof g.Decimal> // can be null
  in: GArg<GList<GNonNull<typeof g.Decimal>>> // can be null
  notIn: GArg<GList<GNonNull<typeof g.Decimal>>> // can be null
  lt: GArg<typeof g.Decimal>
  lte: GArg<typeof g.Decimal>
  gt: GArg<typeof g.Decimal>
  gte: GArg<typeof g.Decimal>
  not: GArg<DecimalNullableFilterType> // can be null
}>

const DecimalNullableFilter: DecimalNullableFilterType = g.inputObject({
  name: 'DecimalNullableFilter',
  fields: () => ({
    equals: g.arg({ type: g.Decimal }), // can be null
    in: g.arg({ type: g.list(g.nonNull(g.Decimal)) }), // can be null
    notIn: g.arg({ type: g.list(g.nonNull(g.Decimal)) }), // can be null
    lt: g.arg({ type: g.Decimal }),
    lte: g.arg({ type: g.Decimal }),
    gt: g.arg({ type: g.Decimal }),
    gte: g.arg({ type: g.Decimal }),
    not: g.arg({ type: DecimalNullableFilter }), // can be null
  }),
})

type DecimalFilterType = GInputObjectType<{
  equals: GArg<typeof g.Decimal>
  in: GArg<GList<GNonNull<typeof g.Decimal>>>
  notIn: GArg<GList<GNonNull<typeof g.Decimal>>>
  lt: GArg<typeof g.Decimal>
  lte: GArg<typeof g.Decimal>
  gt: GArg<typeof g.Decimal>
  gte: GArg<typeof g.Decimal>
  not: GArg<DecimalFilterType>
}>

const DecimalFilter: DecimalFilterType = g.inputObject({
  name: 'DecimalFilter',
  fields: () => ({
    equals: g.arg({ type: g.Decimal }),
    in: g.arg({ type: g.list(g.nonNull(g.Decimal)) }),
    notIn: g.arg({ type: g.list(g.nonNull(g.Decimal)) }),
    lt: g.arg({ type: g.Decimal }),
    lte: g.arg({ type: g.Decimal }),
    gt: g.arg({ type: g.Decimal }),
    gte: g.arg({ type: g.Decimal }),
    not: g.arg({ type: DecimalFilter }),
  }),
})

type BigIntNullableFilterType = GInputObjectType<{
  equals: GArg<typeof g.BigInt> // can be null
  in: GArg<GList<GNonNull<typeof g.BigInt>>> // can be null
  notIn: GArg<GList<GNonNull<typeof g.BigInt>>> // can be null
  lt: GArg<typeof g.BigInt>
  lte: GArg<typeof g.BigInt>
  gt: GArg<typeof g.BigInt>
  gte: GArg<typeof g.BigInt>
  not: GArg<BigIntNullableFilterType> // can be null
}>

const BigIntNullableFilter: BigIntNullableFilterType = g.inputObject({
  name: 'BigIntNullableFilter',
  fields: () => ({
    equals: g.arg({ type: g.BigInt }), // can be null
    in: g.arg({ type: g.list(g.nonNull(g.BigInt)) }), // can be null
    notIn: g.arg({ type: g.list(g.nonNull(g.BigInt)) }), // can be null
    lt: g.arg({ type: g.BigInt }),
    lte: g.arg({ type: g.BigInt }),
    gt: g.arg({ type: g.BigInt }),
    gte: g.arg({ type: g.BigInt }),
    not: g.arg({ type: BigIntNullableFilter }), // can be null
  }),
})

type BigIntFilterType = GInputObjectType<{
  equals: GArg<typeof g.BigInt>
  in: GArg<GList<GNonNull<typeof g.BigInt>>>
  notIn: GArg<GList<GNonNull<typeof g.BigInt>>>
  lt: GArg<typeof g.BigInt>
  lte: GArg<typeof g.BigInt>
  gt: GArg<typeof g.BigInt>
  gte: GArg<typeof g.BigInt>
  not: GArg<BigIntFilterType>
}>

const BigIntFilter: BigIntFilterType = g.inputObject({
  name: 'BigIntFilter',
  fields: () => ({
    equals: g.arg({ type: g.BigInt }),
    in: g.arg({ type: g.list(g.nonNull(g.BigInt)) }),
    notIn: g.arg({ type: g.list(g.nonNull(g.BigInt)) }),
    lt: g.arg({ type: g.BigInt }),
    lte: g.arg({ type: g.BigInt }),
    gt: g.arg({ type: g.BigInt }),
    gte: g.arg({ type: g.BigInt }),
    not: g.arg({ type: BigIntFilter }),
  }),
})

export const String = {
  optional: StringNullableFilter,
  required: StringFilter,
}

export const Boolean = {
  optional: BooleanNullableFilter,
  required: BooleanFilter,
}

export const Int = {
  optional: IntNullableFilter,
  required: IntFilter,
}

export const Float = {
  optional: FloatNullableFilter,
  required: FloatFilter,
}

export const DateTime = {
  optional: DateTimeNullableFilter,
  required: DateTimeFilter,
}

export const Decimal = {
  optional: DecimalNullableFilter,
  required: DecimalFilter,
}

export const BigInt = {
  optional: BigIntNullableFilter,
  required: BigIntFilter,
}

export { enumFilters as enum } from '../enum-filter'
