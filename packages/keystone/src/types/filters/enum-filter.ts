import { graphql } from '../schema';

// yes, these two types have the fields but they're semantically different types
// (even though, yes, having EnumFilter by defined as EnumNullableFilter<Enum>, would be the same type but names would show up differently in editors for example)

export type EnumNullableFilter<Enum extends graphql.EnumType<any>> = graphql.InputObjectType<{
  // can be null
  equals: graphql.Arg<Enum>;
  // can be null
  in: graphql.Arg<graphql.ListType<graphql.NonNullType<Enum>>>;
  // can be null
  notIn: graphql.Arg<graphql.ListType<graphql.NonNullType<Enum>>>;
  // can be null
  not: graphql.Arg<EnumNullableFilter<Enum>>;
}>;

export type EnumFilter<Enum extends graphql.EnumType<any>> = graphql.InputObjectType<{
  equals: graphql.Arg<Enum>;
  in: graphql.Arg<graphql.ListType<graphql.NonNullType<Enum>>>;
  notIn: graphql.Arg<graphql.ListType<graphql.NonNullType<Enum>>>;
  not: graphql.Arg<EnumFilter<Enum>>;
}>;

type EnumNullableListFilterType<Enum extends graphql.EnumType<any>> = graphql.InputObjectType<{
  // can be null
  equals: graphql.Arg<graphql.ListType<graphql.NonNullType<Enum>>>;
  // can be null
  has: graphql.Arg<Enum>;
  hasEvery: graphql.Arg<graphql.ListType<graphql.NonNullType<Enum>>>;
  hasSome: graphql.Arg<graphql.ListType<graphql.NonNullType<Enum>>>;
  isEmpty: graphql.Arg<Enum>;
}>;

export function enumFilters<Enum extends graphql.EnumType<any>>(
  enumType: Enum
): {
  optional: EnumNullableFilter<Enum>;
  required: EnumFilter<Enum>;
  many: EnumNullableListFilterType<Enum>;
} {
  const optional: EnumNullableFilter<Enum> = graphql.inputObject({
    name: `${enumType.graphQLType.name}NullableFilter`,
    fields: () => ({
      equals: graphql.arg({ type: enumType }),
      in: graphql.arg({ type: graphql.list(graphql.nonNull(enumType)) }),
      notIn: graphql.arg({ type: graphql.list(graphql.nonNull(enumType)) }),
      not: graphql.arg({ type: optional }),
    }),
  });
  const required: EnumFilter<Enum> = graphql.inputObject({
    name: `${enumType.graphQLType.name}Filter`,
    fields: () => ({
      equals: graphql.arg({ type: enumType }),
      in: graphql.arg({ type: graphql.list(graphql.nonNull(enumType)) }),
      notIn: graphql.arg({ type: graphql.list(graphql.nonNull(enumType)) }),
      not: graphql.arg({ type: optional }),
    }),
  });
  const many: EnumNullableListFilterType<Enum> = graphql.inputObject({
    name: `${enumType.graphQLType.name}NullableListFilter`,
    fields: () => ({
      // can be null
      equals: graphql.arg({ type: graphql.list(graphql.nonNull(enumType)) }),
      // can be null
      has: graphql.arg({ type: enumType }),
      hasEvery: graphql.arg({ type: graphql.list(graphql.nonNull(enumType)) }),
      hasSome: graphql.arg({ type: graphql.list(graphql.nonNull(enumType)) }),
      isEmpty: graphql.arg({ type: enumType }),
    }),
  });
  return {
    optional,
    required,
    many,
  };
}
