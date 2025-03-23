import type { Server } from 'node:http'
import type { ListenOptions } from 'node:net'
import type { ApolloServerOptions } from '@apollo/server'
import type { CorsOptions } from 'cors'
import type express from 'express'
import type { GraphQLSchema } from 'graphql'
import type { Options as BodyParserOptions } from 'body-parser'

import type { BaseKeystoneTypeInfo, KeystoneContext, DatabaseProvider } from '..'
import type { SessionStrategy } from '../session'
import type { MaybePromise } from '../utils'
import type { IdFieldConfig, ListConfig, MaybeItemFunction, MaybeSessionFunction } from './lists'
import type { BaseFields } from './fields'
import type { ListAccessControl, FieldAccessControl } from './access-control'
import type { ListHooks, FieldHooks } from './hooks'

export type * from './access-control'
export type * from './fields'
export type * from './lists'

// copy of the Prisma's LogLevel types from `src/runtime/getLogLevel.ts`, as we dont have them
type PrismaLogLevel = 'info' | 'query' | 'warn' | 'error'
type PrismaLogDefinition = {
  level: PrismaLogLevel
  emit: 'stdout' | 'event'
}

export type KeystoneConfigPre<TypeInfo extends BaseKeystoneTypeInfo = BaseKeystoneTypeInfo> = {
  types?: {
    path: string
  }

  db: {
    provider: DatabaseProvider
    url: string

    shadowDatabaseUrl?: string
    onConnect?: (args: KeystoneContext<TypeInfo>) => Promise<void>
    enableLogging?: boolean | Array<PrismaLogLevel | PrismaLogDefinition>
    idField?: IdFieldConfig
    prismaClientPath?: string
    prismaSchemaPath?: string

    extendPrismaSchema?: (schema: string) => string
    extendPrismaClient?: (client: any) => any
  }

  graphql?: {
    // The path of the GraphQL API endpoint. Default: '/api/graphql'.
    path?: string
    // The CORS configuration to use on the GraphQL API endpoint.
    // Default: { origin: 'https://studio.apollographql.com', credentials: true }
    cors?: CorsOptions
    bodyParser?: BodyParserOptions
    /**
     * - `true` - Add `ApolloServerPluginLandingPageGraphQLPlayground` to the Apollo Server plugins
     * - `false` - Add `ApolloServerPluginLandingPageDisabled` to the Apollo Server plugins
     * - `'apollo'` - Do not add any plugins to the Apollo config, this will use [Apollo Sandbox](https://www.apollographql.com/docs/apollo-server/testing/build-run-queries/#apollo-sandbox)
     * @default process.env.NODE_ENV !== 'production'
     */
    playground?: boolean | 'apollo'
    /**
     *  Additional options to pass into the ApolloServer constructor.
     *  @see https://www.apollographql.com/docs/apollo-server/api/apollo-server/#constructor
     */
    apolloConfig?: Partial<ApolloServerOptions<KeystoneContext<TypeInfo>>>
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
     *       console.error(err)
     *       delete err.extensions?.errors
     *       delete err.extensions?.exception?.errors
     *       delete err.extensions?.exception?.stacktrace
     *       return err
     *     },
     *   },
     * }
     * ```
     *
     * @default process.env.NODE_ENV !== 'production'
     */
    debug?: boolean

    /**
     * The path to GraphQL schema
     * @default 'schema.graphql'
     */
    schemaPath?: string

    /**
     * A function that receives the Keystone GraphQL schema for the developer to extend
     * @default 'schema.graphql'
     */
    extendGraphqlSchema?: (schema: GraphQLSchema) => GraphQLSchema
  }

  lists: Record<string, ListConfig<any>>
  server?: {
    /** Configuration options for the cors middleware. Set to `true` to use Keystone's defaults */
    cors?: boolean | CorsOptions

    /** Maximum upload file size allowed (in bytes) */
    maxFileSize?: number

    /** extend the Express application used by Keystone */
    extendExpressApp?: (
      app: express.Express,
      context: KeystoneContext<TypeInfo>
    ) => MaybePromise<void>

    /** extend the node:http server used by Keystone */
    extendHttpServer?: (server: Server, context: KeystoneContext<TypeInfo>) => MaybePromise<void>
  } & (
    | {
        /** Port number to start the server on. Defaults to process.env.PORT || 3000 */
        port?: number
      }
    | {
        /** node http.Server options */
        options?: ListenOptions
      }
  )

  session?: SessionStrategy<TypeInfo['session'], TypeInfo>

  /** Telemetry boolean to disable telemetry for this project */
  telemetry?: boolean

  ui?: {
    /** Completely disables the Admin UI */
    isDisabled?: boolean

    /** A function that can be run to validate that the current session should have access to the Admin UI */
    isAccessAllowed?: (context: KeystoneContext<TypeInfo>) => MaybePromise<boolean>

    /** An array of page routes that bypass the isAccessAllowed function */
    publicPages?: readonly string[]

    /** The Base Path for Keystones Admin UI */
    basePath?: string

    getAdditionalFiles?: readonly (() => MaybePromise<readonly AdminFileToWrite[]>)[]

    /** An async middleware function that can optionally return a redirect */
    pageMiddleware?: (args: {
      context: KeystoneContext<TypeInfo>
      wasAccessAllowed: boolean
      basePath: string
    }) => MaybePromise<{ kind: 'redirect'; to: string } | void>
    /** Generate .tsx files instead of .js */
    tsx?: boolean
  }
}

export type KeystoneConfig<TypeInfo extends BaseKeystoneTypeInfo = BaseKeystoneTypeInfo> = {
  types: KeystoneConfigPre<TypeInfo>['types']
  db: Omit<Required<KeystoneConfigPre<TypeInfo>['db']>, 'enableLogging'> & {
    enableLogging: PrismaLogLevel | Array<PrismaLogLevel | PrismaLogDefinition>
  }
  graphql: NonNullable<KeystoneConfigPre<TypeInfo>['graphql']> & {
    path: string
  }
  lists: {
    [listKey: string]: {
      listKey: string
    } & KeystoneConfigPre<TypeInfo>['lists'][string]
  }
  server: Omit<Required<NonNullable<KeystoneConfigPre<TypeInfo>['server']>>, 'cors' | 'port'> & {
    cors: CorsOptions | null
    options: ListenOptions
  }
  session: KeystoneConfigPre<TypeInfo>['session']
  telemetry: boolean
  ui: NonNullable<Required<KeystoneConfigPre<TypeInfo>['ui']>>
}

export type { ListConfig, BaseFields, MaybeSessionFunction, MaybeItemFunction }

export type AdminFileToWrite =
  | { mode: 'write'; src: string; outputPath: string; overwrite?: boolean }
  | { mode: 'copy'; inputPath: string; outputPath: string; overwrite?: boolean }

export type { ListHooks, ListAccessControl, FieldHooks, FieldAccessControl }
