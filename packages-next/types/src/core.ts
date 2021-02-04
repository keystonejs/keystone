import type Knex from 'knex';
import type { ConnectOptions } from 'mongoose';
import { CorsOptions } from 'cors';
import type { FieldAccessControl } from './schema/access-control';
import type { BaseGeneratedListTypes, JSONValue, GqlNames, MaybePromise } from './utils';
import type { ListHooks } from './schema/hooks';
import { SessionStrategy } from './session';
import { ListSchemaConfig, ExtendGraphqlSchema } from './schema';
import { IncomingMessage, ServerResponse } from 'http';
import { GraphQLSchema, ExecutionResult, DocumentNode } from 'graphql';
import { AdminMetaRootVal } from './admin-meta';
import { BaseKeystone } from './base';

export type { ListHooks };

export type AdminFileToWrite =
  | {
      mode: 'write';
      src: string;
      outputPath: string;
    }
  | {
      mode: 'copy';
      inputPath: string;
      outputPath: string;
    };

export type AdminUIConfig = {
  /** Enables certain functionality in the Admin UI that expects the session to be an item */
  enableSessionItem?: boolean;
  /** A function that can be run to validate that the current session should have access to the Admin UI */
  isAccessAllowed?: (context: KeystoneContext) => MaybePromise<boolean>;
  /** An array of page routes that can be accessed without passing the isAccessAllowed check */
  publicPages?: string[];
  /** The basePath for the Admin UI App */
  path?: string;
  getAdditionalFiles?: ((config: KeystoneConfig) => MaybePromise<AdminFileToWrite[]>)[];
  pageMiddleware?: (args: {
    req: IncomingMessage;
    session: any;
    isValidSession: boolean;
    createContext: CreateContext;
  }) => MaybePromise<{ kind: 'redirect'; to: string } | void>;
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

export type DatabaseCommon = {
  url: string;
  onConnect?: (args: KeystoneContext) => Promise<void>;
};

export type GraphQLConfig = {
  // FIXME: We currently hardcode `/api/graphql` in a bunch of places
  // We should be able to use config.graphql.path to set this path.
  // path?: string;
  queryLimits?: {
    maxTotalResults?: number;
  };
};

export type KeystoneConfig = {
  lists: ListSchemaConfig;
  db: DatabaseCommon &
    (
      | {
          adapter: 'mongoose';
          mongooseOptions?: { mongoUri?: string } & ConnectOptions;
        }
      | {
          adapter: 'knex';
          dropDatabase?: boolean;
          knexOptions?: { client?: string; connection?: string } & Knex.Config<any>;
          schemaName?: string;
        }
      | {
          adapter: 'prisma_postgresql';
          dropDatabase?: boolean;
          provider?: string;
          getPrismaPath?: (arg: { prismaSchema: any }) => string;
          getDbSchemaName?: (arg: { prismaSchema: any }) => string;
          enableLogging?: boolean;
        }
    );
  graphql?: GraphQLConfig;
  session?: () => SessionStrategy<any>;
  ui?: AdminUIConfig;
  server?: {
    /** Configuration options for the cors middleware. Set to `true` to use core Keystone defaults */
    cors?: CorsOptions | true;
    /** Port number to start the server on. Defaults to process.env.PORT || 3000 */
    port?: number;
  };
  extendGraphqlSchema?: ExtendGraphqlSchema;
};

export type MaybeItemFunction<T> =
  | T
  | ((args: {
      session: any;
      item: { id: string | number; [path: string]: any };
    }) => MaybePromise<T>);
export type MaybeSessionFunction<T extends string | boolean> =
  | T
  | ((args: { session: any }) => MaybePromise<T>);

export type FieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  access?: FieldAccessControl<TGeneratedListTypes>;
  hooks?: ListHooks<TGeneratedListTypes>;
  label?: string;
  ui?: {
    views?: string;
    description?: string;
    createView?: {
      fieldMode?: MaybeSessionFunction<'edit' | 'hidden'>;
    };
    listView?: {
      fieldMode?: MaybeSessionFunction<'read' | 'hidden'>;
    };
    itemView?: {
      fieldMode?: MaybeItemFunction<'edit' | 'read' | 'hidden'>;
    };
  };
};

export type FieldType<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  /**
   * The real keystone type for the field
   */
  type: any;
  /**
   * The config for the field
   */
  config: FieldConfig<TGeneratedListTypes>;
  /**
   * The resolved path to the views for the field type
   */
  views: string;
  getAdminMeta?: (listKey: string, path: string, adminMeta: AdminMetaRootVal) => JSONValue;
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
