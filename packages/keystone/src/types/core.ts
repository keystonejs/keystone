import { IncomingMessage, ServerResponse } from 'http';
import type { GraphQLResolveInfo } from 'graphql';
import type { BaseGeneratedListTypes, GqlNames, MaybePromise } from './utils';
import type { KeystoneContext, SessionContext } from './context';

type FieldDefaultValueArgs<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  context: KeystoneContext;
  originalInput: TGeneratedListTypes['inputs']['create'];
};

export type DatabaseProvider = 'sqlite' | 'postgresql';

export type FieldDefaultValue<T, TGeneratedListTypes extends BaseGeneratedListTypes> =
  | T
  | null
  | ((args: FieldDefaultValueArgs<TGeneratedListTypes>) => MaybePromise<T | null | undefined>);

export type CreateContext = (args: {
  sessionContext?: SessionContext<any>;
  sudo?: boolean;
  req?: IncomingMessage;
}) => KeystoneContext;

export type SessionImplementation = {
  createSessionContext(
    req: IncomingMessage,
    res: ServerResponse,
    createContext: CreateContext
  ): Promise<SessionContext<any>>;
};

export type GraphQLResolver = (
  root: any,
  args: any,
  context: KeystoneContext,
  info: GraphQLResolveInfo
) => any;

export type GraphQLSchemaExtension = {
  typeDefs: string;
  resolvers: Record<string, Record<string, GraphQLResolver>>;
};

// TODO: don't duplicate this between here and packages/keystone/ListTypes/list.js
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
