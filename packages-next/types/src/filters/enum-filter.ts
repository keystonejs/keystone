import { tsgql, types } from '../next-fields';

// yes, these two types have the fields but they're semantically different types
// (even though, yes, having EnumFilter by defined as EnumNullableFilter<Enum>, would be the same type but names would show up differently in editors for example)

export type EnumNullableFilter<Enum extends tsgql.EnumType<any>> = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<Enum>;
  // can be null
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<Enum>>>;
  // can be null
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<Enum>>>;
  // can be null
  not: tsgql.Arg<EnumNullableFilter<Enum>>;
}>;

export type EnumFilter<Enum extends tsgql.EnumType<any>> = tsgql.InputObjectType<{
  equals: tsgql.Arg<Enum>;
  in: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<Enum>>>;
  notIn: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<Enum>>>;
  not: tsgql.Arg<EnumFilter<Enum>>;
}>;

type EnumNullableListFilterType<Enum extends tsgql.EnumType<any>> = tsgql.InputObjectType<{
  // can be null
  equals: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<Enum>>>;
  // can be null
  has: tsgql.Arg<Enum>;
  hasEvery: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<Enum>>>;
  hasSome: tsgql.Arg<tsgql.ListType<tsgql.NonNullType<Enum>>>;
  isEmpty: tsgql.Arg<Enum>;
}>;

export function enumFilters<Enum extends tsgql.EnumType<any>>(
  enumType: Enum
): {
  optional: EnumNullableFilter<Enum>;
  required: EnumFilter<Enum>;
  many: EnumNullableListFilterType<Enum>;
} {
  const optional: EnumNullableFilter<Enum> = types.inputObject({
    name: `${enumType.graphQLType.name}NullableFilter`,
    fields: () => ({
      equals: types.arg({ type: enumType }),
      in: types.arg({ type: types.list(types.nonNull(enumType)) }),
      notIn: types.arg({ type: types.list(types.nonNull(enumType)) }),
      not: types.arg({ type: optional }),
    }),
  });
  const required: EnumFilter<Enum> = types.inputObject({
    name: `${enumType.graphQLType.name}Filter`,
    fields: () => ({
      equals: types.arg({ type: enumType }),
      in: types.arg({ type: types.list(types.nonNull(enumType)) }),
      notIn: types.arg({ type: types.list(types.nonNull(enumType)) }),
      not: types.arg({ type: optional }),
    }),
  });
  const many: EnumNullableListFilterType<Enum> = types.inputObject({
    name: `${enumType.graphQLType.name}NullableListFilter`,
    fields: () => ({
      // can be null
      equals: types.arg({ type: types.list(types.nonNull(enumType)) }),
      // can be null
      has: types.arg({ type: enumType }),
      hasEvery: types.arg({ type: types.list(types.nonNull(enumType)) }),
      hasSome: types.arg({ type: types.list(types.nonNull(enumType)) }),
      isEmpty: types.arg({ type: enumType }),
    }),
  });
  return {
    optional,
    required,
    many,
  };
}
