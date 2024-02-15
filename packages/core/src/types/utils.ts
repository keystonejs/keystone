export type JSONValue =
  | string
  | number
  | boolean
  | null
  | readonly JSONValue[]
  | { [key: string]: JSONValue }

export type MaybePromise<T> = T | Promise<T>

export function getGqlNames ({
  listKey,
  pluralGraphQLName,
}: {
  listKey: string
  pluralGraphQLName: string
}) {
  const lowerPluralName = pluralGraphQLName.charAt(0).toLowerCase() + pluralGraphQLName.slice(1)
  const lowerSingularName = listKey.charAt(0).toLowerCase() + listKey.slice(1)
  return {
    outputTypeName: listKey,
    itemQueryName: lowerSingularName,
    listQueryName: lowerPluralName,
    listQueryCountName: `${lowerPluralName}Count`,
    listOrderName: `${listKey}OrderByInput`,
    deleteMutationName: `delete${listKey}`,
    updateMutationName: `update${listKey}`,
    createMutationName: `create${listKey}`,
    deleteManyMutationName: `delete${pluralGraphQLName}`,
    updateManyMutationName: `update${pluralGraphQLName}`,
    createManyMutationName: `create${pluralGraphQLName}`,
    whereInputName: `${listKey}WhereInput`,
    whereUniqueInputName: `${listKey}WhereUniqueInput`,
    updateInputName: `${listKey}UpdateInput`,
    createInputName: `${listKey}CreateInput`,
    updateManyInputName: `${listKey}UpdateArgs`,
    relateToManyForCreateInputName: `${listKey}RelateToManyForCreateInput`,
    relateToManyForUpdateInputName: `${listKey}RelateToManyForUpdateInput`,
    relateToOneForCreateInputName: `${listKey}RelateToOneForCreateInput`,
    relateToOneForUpdateInputName: `${listKey}RelateToOneForUpdateInput`,
  }
}
