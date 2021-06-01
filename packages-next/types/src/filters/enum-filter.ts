import * as types from '../ts-gql-schema';

// yes, these two types have the fields but they're semantically different types
// (even though, yes, having EnumFilter by defined as EnumNullableFilter<Enum>, would be the same type but names would show up differently in editors for example)

export type EnumNullableFilter<Enum extends types.EnumType<any>> = types.InputObjectType<{
  // can be null
  equals: types.Arg<Enum>;
  // can be null
  in: types.Arg<types.ListType<types.NonNullType<Enum>>>;
  // can be null
  notIn: types.Arg<types.ListType<types.NonNullType<Enum>>>;
  // can be null
  not: types.Arg<EnumNullableFilter<Enum>>;
}>;

export type EnumFilter<Enum extends types.EnumType<any>> = types.InputObjectType<{
  equals: types.Arg<Enum>;
  in: types.Arg<types.ListType<types.NonNullType<Enum>>>;
  notIn: types.Arg<types.ListType<types.NonNullType<Enum>>>;
  not: types.Arg<EnumFilter<Enum>>;
}>;

type EnumNullableListFilterType<Enum extends types.EnumType<any>> = types.InputObjectType<{
  // can be null
  equals: types.Arg<types.ListType<types.NonNullType<Enum>>>;
  // can be null
  has: types.Arg<Enum>;
  hasEvery: types.Arg<types.ListType<types.NonNullType<Enum>>>;
  hasSome: types.Arg<types.ListType<types.NonNullType<Enum>>>;
  isEmpty: types.Arg<Enum>;
}>;

export function enumFilters<Enum extends types.EnumType<any>>(
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
