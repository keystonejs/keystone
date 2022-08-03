import { IncomingMessage } from 'http';
import { Readable } from 'stream';
import { GraphQLSchema, ExecutionResult, DocumentNode } from 'graphql';
import { InitialisedModel } from '../lib/core/types-for-lists';
import { BaseModelTypeInfo } from './type-info';
import { GqlNames, BaseKeystoneTypeInfo } from '.';

export type KeystoneContext<TypeInfo extends BaseKeystoneTypeInfo = BaseKeystoneTypeInfo> = {
  req?: IncomingMessage;
  db: KeystoneDbAPI<TypeInfo['models']>;
  query: KeystoneQueryAPI<TypeInfo['models']>;
  graphql: KeystoneGraphQLAPI;
  sudo: () => KeystoneContext<TypeInfo>;
  exitSudo: () => KeystoneContext<TypeInfo>;
  withSession: (session: any) => KeystoneContext<TypeInfo>;
  prisma: TypeInfo['prisma'];
  files: FilesContext;
  images: ImagesContext;
  totalResults: number;
  maxTotalResults: number;
  /** @deprecated */
  gqlNames: (modelKey: string) => GqlNames;
  experimental?: {
    /** @deprecated This value is only available if you have config.experimental.initialisedModels = true.
     * This is not a stable API and may contain breaking changes in `patch` level releases.
     */
    initialisedModels: Record<string, InitialisedModel>;
  };
} & Partial<SessionContext<any>>;

// Model item API

// TODO: Work out whether we can generate useful return types based on the GraphQL Query
// passed to List API functions (see `readonly Record<string, any>` below)

export type KeystoneQueryAPI<KeystoneModelTypeInfo extends Record<string, BaseModelTypeInfo>> = {
  [Key in keyof KeystoneModelTypeInfo]: {
    findMany(
      args?: {
        readonly where?: KeystoneModelTypeInfo[Key]['inputs']['where'];
        readonly take?: number;
        readonly skip?: number;
        readonly orderBy?:
          | KeystoneModelTypeInfo[Key]['inputs']['orderBy']
          | readonly KeystoneModelTypeInfo[Key]['inputs']['orderBy'][];
      } & ResolveFields
    ): Promise<readonly Record<string, any>[]>;
    findOne(
      args: {
        readonly where: KeystoneModelTypeInfo[Key]['inputs']['uniqueWhere'];
      } & ResolveFields
    ): Promise<Record<string, any>>;
    count(args?: {
      readonly where?: KeystoneModelTypeInfo[Key]['inputs']['where'];
    }): Promise<number>;
    updateOne(
      args: {
        readonly where: KeystoneModelTypeInfo[Key]['inputs']['uniqueWhere'];
        readonly data: KeystoneModelTypeInfo[Key]['inputs']['update'];
      } & ResolveFields
    ): Promise<Record<string, any>>;
    updateMany(
      args: {
        readonly data: readonly {
          readonly where: KeystoneModelTypeInfo[Key]['inputs']['uniqueWhere'];
          readonly data: KeystoneModelTypeInfo[Key]['inputs']['update'];
        }[];
      } & ResolveFields
    ): Promise<Record<string, any>[]>;
    createOne(
      args: { readonly data: KeystoneModelTypeInfo[Key]['inputs']['create'] } & ResolveFields
    ): Promise<Record<string, any>>;
    createMany(
      args: {
        readonly data: readonly KeystoneModelTypeInfo[Key]['inputs']['create'][];
      } & ResolveFields
    ): Promise<Record<string, any>[]>;
    deleteOne(
      args: {
        readonly where: KeystoneModelTypeInfo[Key]['inputs']['uniqueWhere'];
      } & ResolveFields
    ): Promise<Record<string, any> | null>;
    deleteMany(
      args: {
        readonly where: readonly KeystoneModelTypeInfo[Key]['inputs']['uniqueWhere'][];
      } & ResolveFields
    ): Promise<Record<string, any>[]>;
  };
};

type ResolveFields = {
  /**
   * @default 'id'
   */
  readonly query?: string;
};

export type KeystoneDbAPI<KeystoneModelTypeInfo extends Record<string, BaseModelTypeInfo>> = {
  [Key in keyof KeystoneModelTypeInfo]: {
    findMany(args?: {
      readonly where?: KeystoneModelTypeInfo[Key]['inputs']['where'];
      readonly take?: number;
      readonly skip?: number;
      readonly orderBy?:
        | KeystoneModelTypeInfo[Key]['inputs']['orderBy']
        | readonly KeystoneModelTypeInfo[Key]['inputs']['orderBy'][];
    }): Promise<readonly KeystoneModelTypeInfo[Key]['item'][]>;
    findOne(args: {
      readonly where: KeystoneModelTypeInfo[Key]['inputs']['uniqueWhere'];
    }): Promise<KeystoneModelTypeInfo[Key]['item'] | null>;
    count(args?: {
      readonly where?: KeystoneModelTypeInfo[Key]['inputs']['where'];
    }): Promise<number>;
    updateOne(args: {
      readonly where: KeystoneModelTypeInfo[Key]['inputs']['uniqueWhere'];
      readonly data: KeystoneModelTypeInfo[Key]['inputs']['update'];
    }): Promise<KeystoneModelTypeInfo[Key]['item']>;
    updateMany(args: {
      readonly data: readonly {
        readonly where: KeystoneModelTypeInfo[Key]['inputs']['uniqueWhere'];
        readonly data: KeystoneModelTypeInfo[Key]['inputs']['update'];
      }[];
    }): Promise<KeystoneModelTypeInfo[Key]['item'][]>;
    createOne(args: {
      readonly data: KeystoneModelTypeInfo[Key]['inputs']['create'];
    }): Promise<KeystoneModelTypeInfo[Key]['item']>;
    createMany(args: {
      readonly data: readonly KeystoneModelTypeInfo[Key]['inputs']['create'][];
    }): Promise<KeystoneModelTypeInfo[Key]['item'][]>;
    deleteOne(args: {
      readonly where: KeystoneModelTypeInfo[Key]['inputs']['uniqueWhere'];
    }): Promise<KeystoneModelTypeInfo[Key]['item']>;
    deleteMany(args: {
      readonly where: readonly KeystoneModelTypeInfo[Key]['inputs']['uniqueWhere'][];
    }): Promise<KeystoneModelTypeInfo[Key]['item'][]>;
  };
};

// GraphQL API

export type KeystoneGraphQLAPI = {
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
  session?: { itemId: string; modelKey: string; data?: Record<string, any> } | any;
  startSession(data: T): Promise<string>;
  endSession(): Promise<void>;
};

export type AssetMode = 'local' | 's3';

// Files API

export type FileMetadata = {
  filename: string;
  filesize: number;
};

export type FileData = {
  filename: string;
} & FileMetadata;

export type FilesContext = (storage: string) => {
  getUrl: (filename: string) => Promise<string>;
  getDataFromStream: (stream: Readable, filename: string) => Promise<FileData>;
  deleteAtSource: (filename: string) => Promise<void>;
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
  id: string;
} & ImageMetadata;

export type ImagesContext = (storage: string) => {
  getUrl: (id: string, extension: ImageExtension) => Promise<string>;
  getDataFromStream: (stream: Readable, filename: string) => Promise<ImageData>;
  deleteAtSource: (id: string, extension: ImageExtension) => Promise<void>;
};
