import { IncomingMessage, ServerResponse } from 'http';
import { GraphQLSchema, ExecutionResult, DocumentNode } from 'graphql';

import type { BaseGeneratedListTypes, GqlNames, MaybePromise } from './utils';
import { BaseKeystone } from './base';

// DatabaseAPIs is used to provide access to the underlying database abstraction through
// context and other developer-facing APIs in Keystone, so they can be used easily.

// The implementation is very basic, and assumes there's a single adapter keyed by the constructor
// name. Since there's no option _not_ to do that using the new config, we probably don't need
// anything more sophisticated than this.
export type DatabaseAPIs = {
  knex?: any;
  mongoose?: any;
  prisma?: any;
};

/* TODO: Review these types */
type FieldDefaultValueArgs<T> = { context: KeystoneContext; originalInput?: T };
export type FieldDefaultValue<T> =
  | T
  | null
  | MaybePromise<(args: FieldDefaultValueArgs<T>) => T | null | undefined>;

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

export type AccessControlContext = {
  getListAccessControlForUser: any; // TODO
  getFieldAccessControlForUser: any; // TODO
};

export type SessionContext<T> = {
  // Note: session is typed like this to acknowledge the default session shape
  // if you're using keystone's built-in session implementation, but we don't
  // actually know what it will look like.
  session?: { itemId: string; listKey: string; data?: Record<string, any> } | any;
  startSession(data: T): Promise<string>;
  endSession(): Promise<void>;
};

export type KeystoneContext = {
  schemaName: 'public';
  lists: KeystoneListsAPI<any>;
  totalResults: number;
  keystone: BaseKeystone;
  graphql: KeystoneGraphQLAPI<any>;
  /** @deprecated */
  executeGraphQL: any; // TODO: type this
  /** @deprecated */
  gqlNames: (listKey: string) => Record<string, string>; // TODO: actual keys
  maxTotalResults: number;
  createContext: CreateContext;
  req?: IncomingMessage;
} & AccessControlContext &
  Partial<SessionContext<any>> &
  DatabaseAPIs;

export type GraphQLResolver = (root: any, args: any, context: KeystoneContext) => any;

export type GraphQLSchemaExtension = {
  typeDefs: string;
  resolvers: Record<string, Record<string, GraphQLResolver>>;
};

type GraphQLExecutionArguments = {
  context?: any;
  query: string | DocumentNode;
  variables: Record<string, any>;
};
export type KeystoneGraphQLAPI<
  // this is here because it will be used soon
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  KeystoneListsTypeInfo extends Record<string, BaseGeneratedListTypes>
> = {
  createContext: CreateContext;
  schema: GraphQLSchema;

  run: (args: GraphQLExecutionArguments) => Promise<Record<string, any>>;
  raw: (args: GraphQLExecutionArguments) => Promise<ExecutionResult>;
};

type ResolveFields = { readonly resolveFields?: false | string };

export type KeystoneListsAPI<
  KeystoneListsTypeInfo extends Record<string, BaseGeneratedListTypes>
> = {
  [Key in keyof KeystoneListsTypeInfo]: {
    findMany(
      args: KeystoneListsTypeInfo[Key]['args']['listQuery'] & ResolveFields
    ): Promise<readonly KeystoneListsTypeInfo[Key]['backing'][]>;
    findOne(
      args: { readonly where: { readonly id: string } } & ResolveFields
    ): Promise<KeystoneListsTypeInfo[Key]['backing'] | null>;
    count(args: KeystoneListsTypeInfo[Key]['args']['listQuery']): Promise<number>;
    updateOne(
      args: {
        readonly id: string;
        readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'];
      } & ResolveFields
    ): Promise<KeystoneListsTypeInfo[Key]['backing'] | null>;
    updateMany(
      args: {
        readonly data: readonly {
          readonly id: string;
          readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'];
        }[];
      } & ResolveFields
    ): Promise<(KeystoneListsTypeInfo[Key]['backing'] | null)[] | null>;
    createOne(
      args: { readonly data: KeystoneListsTypeInfo[Key]['inputs']['create'] } & ResolveFields
    ): Promise<KeystoneListsTypeInfo[Key]['backing'] | null>;
    createMany(
      args: {
        readonly data: readonly { readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'] }[];
      } & ResolveFields
    ): Promise<(KeystoneListsTypeInfo[Key]['backing'] | null)[] | null>;
    deleteOne(
      args: { readonly id: string } & ResolveFields
    ): Promise<KeystoneListsTypeInfo[Key]['backing'] | null>;
    deleteMany(
      args: { readonly ids: readonly string[] } & ResolveFields
    ): Promise<(KeystoneListsTypeInfo[Key]['backing'] | null)[] | null>;
  };
};

const preventInvalidUnderscorePrefix = (str: string) => str.replace(/^__/, '_');

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
  return {
    outputTypeName: listKey,
    itemQueryName: _itemQueryName,
    listQueryName: `all${_listQueryName}`,
    listQueryMetaName: `_all${_listQueryName}Meta`,
    listMetaName: preventInvalidUnderscorePrefix(`_${_listQueryName}Meta`),
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
  };
}
