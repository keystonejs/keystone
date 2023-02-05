import type { Server } from 'http';
import type { ListenOptions } from 'net';
import type { ApolloServerOptions } from '@apollo/server';
import { CorsOptions } from 'cors';
import express from 'express';
import type { GraphQLSchema } from 'graphql';
import type { Options as BodyParserOptions } from 'body-parser';

import type { AssetMode, BaseKeystoneTypeInfo, KeystoneContext, DatabaseProvider } from '..';

import { SessionStrategy } from '../session';
import type { MaybePromise } from '../utils';
import type {
  ListSchemaConfig,
  ListConfig,
  MaybeSessionFunction,
  MaybeItemFunction,
  IdFieldConfig,
} from './lists';
import type { BaseFields } from './fields';
import type { ListAccessControl, FieldAccessControl } from './access-control';
import type { ListHooks } from './hooks';

type FileOrImage =
  // is given full file name, returns file name that will be used at
  | { type: 'file'; transformName?: (filename: string) => MaybePromise<string> }
  // return does not include extension, extension is handed over in case they want to use it
  | {
      type: 'image';
      // is given full file name, returns file name that will be used at
      transformName?: (filename: string, extension: string) => MaybePromise<string>;
    };

export type StorageConfig = (
  | {
      /** The kind of storage being configured */
      kind: 'local';
      /** The path to where the asset will be stored on disc, eg 'public/images' */
      storagePath: string;
      /** A function that receives a partial url, whose return will be used as the URL in graphql
       *
       * For example, a local dev usage of this might be:
       * ```ts
       * path => `http://localhost:3000/images${path}`
       * ```
       */
      generateUrl: (path: string) => string;
      /** The configuration for keystone's hosting of the assets - if set to null, keystone will not host the assets */
      serverRoute: {
        /** The partial path that the assets will be hosted at by keystone, eg `/images` or `/our-cool-files` */
        path: string;
      } | null;
      /** Sets whether the assets should be preserved locally on removal from keystone's database */
      preserve?: boolean;
      transformName?: (filename: string) => string;
    }
  | {
      /** The kind of storage being configured */
      kind: 's3';
      /** Sets signing of the asset - for use when you want private assets */
      signed?: { expiry: number };
      generateUrl?: (path: string) => string;
      /** Sets whether the assets should be preserved locally on removal from keystone's database */
      preserve?: boolean;
      pathPrefix?: string;
      /** Your s3 instance's bucket name */
      bucketName: string;
      /** Your s3 instance's region */
      region: string;
      /** An access Key ID with write access to your S3 instance */
      accessKeyId: string;
      /** The secret access key that gives permissions to your access Key Id */
      secretAccessKey: string;
      /** An endpoint to use - to be provided if you are not using AWS as your endpoint */
      endpoint?: string;
      /** If true, will force the 'old' S3 path style of putting bucket name at the start of the pathname of the URL  */
      forcePathStyle?: boolean;
      /** A string that sets permissions for the uploaded assets. Default is 'private'.
       *
       * Amazon S3 supports a set of predefined grants, known as canned ACLs.
       * See https://docs.aws.amazon.com/AmazonS3/latest/userguide/acl-overview.html#canned-acl
       * for more details.
       */
      acl?:
        | 'private'
        | 'public-read'
        | 'public-read-write'
        | 'aws-exec-read'
        | 'authenticated-read'
        | 'bucket-owner-read'
        | 'bucket-owner-full-control';
    }
) &
  FileOrImage;

export type KeystoneConfig<TypeInfo extends BaseKeystoneTypeInfo = BaseKeystoneTypeInfo> = {
  lists: ListSchemaConfig;
  db: DatabaseConfig<TypeInfo>;
  ui?: AdminUIConfig<TypeInfo>;
  server?: ServerConfig<TypeInfo>;
  session?: SessionStrategy<any>;
  graphql?: GraphQLConfig;
  extendGraphqlSchema?: ExtendGraphqlSchema;
  /** An object containing configuration about keystone's various external storages.
   *
   * Each entry should be of either `kind: 'local'` or `kind: 's3'`, and follow the configuration of each.
   *
   * When configuring a `file` or `image` field that uses the storage, use the key in the storage object
   * as the `storage` option for that field.
   */
  storage?: Record<string, StorageConfig>;
  /** Telemetry boolean to disable telemetry for this project */
  telemetry?: boolean;
  /** Experimental config options */
  experimental?: {
    /** Adds the internal data structure `experimental.initialisedLists` to the context object.
     * This is not a stable API and may contain breaking changes in `patch` level releases.
     */
    contextInitialisedLists?: boolean;
  };
};

// config.lists

export type { ListSchemaConfig, ListConfig, BaseFields, MaybeSessionFunction, MaybeItemFunction };

// config.db

export type DatabaseConfig<TypeInfo extends BaseKeystoneTypeInfo> = {
  url: string;
  shadowDatabaseUrl?: string;
  onConnect?: (args: KeystoneContext<TypeInfo>) => Promise<void>;
  /** @deprecated */
  useMigrations?: boolean;
  enableLogging?: boolean;
  idField?: IdFieldConfig;
  provider: DatabaseProvider;

  /** @deprecated use extendPrismaSchema */
  prismaPreviewFeatures?: readonly string[]; // https://www.prisma.io/docs/concepts/components/preview-features
  /** @deprecated use extendPrismaSchema */
  additionalPrismaDatasourceProperties?: { [key: string]: string };

  extendPrismaSchema?: (schema: string) => string;
};

// config.ui

export type AdminUIConfig<TypeInfo extends BaseKeystoneTypeInfo> = {
  /** Completely disables the Admin UI */
  isDisabled?: boolean;

  /** A function that can be run to validate that the current session should have access to the Admin UI */
  isAccessAllowed?: (context: KeystoneContext<TypeInfo>) => MaybePromise<boolean>;

  /** An array of page routes that bypass the isAccessAllowed function */
  publicPages?: readonly string[];

  getAdditionalFiles?: readonly ((
    config: KeystoneConfig<TypeInfo>
  ) => MaybePromise<readonly AdminFileToWrite[]>)[];

  /** An async middleware function that can optionally return a redirect */
  pageMiddleware?: (args: {
    context: KeystoneContext<TypeInfo>;
    wasAccessAllowed: boolean;
  }) => MaybePromise<{ kind: 'redirect'; to: string } | void>;
};

export type AdminFileToWrite =
  | { mode: 'write'; src: string; outputPath: string }
  | { mode: 'copy'; inputPath: string; outputPath: string };

// config.server

type HealthCheckConfig = {
  path?: string;
  data?: Record<string, any> | (() => Record<string, any>);
};

export type ServerConfig<TypeInfo extends BaseKeystoneTypeInfo> = {
  /** Configuration options for the cors middleware. Set to `true` to use core Keystone defaults */
  cors?: CorsOptions | true;
  /** Maximum upload file size allowed (in bytes) */
  maxFileSize?: number;
  /** Health check configuration. Set to `true` to add a basic `/_healthcheck` route, or specify the path and data explicitly */
  healthCheck?: HealthCheckConfig | true;
  /** Hook to extend the Express App that Keystone creates */
  extendExpressApp?: (
    app: express.Express,
    context: KeystoneContext<TypeInfo>
  ) => void | Promise<void>;
  extendHttpServer?: (
    server: Server,
    context: KeystoneContext<TypeInfo>,
    graphqlSchema: GraphQLSchema
  ) => void;
} & (
  | {
      /** Port number to start the server on. Defaults to process.env.PORT || 3000 */
      port?: number;
    }
  | {
      /** node http.Server options */
      options?: ListenOptions;
    }
);

// config.graphql

export type GraphQLConfig = {
  // The path of the GraphQL API endpoint. Default: '/api/graphql'.
  path?: string;
  // The CORS configuration to use on the GraphQL API endpoint.
  // Default: { origin: 'https://studio.apollographql.com', credentials: true }
  cors?: CorsOptions;
  bodyParser?: BodyParserOptions;
  /**
   * - `true` - Add `ApolloServerPluginLandingPageGraphQLPlayground` to the Apollo Server plugins
   * - `false` - Add `ApolloServerPluginLandingPageDisabled` to the Apollo Server plugins
   * - `'apollo'` - Do not add any plugins to the Apollo config, this will use [Apollo Sandbox](https://www.apollographql.com/docs/apollo-server/testing/build-run-queries/#apollo-sandbox)
   * @default process.env.NODE_ENV !== 'production'
   */
  playground?: boolean | 'apollo';
  /**
   *  Additional options to pass into the ApolloServer constructor.
   *  @see https://www.apollographql.com/docs/apollo-server/api/apollo-server/#constructor
   */
  apolloConfig?: Partial<ApolloServerOptions<KeystoneContext>>;
  /**
   * When an error is returned from the GraphQL API, Apollo can include a stacktrace
   * indicating where the error occurred. When Keystone is processing mutations, it
   * will sometimes captures more than one error at a time, and then group these into
   * a single error returned from the GraphQL API. Each of these errors will include
   * a stacktrace.
   *
   * In general both categories of stacktrace are useful for debugging while developing,
   * but should not be exposed in production, and this is the default behaviour of Keystone.
   *
   * You can use the `debug` option to change this behaviour. A use case for this
   * would be if you need to send the stacktraces to a log, but do not want to return them
   * from the API. In this case you could set `debug: true` and use
   * `apolloConfig.formatError` to log the stacktraces and then strip them out before
   * returning the error.
   *
   * ```ts
   * graphql: {
   *   debug: true,
   *   apolloConfig: {
   *     formatError: err => {
   *       console.error(err);
   *       delete err.extensions?.errors;
   *       delete err.extensions?.exception?.errors;
   *       delete err.extensions?.exception?.stacktrace;
   *       return err;
   *     },
   *   },
   * }
   * ```
   *
   * @default process.env.NODE_ENV !== 'production'
   */
  debug?: boolean;
};

// config.extendGraphqlSchema

export type ExtendGraphqlSchema = (schema: GraphQLSchema) => GraphQLSchema;

export type FilesConfig = {
  upload: AssetMode;
  transformFilename?: (str: string) => string;
  local?: {
    /**
     * The path local files are uploaded to.
     * @default 'public/files'
     */
    storagePath?: string;
    /**
     * The base of the URL local files will be served from, outside of keystone.
     * @default '/files'
     */
    baseUrl?: string;
  };
};

export type ImagesConfig = {
  upload: AssetMode;
  local?: {
    /**
     * The path local images are uploaded to.
     * @default 'public/images'
     */
    storagePath?: string;
    /**
     * The base of the URL local images will be served from, outside of keystone.
     * @default '/images'
     */
    baseUrl?: string;
  };
};

// Exports from sibling packages

export type { ListHooks, ListAccessControl, FieldAccessControl };

export type {
  FieldCreateItemAccessArgs,
  FieldReadItemAccessArgs,
  FieldUpdateItemAccessArgs,
  IndividualFieldAccessControl,
  CreateListItemAccessControl,
  UpdateListItemAccessControl,
  DeleteListItemAccessControl,
  ListOperationAccessControl,
  ListFilterAccessControl,
} from './access-control';
export type { CommonFieldConfig } from './fields';
export type { CacheHintArgs, IdFieldConfig } from './lists';
