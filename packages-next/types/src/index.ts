import type { FieldAccessControl } from './schema/access-control';
import type {
  BaseGeneratedListTypes,
  JSONValue,
  GqlNames,
  GraphQLContext,
  MaybePromise,
} from './utils';
import type { ListHooks } from './schema/hooks';
import { SessionStrategy } from './session';
import { SchemaConfig } from './schema';
import { IncomingMessage, ServerResponse } from 'http';
import { GraphQLSchema, ExecutionResult, DocumentNode } from 'graphql';
import { BaseListMeta, SerializedAdminMeta } from './admin-meta';
export * from './schema';
export * from './utils';
export * from './session';
export * from './admin-meta';

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

export type KeystoneAdminUIConfig = {
  /** Enables certain functionality in the Admin UI that expects the session to be an item */
  enableSessionItem?: boolean;
  /** A function that can be run to validate that the current session should have access to the Admin UI */
  isAccessAllowed?: (args: { session: any }) => MaybePromise<boolean>;
  /** An array of page routes that can be accessed without passing the isAccessAllowed check */
  publicPages?: string[];
  /** The basePath for the Admin UI App */
  path?: string;
  getAdditionalFiles?: ((system: KeystoneSystem) => MaybePromise<AdminFileToWrite[]>)[];
  pageMiddleware?: (args: {
    req: IncomingMessage;
    session: any;
    isValidSession: boolean;
    system: KeystoneSystem;
  }) => MaybePromise<{ kind: 'redirect'; to: string } | void>;
};

export type KeystoneConfig = {
  db: {
    adapter: 'mongoose' | 'knex';
    url: string;
    onConnect?: (keystone: any) => any;
  };
  graphql?: {
    path?: string;
    queryLimits?: {
      maxTotalResults?: number;
    };
  };
  session?: () => SessionStrategy<any>;
  ui?: KeystoneAdminUIConfig;
  server?: {
    /** Configuration options for the cors middleware. Set to true to core Keystone defaults */
    cors?: any;
  };
} & SchemaConfig;

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
  getAdminMeta?: (
    listKey: string,
    path: string,
    adminMeta: {
      enableSignout: boolean;
      enableSessionItem: boolean;
      lists: Record<string, BaseListMeta>;
    }
  ) => JSONValue;
};

/* TODO: Review these types */
type FieldDefaultValueArgs<T> = { context: GraphQLContext; originalInput?: T };
export type FieldDefaultValue<T> =
  | T
  | null
  | MaybePromise<(args: FieldDefaultValueArgs<T>) => T | null | undefined>;

export type KeystoneSystem = {
  keystone: any;
  config: KeystoneConfig;
  adminMeta: SerializedAdminMeta;
  graphQLSchema: GraphQLSchema;
  createContext: (args: { sessionContext?: SessionContext; skipAccessControl?: boolean }) => any;
  createContextFromRequest: (req: IncomingMessage, res: ServerResponse) => any;
  createSessionContext:
    | ((req: IncomingMessage, res: ServerResponse) => Promise<SessionContext>)
    | undefined;
  views: string[];
};

export type SessionContext = {
  session: any;
  startSession?(data: any): Promise<string>;
  endSession?(data: any): Promise<void>;
};

// TODO: This needs to be reviewed and expanded
export type BaseKeystoneList = {
  key: string;
  adminUILabels: {
    label: string;
    singular: string;
    plural: string;
    path: string;
  };
  gqlNames: {
    outputTypeName: string;
    itemQueryName: string;
    listQueryName: string;
    listQueryMetaName: string;
    listMetaName: string;
    listSortName: string;
    deleteMutationName: string;
    updateMutationName: string;
    createMutationName: string;
    deleteManyMutationName: string;
    updateManyMutationName: string;
    createManyMutationName: string;
    whereInputName: string;
    whereUniqueInputName: string;
    updateInputName: string;
    createInputName: string;
    updateManyInputName: string;
    createManyInputName: string;
    relateToManyInputName: string;
    relateToOneInputName: string;
  };
  listQuery(
    args: Record<string, any>,
    context: any,
    gqlName?: string,
    info?: any,
    from?: any
  ): Promise<Record<string, any>[]>;
  listQueryMeta(
    args: Record<string, any>,
    context: any,
    gqlName?: string,
    info?: any,
    from?: any
  ): {
    getCount: () => Promise<number>;
  };
  itemQuery(
    args: { where: { id: string } },
    context: any,
    gqlName?: string,
    info?: any
  ): Promise<Record<string, any>>;
  createMutation(
    data: Record<string, any>,
    context: any,
    mutationState?: any
  ): Promise<Record<string, any>>;
  createManyMutation(
    data: Record<string, any>[],
    context: any,
    mutationState?: any
  ): Promise<Record<string, any>[]>;
  updateMutation(
    id: string,
    data: Record<string, any>,
    context: any,
    mutationState?: any
  ): Promise<Record<string, any>>;
  updateManyMutation(
    data: Record<string, any>,
    context: any,
    mutationState?: any
  ): Promise<Record<string, any>[]>;
  deleteMutation(id: string, context: any, mutationState?: any): Promise<Record<string, any>>;
  deleteManyMutation(
    ids: string[],
    context: any,
    mutationState?: any
  ): Promise<Record<string, any>[]>;
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
  createContext: (args: { sessionContext?: SessionContext; skipAccessControl?: boolean }) => any;
  schema: GraphQLSchema;

  run: (args: GraphQLExecutionArguments) => Promise<Record<string, any>>;
  raw: (args: GraphQLExecutionArguments) => Promise<ExecutionResult>;
};

export type KeystoneListsAPI<
  KeystoneListsTypeInfo extends Record<string, BaseGeneratedListTypes>
> = {
  [Key in keyof KeystoneListsTypeInfo]: {
    findMany(
      args: KeystoneListsTypeInfo[Key]['args']['listQuery']
    ): Promise<readonly KeystoneListsTypeInfo[Key]['backing'][]>;
    findOne(args: {
      readonly where: { readonly id: string };
    }): Promise<KeystoneListsTypeInfo[Key]['backing'] | null>;
    count(args: KeystoneListsTypeInfo[Key]['args']['listQuery']): Promise<number>;
    updateOne(args: {
      readonly id: string;
      readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'];
    }): Promise<KeystoneListsTypeInfo[Key]['backing'] | null>;
    updateMany(args: {
      readonly data: readonly {
        readonly id: string;
        readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'];
      }[];
    }): Promise<(KeystoneListsTypeInfo[Key]['backing'] | null)[] | null>;
    createOne(args: {
      readonly data: KeystoneListsTypeInfo[Key]['inputs']['create'];
    }): Promise<KeystoneListsTypeInfo[Key]['backing'] | null>;
    createMany(args: {
      readonly data: readonly { readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'] }[];
    }): Promise<(KeystoneListsTypeInfo[Key]['backing'] | null)[] | null>;
    deleteOne(args: { readonly id: string }): Promise<KeystoneListsTypeInfo[Key]['backing'] | null>;
    deleteMany(args: {
      readonly ids: readonly string[];
    }): Promise<(KeystoneListsTypeInfo[Key]['backing'] | null)[] | null>;
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
