import { schema } from '../schema';

// yes, these two types have the fields but they're semantically different types
// (even though, yes, having EnumFilter by defined as EnumNullableFilter<Enum>, would be the same type but names would show up differently in editors for example)

export type EnumNullableFilter<Enum extends schema.EnumType<any>> = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<Enum>;
  // can be null
  in: schema.Arg<schema.ListType<schema.NonNullType<Enum>>>;
  // can be null
  notIn: schema.Arg<schema.ListType<schema.NonNullType<Enum>>>;
  // can be null
  not: schema.Arg<EnumNullableFilter<Enum>>;
}>;

export type EnumFilter<Enum extends schema.EnumType<any>> = schema.InputObjectType<{
  equals: schema.Arg<Enum>;
  in: schema.Arg<schema.ListType<schema.NonNullType<Enum>>>;
  notIn: schema.Arg<schema.ListType<schema.NonNullType<Enum>>>;
  not: schema.Arg<EnumFilter<Enum>>;
}>;

type EnumNullableListFilterType<Enum extends schema.EnumType<any>> = schema.InputObjectType<{
  // can be null
  equals: schema.Arg<schema.ListType<schema.NonNullType<Enum>>>;
  // can be null
  has: schema.Arg<Enum>;
  hasEvery: schema.Arg<schema.ListType<schema.NonNullType<Enum>>>;
  hasSome: schema.Arg<schema.ListType<schema.NonNullType<Enum>>>;
  isEmpty: schema.Arg<Enum>;
}>;

export function enumFilters<Enum extends schema.EnumType<any>>(
  enumType: Enum
): {
  optional: EnumNullableFilter<Enum>;
  required: EnumFilter<Enum>;
  many: EnumNullableListFilterType<Enum>;
} {
  const optional: EnumNullableFilter<Enum> = schema.inputObject({
    name: `${enumType.graphQLType.name}NullableFilter`,
    fields: () => ({
      equals: schema.arg({ type: enumType }),
      in: schema.arg({ type: schema.list(schema.nonNull(enumType)) }),
      notIn: schema.arg({ type: schema.list(schema.nonNull(enumType)) }),
      not: schema.arg({ type: optional }),
    }),
  });
  const required: EnumFilter<Enum> = schema.inputObject({
    name: `${enumType.graphQLType.name}Filter`,
    fields: () => ({
      equals: schema.arg({ type: enumType }),
      in: schema.arg({ type: schema.list(schema.nonNull(enumType)) }),
      notIn: schema.arg({ type: schema.list(schema.nonNull(enumType)) }),
      not: schema.arg({ type: optional }),
    }),
  });
  const many: EnumNullableListFilterType<Enum> = schema.inputObject({
    name: `${enumType.graphQLType.name}NullableListFilter`,
    fields: () => ({
      // can be null
      equals: schema.arg({ type: schema.list(schema.nonNull(enumType)) }),
      // can be null
      has: schema.arg({ type: enumType }),
      hasEvery: schema.arg({ type: schema.list(schema.nonNull(enumType)) }),
      hasSome: schema.arg({ type: schema.list(schema.nonNull(enumType)) }),
      isEmpty: schema.arg({ type: enumType }),
    }),
  });
  return {
    optional,
    required,
    many,
  };
}
