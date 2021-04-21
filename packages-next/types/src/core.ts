import { IncomingMessage, ServerResponse } from 'http';
import type { GqlNames, MaybePromise } from './utils';
import type { KeystoneContext, SessionContext } from './context';

/* TODO: Review these types */
type FieldDefaultValueArgs<T> = { context: KeystoneContext; originalInput?: T };

export type FieldDefaultValue<T> =
  | T
  | null
  | ((args: FieldDefaultValueArgs<T>) => MaybePromise<T | null | undefined>);

export type CreateContext = (args: {
  sessionContext?: SessionContext<any>;
  skipAccessControl?: boolean;
  req?: IncomingMessage;
}) => KeystoneContext;

export type SessionImplementation = {
  createSessionContext(
    req: IncomingMessage,
    res: ServerResponse,
    createContext: CreateContext
  ): Promise<SessionContext<any>>;
};

export type GraphQLResolver = (root: any, args: any, context: KeystoneContext, info?: any) => any;

export type GraphQLSchemaExtension = {
  typeDefs: string;
  resolvers: Record<string, Record<string, GraphQLResolver>>;
};

// TODO: don't duplicate this between here and packages/keystone/ListTypes/list.js
export function getGqlNames({
  listKey,
  singularGraphQLName: _itemQueryName,
  pluralGraphQLName: _listQueryName,
}: {
  listKey: string;
  singularGraphQLName: string;
  pluralGraphQLName: string;
}): GqlNames {
  return {
    outputTypeName: listKey,
    itemQueryName: _itemQueryName,
    listQueryName: `all${_listQueryName}`,
    listQueryMetaName: `_all${_listQueryName}Meta`,
    listSortName: `Sort${_listQueryName}By`,
    deleteMutationName: `delete${_itemQueryName}`,
    updateMutationName: `update${_itemQueryName}`,
    createMutationName: `create${_itemQueryName}`,
    deleteManyMutationName: `delete${_listQueryName}`,
    updateManyMutationName: `update${_listQueryName}`,
    createManyMutationName: `create${_listQueryName}`,
    whereInputName: `${_itemQueryName}WhereInput`,
    whereUniqueInputName: `${_itemQueryName}WhereUniqueInput`,
    updateInputName: `${_itemQueryName}UpdateInput`,
    createInputName: `${_itemQueryName}CreateInput`,
    updateManyInputName: `${_listQueryName}UpdateInput`,
    createManyInputName: `${_listQueryName}CreateInput`,
    relateToManyInputName: `${_itemQueryName}RelateToManyInput`,
    relateToOneInputName: `${_itemQueryName}RelateToOneInput`,
    manyRelationFilter: `${_listQueryName}RelationFilter`,
  };
}
