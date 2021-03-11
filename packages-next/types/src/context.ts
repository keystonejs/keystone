import { IncomingMessage } from 'http';
import { GraphQLSchema, ExecutionResult, DocumentNode } from 'graphql';
import { BaseKeystone } from './base';
import type { BaseGeneratedListTypes } from './utils';

export type KeystoneContext = {
  req?: IncomingMessage;
  lists: KeystoneListsAPI<any>;
  graphql: KeystoneGraphQLAPI<any>;
  sudo: () => KeystoneContext;
  exitSudo: () => KeystoneContext;
  withSession: (session: any) => KeystoneContext;
  totalResults: number;
  maxTotalResults: number;
  schemaName: 'public' | 'internal';
  /** @deprecated */
  gqlNames: (listKey: string) => Record<string, string>; // TODO: actual keys
  /** @deprecated */
  executeGraphQL: any; // TODO: type this
  /** @deprecated */
  keystone: BaseKeystone;
} & AccessControlContext &
  Partial<SessionContext<any>> &
  DatabaseAPIs;

// List item API

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

type ResolveFields = { readonly resolveFields?: false | string };

// GraphQL API

export type KeystoneGraphQLAPI<
  // this is here because it will be used soon
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  KeystoneListsTypeInfo extends Record<string, BaseGeneratedListTypes>
> = {
  schema: GraphQLSchema;
  run: (args: GraphQLExecutionArguments) => Promise<Record<string, any>>;
  raw: (args: GraphQLExecutionArguments) => Promise<ExecutionResult>;
};

type GraphQLExecutionArguments = {
  query: string | DocumentNode;
  variables: Record<string, any>;
};

// Access control API

export type AccessControlContext = {
  getListAccessControlForUser: any; // TODO
  getFieldAccessControlForUser: any; // TODO
};

// Session API

export type SessionContext<T> = {
  // Note: session is typed like this to acknowledge the default session shape
  // if you're using keystone's built-in session implementation, but we don't
  // actually know what it will look like.
  session?: { itemId: string; listKey: string; data?: Record<string, any> } | any;
  startSession(data: T): Promise<string>;
  endSession(): Promise<void>;
};

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
