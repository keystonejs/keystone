import { IncomingMessage } from 'http';
import { Readable } from 'stream';
import { GraphQLSchema, ExecutionResult, DocumentNode } from 'graphql';
import { BaseKeystone } from './base';
import type { BaseGeneratedListTypes } from './utils';

export type KeystoneContext = {
  req?: IncomingMessage;
  db: { lists: KeystoneDbAPI<any> };
  lists: KeystoneListsAPI<any>;
  graphql: KeystoneGraphQLAPI<any>;
  sudo: () => KeystoneContext;
  exitSudo: () => KeystoneContext;
  withSession: (session: any) => KeystoneContext;
  // TODO: Correctly type this as a prisma client
  prisma: any;
  files: FilesContext | undefined;
  images: ImagesContext | undefined;
  totalResults: number;
  maxTotalResults: number;
  schemaName: 'public' | 'internal';
  /** @deprecated */
  gqlNames: (listKey: string) => Record<string, string>; // TODO: actual keys
  /** @deprecated */
  keystone: BaseKeystone;
} & AccessControlContext &
  Partial<SessionContext<any>>;

// List item API

// TODO: Work out whether we can generate useful return types based on the GraphQL Query
// passed to List API functions (see `readonly Record<string, any>` below)

export type KeystoneListsAPI<
  KeystoneListsTypeInfo extends Record<string, BaseGeneratedListTypes>
> = {
  [Key in keyof KeystoneListsTypeInfo]: {
    findMany(
      args?: KeystoneListsTypeInfo[Key]['args']['listQuery'] & ResolveFields
    ): Promise<readonly Record<string, any>[]>;
    findOne(
      args: { readonly where: { readonly id: string } } & ResolveFields
    ): Promise<Record<string, any>>;
    count(args?: KeystoneListsTypeInfo[Key]['args']['listQuery']): Promise<number>;
    updateOne(
      args: {
        readonly id: string;
        readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'];
      } & ResolveFields
    ): Promise<Record<string, any>>;
    updateMany(
      args: {
        readonly data: readonly {
          readonly id: string;
          readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'];
        }[];
      } & ResolveFields
    ): Promise<Record<string, any>[]>;
    createOne(
      args: { readonly data: KeystoneListsTypeInfo[Key]['inputs']['create'] } & ResolveFields
    ): Promise<Record<string, any>>;
    createMany(
      args: {
        readonly data: readonly { readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'] }[];
      } & ResolveFields
    ): Promise<Record<string, any>[]>;
    deleteOne(args: { readonly id: string } & ResolveFields): Promise<Record<string, any> | null>;
    deleteMany(
      args: { readonly ids: readonly string[] } & ResolveFields
    ): Promise<Record<string, any>[]>;
  };
};

type ResolveFields = {
  /**
   * @default 'id'
   */
  readonly query?: string;
  /**
   * @deprecated
   *
   * resolveFields has been deprecated. Please use the `query` param to query fields,
   * or `context.db.lists.{List}` instead of passing `resolveFields: false`
   */
  readonly resolveFields?: false | string;
};

export type KeystoneDbAPI<KeystoneListsTypeInfo extends Record<string, BaseGeneratedListTypes>> = {
  [Key in keyof KeystoneListsTypeInfo]: {
    findMany(
      args?: KeystoneListsTypeInfo[Key]['args']['listQuery']
    ): Promise<readonly KeystoneListsTypeInfo[Key]['backing'][]>;
    findOne(args: {
      readonly where: { readonly id: string };
    }): Promise<KeystoneListsTypeInfo[Key]['backing']>;
    count(args?: KeystoneListsTypeInfo[Key]['args']['listQuery']): Promise<number>;
    updateOne(args: {
      readonly id: string;
      readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'];
    }): Promise<KeystoneListsTypeInfo[Key]['backing']>;
    updateMany(args: {
      readonly data: readonly {
        readonly id: string;
        readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'];
      }[];
    }): Promise<KeystoneListsTypeInfo[Key]['backing'][]>;
    createOne(args: {
      readonly data: KeystoneListsTypeInfo[Key]['inputs']['create'];
    }): Promise<KeystoneListsTypeInfo[Key]['backing']>;
    createMany(args: {
      readonly data: readonly { readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'] }[];
    }): Promise<KeystoneListsTypeInfo[Key]['backing'][]>;
    deleteOne(args: { readonly id: string }): Promise<KeystoneListsTypeInfo[Key]['backing']>;
    deleteMany(args: {
      readonly ids: readonly string[];
    }): Promise<KeystoneListsTypeInfo[Key]['backing'][]>;
  };
};

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
  variables?: Record<string, any>;
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

// Files API

export type FileMode = 'local';

export type FileData = {
  mode: FileMode;
  filename: string;
  filesize: number;
};

export type FilesContext = {
  getSrc: (mode: FileMode, filename: string) => string;
  getDataFromRef: (ref: string) => Promise<FileData>;
  getDataFromStream: (stream: Readable, filename: string) => Promise<FileData>;
};

// Images API

export type ImageMode = 'local';

export type ImageExtension = 'jpg' | 'png' | 'webp' | 'gif';

export type ImageData = {
  mode: ImageMode;
  id: string;
  extension: ImageExtension;
  filesize: number;
  width: number;
  height: number;
};

export type ImagesContext = {
  getSrc: (mode: ImageMode, id: string, extension: ImageExtension) => string;
  getDataFromRef: (ref: string) => Promise<ImageData>;
  getDataFromStream: (stream: Readable) => Promise<ImageData>;
};
