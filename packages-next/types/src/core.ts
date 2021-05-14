import { IncomingMessage, ServerResponse } from 'http';
import type { GraphQLResolveInfo } from 'graphql';
import type { GqlNames, MaybePromise } from './utils';
import type { KeystoneContext, SessionContext } from './context';

/* TODO: Review these types */
type FieldDefaultValueArgs<T> = { context: KeystoneContext; originalInput?: T };

export type DatabaseProvider = 'sqlite' | 'postgresql';

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
  return {
    outputTypeName: listKey,
    itemQueryName: listKey,
    listQueryName: `all${pluralGraphQLName}`,
    listQueryCountName: `all${pluralGraphQLName}Count`,
    listSortName: `Sort${pluralGraphQLName}By`,
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
    manyRelationFilter: `${pluralGraphQLName}RelationFilter`,
  };
}
