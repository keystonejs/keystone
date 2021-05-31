import { GqlNames } from '@keystone-next/types';

export function getGqlNames({
  listKey,
  pluralGraphQLName,
}: {
  listKey: string;
  pluralGraphQLName: string;
}): GqlNames {
  const _lowerListName = pluralGraphQLName.slice(0, 1).toLowerCase() + pluralGraphQLName.slice(1);
  return {
    outputTypeName: listKey,
    itemQueryName: listKey,
    listQueryName: `all${pluralGraphQLName}`,
    listQueryMetaName: `_all${pluralGraphQLName}Meta`,
    listQueryCountName: `${_lowerListName}Count`,
    listSortName: `Sort${pluralGraphQLName}By`,
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
    updateManyInputName: `${pluralGraphQLName}UpdateInput`,
    createManyInputName: `${pluralGraphQLName}CreateInput`,
    relateToManyInputName: `${listKey}RelateToManyInput`,
    relateToOneInputName: `${listKey}RelateToOneInput`,
  };
}
