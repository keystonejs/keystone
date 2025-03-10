import { g } from '../../types/schema'

// yes, these two types have the fields but they're semantically different types
// (even though, yes, having EnumFilter by defined as EnumNullableFilter<Enum>, would be the same type but names would show up differently in editors for example)

export type EnumNullableFilter<Enum extends g.EnumType<any>> = g.InputObjectType<{
  // can be null
  equals: g.Arg<Enum>
  // can be null
  in: g.Arg<g.ListType<g.NonNullType<Enum>>>
  // can be null
  notIn: g.Arg<g.ListType<g.NonNullType<Enum>>>
  // can be null
  not: g.Arg<EnumNullableFilter<Enum>>
}>

export type EnumFilter<Enum extends g.EnumType<any>> = g.InputObjectType<{
  equals: g.Arg<Enum>
  in: g.Arg<g.ListType<g.NonNullType<Enum>>>
  notIn: g.Arg<g.ListType<g.NonNullType<Enum>>>
  not: g.Arg<EnumFilter<Enum>>
}>

type EnumNullableListFilterType<Enum extends g.EnumType<any>> = g.InputObjectType<{
  // can be null
  equals: g.Arg<g.ListType<g.NonNullType<Enum>>>
  // can be null
  has: g.Arg<Enum>
  hasEvery: g.Arg<g.ListType<g.NonNullType<Enum>>>
  hasSome: g.Arg<g.ListType<g.NonNullType<Enum>>>
  isEmpty: g.Arg<Enum>
}>

export function enumFilters<Enum extends g.EnumType<any>>(
  enumType: Enum
): {
  optional: EnumNullableFilter<Enum>
  required: EnumFilter<Enum>
  many: EnumNullableListFilterType<Enum>
} {
  const optional: EnumNullableFilter<Enum> = g.inputObject({
    name: `${enumType.name}NullableFilter`,
    fields: () => ({
      equals: g.arg({ type: enumType }),
      in: g.arg({ type: g.list(g.nonNull(enumType)) }),
      notIn: g.arg({ type: g.list(g.nonNull(enumType)) }),
      not: g.arg({ type: optional }),
    }),
  })
  const required: EnumFilter<Enum> = g.inputObject({
    name: `${enumType.name}Filter`,
    fields: () => ({
      equals: g.arg({ type: enumType }),
      in: g.arg({ type: g.list(g.nonNull(enumType)) }),
      notIn: g.arg({ type: g.list(g.nonNull(enumType)) }),
      not: g.arg({ type: optional }),
    }),
  })
  const many: EnumNullableListFilterType<Enum> = g.inputObject({
    name: `${enumType.name}NullableListFilter`,
    fields: () => ({
      // can be null
      equals: g.arg({ type: g.list(g.nonNull(enumType)) }),
      // can be null
      has: g.arg({ type: enumType }),
      hasEvery: g.arg({ type: g.list(g.nonNull(enumType)) }),
      hasSome: g.arg({ type: g.list(g.nonNull(enumType)) }),
      isEmpty: g.arg({ type: enumType }),
    }),
  })
  return {
    optional,
    required,
    many,
  }
}
