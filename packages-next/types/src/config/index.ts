import { IncomingMessage } from 'http';
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
  lists: ListSchemaConfig;
  db: DatabaseConfig;
  ui?: AdminUIConfig;
  server?: ServerConfig;
  session?: () => SessionStrategy<any>;
  graphql?: GraphQLConfig;
  extendGraphqlSchema?: ExtendGraphqlSchema;
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

export type DatabaseCommon = {
  url: string;
  onConnect?: (args: KeystoneContext) => Promise<void>;
};

export type DatabaseConfig = DatabaseCommon &
  (
    | ((
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
      ) & {
        useMigrations?: boolean;
        enableLogging?: boolean;
      })
    | ((
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
      ) & {
        useMigrations?: boolean;
        enableLogging?: boolean;
      })
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
