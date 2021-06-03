import { CorsOptions } from 'cors';
import type { GraphQLSchema } from 'graphql';
import type { Config } from 'apollo-server-express';

import type { AssetMode, KeystoneContext } from '..';

import { SessionStrategy } from '../session';
import type { MaybePromise } from '../utils';
import type {
  ListSchemaConfig,
  ListConfig,
  MaybeSessionFunction,
  MaybeItemFunction,
  // CacheHint,
} from './lists';
import type { CloudConfig } from './cloud';
import type { BaseFields, FieldType, FieldConfig } from './fields';
import type { ListAccessControl, FieldAccessControl } from './access-control';
import type { ListHooks } from './hooks';

export type KeystoneConfig = {
  lists: ListSchemaConfig;
  db: DatabaseConfig;
  ui?: AdminUIConfig;
  server?: ServerConfig;
  session?: SessionStrategy<any>;
  cloud?: CloudConfig;
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
  };
};

// config.lists

export type {
  ListSchemaConfig,
  ListConfig,
  BaseFields,
  FieldType,
  FieldConfig,
  MaybeSessionFunction,
  MaybeItemFunction,
  // CacheHint,
};

// config.db

export type DatabaseConfig = {
  url: string;
  onConnect?: (args: KeystoneContext) => Promise<void>;
  useMigrations?: boolean;
  enableLogging?: boolean;
} & (
  | (
      | {
          /** @deprecated The `adapter` option is deprecated. Please use `{ provider: 'postgresql' }` */
          adapter: 'prisma_postgresql';
          provider?: undefined;
        }
      | {
          /** @deprecated The `adapter` option is deprecated. Please use `{ provider: 'postgresql' }` */
          adapter?: undefined;
          provider: 'postgresql';
        }
    )
  | (
      | {
          /** @deprecated The `adapter` option is deprecated. Please use `{ provider: 'sqlite' }` */
          adapter: 'prisma_sqlite';
          provider?: undefined;
        }
      | {
          /** @deprecated The `adapter` option is deprecated. Please use `{ provider: 'sqlite' }` */
          adapter?: undefined;
          provider: 'sqlite';
        }
    )
);

// config.ui

export type AdminUIConfig = {
  /** Completely disables the Admin UI */
  isDisabled?: boolean;
  /** Enables certain functionality in the Admin UI that expects the session to be an item */
  enableSessionItem?: boolean;
  /** A function that can be run to validate that the current session should have access to the Admin UI */
  isAccessAllowed?: (context: KeystoneContext) => MaybePromise<boolean>;
  /** An array of page routes that can be accessed without passing the isAccessAllowed check */
  publicPages?: string[];
  /** The basePath for the Admin UI App */
  // FIXME: currently unused
  // path?: string;
  getAdditionalFiles?: ((config: KeystoneConfig) => MaybePromise<AdminFileToWrite[]>)[];
  pageMiddleware?: (args: {
    context: KeystoneContext;
    isValidSession: boolean;
  }) => MaybePromise<{ kind: 'redirect'; to: string } | void>;
};

export type AdminFileToWrite =
  | { mode: 'write'; src: string; outputPath: string }
  | { mode: 'copy'; inputPath: string; outputPath: string };

// config.server

export type ServerConfig = {
  /** Configuration options for the cors middleware. Set to `true` to use core Keystone defaults */
  cors?: CorsOptions | true;
  /** Port number to start the server on. Defaults to process.env.PORT || 3000 */
  port?: number;
  /** Maximum upload file size allowed (in bytes) */
  maxFileSize?: number;
};

// config.graphql

export type GraphQLConfig = {
  // FIXME: We currently hardcode `/api/graphql` in a bunch of places
  // We should be able to use config.graphql.path to set this path.
  // path?: string;
  queryLimits?: {
    maxTotalResults?: number;
  };
  /**
   *  Additional options to pass into the ApolloServer constructor.
   *  @see https://www.apollographql.com/docs/apollo-server/api/apollo-server/#constructor
   */
  apolloConfig?: Config;
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

// Exports from sibling packages

export type { ListHooks, ListAccessControl, FieldAccessControl };
