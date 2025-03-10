import type { GArg, GEnumType, GInputObjectType, GList, GNonNull } from '@graphql-ts/schema'
import { g } from '../../types/schema'

// yes, these two types have the fields but they're semantically different types
// (even though, yes, having EnumFilter by defined as EnumNullableFilter<Enum>, would be the same type but names would show up differently in editors for example)

export type EnumNullableFilter<Enum extends GEnumType<any>> = GInputObjectType<{
  // can be null
  equals: GArg<Enum>
  // can be null
  in: GArg<GList<GNonNull<Enum>>>
  // can be null
  notIn: GArg<GList<GNonNull<Enum>>>
  // can be null
  not: GArg<EnumNullableFilter<Enum>>
}>

export type EnumFilter<Enum extends GEnumType<any>> = GInputObjectType<{
  equals: GArg<Enum>
  in: GArg<GList<GNonNull<Enum>>>
  notIn: GArg<GList<GNonNull<Enum>>>
  not: GArg<EnumFilter<Enum>>
}>

type EnumNullableListFilterType<Enum extends GEnumType<any>> = GInputObjectType<{
  // can be null
  equals: GArg<GList<GNonNull<Enum>>>
  // can be null
  has: GArg<Enum>
  hasEvery: GArg<GList<GNonNull<Enum>>>
  hasSome: GArg<GList<GNonNull<Enum>>>
  isEmpty: GArg<Enum>
}>

export function enumFilters<Enum extends GEnumType<any>>(
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
