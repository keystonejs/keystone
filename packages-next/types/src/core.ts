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
  itemQueryName: _itemQueryName,
  listQueryName: _listQueryName,
}: {
  listKey: string;
  itemQueryName: string;
  listQueryName: string;
}): GqlNames {
  const _lowerListName = _listQueryName.slice(0, 1).toLowerCase() + _listQueryName.slice(1);
  return {
    outputTypeName: listKey,
    itemQueryName: _itemQueryName,
    listQueryName: `all${_listQueryName}`,
    listQueryMetaName: `_all${_listQueryName}Meta`,
    listQueryCountName: `${_lowerListName}Count`,
    listSortName: `Sort${_listQueryName}By`,
    listOrderName: `${_itemQueryName}OrderByInput`,
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
  };
}
