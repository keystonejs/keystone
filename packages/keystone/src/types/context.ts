import { IncomingMessage } from 'http';
import { Readable } from 'stream';
import { GraphQLSchema, ExecutionResult, DocumentNode } from 'graphql';
import { InitialisedList } from '../lib/core/types-for-lists';
import type { BaseGeneratedListTypes, GqlNames } from './utils';

export type KeystoneContext = {
  req?: IncomingMessage;
  db: { lists: KeystoneDbAPI<Record<string, BaseGeneratedListTypes>> };
  lists: KeystoneListsAPI<Record<string, BaseGeneratedListTypes>>;
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
  /** @deprecated */
  gqlNames: (listKey: string) => GqlNames;
  experimental?: {
    /** @deprecated This value is only available if you have config.experimental.contextInitialisedLists = true.
     * This is not a stable API and may contain breaking changes in `patch` level releases.
     */
    initialisedLists: Record<string, InitialisedList>;
  };
} & Partial<SessionContext<any>>;

// List item API

// TODO: Work out whether we can generate useful return types based on the GraphQL Query
// passed to List API functions (see `readonly Record<string, any>` below)

export type KeystoneListsAPI<KeystoneListsTypeInfo extends Record<string, BaseGeneratedListTypes>> =
  {
    [Key in keyof KeystoneListsTypeInfo]: {
      findMany(
        args?: KeystoneListsTypeInfo[Key]['args']['listQuery'] & ResolveFields
      ): Promise<readonly Record<string, any>[]>;
      findOne(
        args: {
          readonly where: KeystoneListsTypeInfo[Key]['inputs']['uniqueWhere'];
        } & ResolveFields
      ): Promise<Record<string, any>>;
      count(args?: {
        readonly where?: KeystoneListsTypeInfo[Key]['inputs']['where'];
      }): Promise<number>;
      updateOne(
        args: {
          readonly where: KeystoneListsTypeInfo[Key]['inputs']['uniqueWhere'];
          readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'];
        } & ResolveFields
      ): Promise<Record<string, any>>;
      updateMany(
        args: {
          readonly data: readonly {
            readonly where: KeystoneListsTypeInfo[Key]['inputs']['uniqueWhere'];
            readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'];
          }[];
        } & ResolveFields
      ): Promise<Record<string, any>[]>;
      createOne(
        args: { readonly data: KeystoneListsTypeInfo[Key]['inputs']['create'] } & ResolveFields
      ): Promise<Record<string, any>>;
      createMany(
        args: {
          readonly data: readonly KeystoneListsTypeInfo[Key]['inputs']['create'][];
        } & ResolveFields
      ): Promise<Record<string, any>[]>;
      deleteOne(
        args: {
          readonly where: KeystoneListsTypeInfo[Key]['inputs']['uniqueWhere'];
        } & ResolveFields
      ): Promise<Record<string, any> | null>;
      deleteMany(
        args: {
          readonly where: readonly KeystoneListsTypeInfo[Key]['inputs']['uniqueWhere'][];
        } & ResolveFields
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
      readonly where: KeystoneListsTypeInfo[Key]['inputs']['uniqueWhere'];
    }): Promise<KeystoneListsTypeInfo[Key]['backing']>;
    count(args?: {
      readonly where?: KeystoneListsTypeInfo[Key]['inputs']['where'];
    }): Promise<number>;
    updateOne(args: {
      readonly where: KeystoneListsTypeInfo[Key]['inputs']['uniqueWhere'];
      readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'];
    }): Promise<KeystoneListsTypeInfo[Key]['backing']>;
    updateMany(args: {
      readonly data: readonly {
        readonly where: KeystoneListsTypeInfo[Key]['inputs']['uniqueWhere'];
        readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'];
      }[];
    }): Promise<KeystoneListsTypeInfo[Key]['backing'][]>;
    createOne(args: {
      readonly data: KeystoneListsTypeInfo[Key]['inputs']['create'];
    }): Promise<KeystoneListsTypeInfo[Key]['backing']>;
    createMany(args: {
      readonly data: readonly KeystoneListsTypeInfo[Key]['inputs']['create'][];
    }): Promise<KeystoneListsTypeInfo[Key]['backing'][]>;
    deleteOne(args: {
      readonly where: KeystoneListsTypeInfo[Key]['inputs']['uniqueWhere'];
    }): Promise<KeystoneListsTypeInfo[Key]['backing']>;
    deleteMany(args: {
      readonly where: readonly KeystoneListsTypeInfo[Key]['inputs']['uniqueWhere'][];
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

// Session API

export type SessionContext<T> = {
  // Note: session is typed like this to acknowledge the default session shape
  // if you're using keystone's built-in session implementation, but we don't
  // actually know what it will look like.
  session?: { itemId: string; listKey: string; data?: Record<string, any> } | any;
  startSession(data: T): Promise<string>;
  endSession(): Promise<void>;
};

export type AssetMode = 'local' | 'keystone-cloud';

// Files API

export type FileData = {
  mode: AssetMode;
  filename: string;
  filesize: number;
};

export type FilesContext = {
  getSrc: (mode: AssetMode, filename: string) => Promise<string>;
  getDataFromRef: (ref: string) => Promise<FileData>;
  getDataFromStream: (stream: Readable, filename: string) => Promise<FileData>;
};

// Images API

export type ImageExtension = 'jpg' | 'png' | 'webp' | 'gif';

export type ImageMetadata = {
  extension: ImageExtension;
  filesize: number;
  width: number;
  height: number;
};

export type ImageData = {
  mode: AssetMode;
  id: string;
} & ImageMetadata;

export type ImagesContext = {
  getSrc: (mode: AssetMode, id: string, extension: ImageExtension) => Promise<string>;
  getDataFromRef: (ref: string) => Promise<ImageData>;
  getDataFromStream: (stream: Readable) => Promise<ImageData>;
};
