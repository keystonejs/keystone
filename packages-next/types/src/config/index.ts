import { IncomingMessage } from 'http';
import type { ConnectOptions } from 'mongoose';
import { CorsOptions } from 'cors';
import type { GraphQLSchema } from 'graphql';
import type { Config } from 'apollo-server-express';

import type { KeystoneContext } from '..';

import { CreateContext } from '../core';
import type { BaseKeystone } from '../base';
import { SessionStrategy } from '../session';
import type { MaybePromise } from '../utils';
import type {
  ListSchemaConfig,
  ListConfig,
  BaseFields,
  FieldType,
  FieldConfig,
  MaybeSessionFunction,
  MaybeItemFunction,
  // CacheHint,
} from './lists';
import type { ListAccessControl, FieldAccessControl } from './access-control';
import type { ListHooks } from './hooks';

export type KeystoneConfig = {
  // e.g 'thinkmill:243809dsjkfdls-r2y8osdfjsdf-23y8osf',
  cloud?: string;
  lists: ListSchemaConfig;
  db: DatabaseConfig;
  ui?: AdminUIConfig;
  images?: ImagesConfig;
  server?: ServerConfig;
  session?: () => SessionStrategy<any>;
  graphql?: GraphQLConfig;
  extendGraphqlSchema?: ExtendGraphqlSchema;
  /** Experimental config options */
  experimental?: {
    /** Enables nextjs graphql api route mode */
    enableNextJsGraphqlApiEndpoint?: boolean;
    /** Enable Prisma+SQLite support */
    prismaSqlite?: boolean;
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

export type DatabaseCommon = {
  url: string;
  onConnect?: (args: KeystoneContext) => Promise<void>;
};

export type DatabaseConfig = DatabaseCommon &
  (
    | {
        adapter: 'prisma_postgresql';
        useMigrations?: boolean;
        enableLogging?: boolean;
        getPrismaPath?: (arg: { prismaSchema: any }) => string;
        getDbSchemaName?: (arg: { prismaSchema: any }) => string;
      }
    | {
        adapter: 'prisma_sqlite';
        useMigrations?: boolean;
        enableLogging?: boolean;
        getPrismaPath?: (arg: { prismaSchema: any }) => string;
      }
    | { adapter: 'knex'; dropDatabase?: boolean; schemaName?: string }
    | { adapter: 'mongoose'; mongooseOptions?: { mongoUri?: string } & ConnectOptions }
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
    req: IncomingMessage;
    session: any;
    isValidSession: boolean;
    createContext: CreateContext;
  }) => MaybePromise<{ kind: 'redirect'; to: string } | void>;
};

export type AdminFileToWrite =
  | { mode: 'write'; src: string; outputPath: string }
  | { mode: 'copy'; inputPath: string; outputPath: string };

// config.images

export type ImagesConfig =
  | {
      mode: 'local';
      /** The path local images are uploaded to */
      uploadPath?: string;
      /** The path local images will be served from, outside of keystone */
      publicPath?: string;
    }
  | {
      mode: 'cloud';
    };

// config.server

export type ServerConfig = {
  /** Configuration options for the cors middleware. Set to `true` to use core Keystone defaults */
  cors?: CorsOptions | true;
  /** Port number to start the server on. Defaults to process.env.PORT || 3000 */
  port?: number;
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

export type ExtendGraphqlSchema = (schema: GraphQLSchema, keystone: BaseKeystone) => GraphQLSchema;

// Exports from sibling packages

export type { ListHooks, ListAccessControl, FieldAccessControl };
