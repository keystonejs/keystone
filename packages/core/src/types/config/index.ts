import type { Server } from 'http';
import type { Config } from 'apollo-server-express';
import { CorsOptions } from 'cors';
import express from 'express';
import type { GraphQLSchema } from 'graphql';

import type { AssetMode, CreateRequestContext, BaseKeystoneTypeInfo, KeystoneContext } from '..';

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

export type KeystoneConfig<TypeInfo extends BaseKeystoneTypeInfo = BaseKeystoneTypeInfo> = {
  lists: ListSchemaConfig;
  db: DatabaseConfig<TypeInfo>;
  ui?: AdminUIConfig<TypeInfo>;
  server?: ServerConfig<TypeInfo>;
  session?: SessionStrategy<any>;
  graphql?: GraphQLConfig;
  extendGraphqlSchema?: ExtendGraphqlSchema;
  files?: FilesConfig;
  images?: ImagesConfig;
  /** Experimental config options */
  experimental?: {
    /** Enables nextjs graphql api route mode */
    enableNextJsGraphqlApiEndpoint?: boolean;
    /** Creates a file at `node_modules/.keystone/api` with a `lists` export */
    generateNodeAPI?: boolean;
    /** Creates a file at `node_modules/.keystone/next/graphql-api` with `default` and `config` exports that can be re-exported in a Next API route */
    generateNextGraphqlAPI?: boolean;
    /** Options for Keystone Cloud */
    cloud?: CloudConfig;
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
  onConnect?: (args: KeystoneContext<TypeInfo>) => Promise<void>;
  useMigrations?: boolean;
  enableLogging?: boolean;
  idField?: IdFieldConfig;
  provider: 'postgresql' | 'sqlite';
  prismaPreviewFeatures?: readonly string[]; // https://www.prisma.io/docs/concepts/components/preview-features
};

// config.ui

export type AdminUIConfig<TypeInfo extends BaseKeystoneTypeInfo> = {
  /** Completely disables the Admin UI */
  isDisabled?: boolean;
  /** Enables certain functionality in the Admin UI that expects the session to be an item */
  enableSessionItem?: boolean;
  /** A function that can be run to validate that the current session should have access to the Admin UI */
  isAccessAllowed?: (context: KeystoneContext<TypeInfo>) => MaybePromise<boolean>;
  /** An array of page routes that can be accessed without passing the isAccessAllowed check */
  publicPages?: readonly string[];
  /** The basePath for the Admin UI App */
  // FIXME: currently unused
  // path?: string;
  getAdditionalFiles?: readonly ((
    config: KeystoneConfig<TypeInfo>
  ) => MaybePromise<readonly AdminFileToWrite[]>)[];
  pageMiddleware?: (args: {
    context: KeystoneContext<TypeInfo>;
    isValidSession: boolean;
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
  /** Port number to start the server on. Defaults to process.env.PORT || 3000 */
  port?: number;
  /** Maximum upload file size allowed (in bytes) */
  maxFileSize?: number;
  /** Health check configuration. Set to `true` to add a basic `/_healthcheck` route, or specify the path and data explicitly */
  healthCheck?: HealthCheckConfig | true;
  /** Hook to extend the Express App that Keystone creates */
  extendExpressApp?: (app: express.Express, createContext: CreateRequestContext<TypeInfo>) => void;
  extendHttpServer?: (server: Server, createContext: CreateRequestContext<TypeInfo>) => void;
};

// config.graphql

export type GraphQLConfig = {
  // The path of the GraphQL API endpoint. Default: '/api/graphql'.
  path?: string;
  // The CORS configuration to use on the GraphQL API endpoint.
  // Default: { origin: 'https://studio.apollographql.com', credentials: true }
  cors?: CorsOptions;
  queryLimits?: {
    maxTotalResults?: number;
  };
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
  apolloConfig?: Config;
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

// config.files

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

// config.images

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

// config.experimental.cloud

export type CloudConfig = {
  apiKey?: string;
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
