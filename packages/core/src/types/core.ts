import type { GraphQLResolveInfo } from 'graphql';
import type { GqlNames } from './utils';
import type { KeystoneContext } from './context';

export type DatabaseProvider = 'sqlite' | 'postgresql' | 'mysql';

export type GraphQLResolver<Context extends KeystoneContext> = (
  root: any,
  args: any,
  context: Context,
  info: GraphQLResolveInfo
) => any;

export type GraphQLSchemaExtension<Context extends KeystoneContext> = {
  typeDefs: string;
  resolvers: Record<string, Record<string, GraphQLResolver<Context>>>;
};

// TODO: don't duplicate this between here and packages/core/ListTypes/list.js
export function getGqlNames({
  listKey,
  pluralGraphQLName,
}: {
  listKey: string;
  pluralGraphQLName: string;
}): GqlNames {
  const lowerPluralName = pluralGraphQLName.slice(0, 1).toLowerCase() + pluralGraphQLName.slice(1);
  const lowerSingularName = listKey.slice(0, 1).toLowerCase() + listKey.slice(1);
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
  };
}
