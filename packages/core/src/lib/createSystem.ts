import path from 'node:path'
import { randomBytes } from 'node:crypto'
import {
  type KeystoneConfig,
  type FieldData,
  type __ResolvedKeystoneConfig
} from '../types'
import { GraphQLError } from 'graphql'

import { allowAll } from '../access'
import { resolveDefaults } from './defaults'
import { createAdminMeta } from './create-admin-meta'
import { createGraphQLSchema } from './createGraphQLSchema'
import { createContext } from './context/createContext'
import {
  type InitialisedList,
  initialiseLists,
} from './core/initialise-lists'

// TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
export function getBuiltKeystoneConfigurationPath (cwd: string) {
  return path.join(cwd, '.keystone/config.js')
}

function posixify (s: string) {
  return s.split(path.sep).join('/')
}

export function getSystemPaths (cwd: string, config: KeystoneConfig | __ResolvedKeystoneConfig) {
  const prismaClientPath = config.db.prismaClientPath === '@prisma/client'
    ? null
    : config.db.prismaClientPath
      ? path.join(cwd, config.db.prismaClientPath)
      : null

  const builtTypesPath = config.types?.path
    ? path.join(cwd, config.types.path) // TODO: enforce initConfig before getSystemPaths
    : path.join(cwd, 'node_modules/.keystone/types.ts')

  const builtPrismaPath = config.db?.prismaSchemaPath
    ? path.join(cwd, config.db.prismaSchemaPath) // TODO: enforce initConfig before getSystemPaths
    : path.join(cwd, 'schema.prisma')

  const relativePrismaPath = prismaClientPath
    ? `./${posixify(path.relative(path.dirname(builtTypesPath), prismaClientPath))}`
    : '@prisma/client'

  const builtGraphqlPath = config.graphql?.schemaPath
    ? path.join(cwd, config.graphql.schemaPath) // TODO: enforce initConfig before getSystemPaths
    : path.join(cwd, 'schema.graphql')

  return {
    config: getBuiltKeystoneConfigurationPath(cwd),
    admin: path.join(cwd, '.keystone/admin'),
    prisma: prismaClientPath ?? '@prisma/client',
    types: {
      relativePrismaPath,
    },
    schema: {
      types: builtTypesPath,
      prisma: builtPrismaPath,
      graphql: builtGraphqlPath,
    },
  }
}

function getSudoGraphQLSchema (config: __ResolvedKeystoneConfig) {
  // This function creates a GraphQLSchema based on a modified version of the provided config.
  // The modifications are:
  //  * All list level access control is disabled
  //  * All field level access control is disabled
  //  * All graphql.omit configuration is disabled
  //  * All fields are explicitly made filterable and orderable
  //
  // These changes result in a schema without any restrictions on the CRUD
  // operations that can be run.
  //
  // The resulting schema is used as the GraphQL schema when calling `context.sudo()`.
  const transformedConfig: __ResolvedKeystoneConfig = {
    ...config,
    ui: {
      ...config.ui,
      isAccessAllowed: allowAll,
    },
    lists: Object.fromEntries(
      Object.entries(config.lists).map(([listKey, list]) => {
        return [
          listKey,
          {
            ...list,
            access: allowAll,
            graphql: { ...(list.graphql || {}), omit: false },
            fields: Object.fromEntries(
              Object.entries(list.fields).map(([fieldKey, field]) => {
                if (fieldKey.startsWith('__group')) return [fieldKey, field]
                return [
                  fieldKey,
                  (data: FieldData) => {
                    const f = field(data)
                    return {
                      ...f,
                      access: allowAll,
                      isFilterable: true,
                      isOrderable: true,
                      graphql: { ...(f.graphql || {}), omit: false },
                    }
                  },
                ]
              })
            ),
          },
        ]
      })
    ),
  }

  const lists = initialiseLists(transformedConfig)
  const adminMeta = createAdminMeta(transformedConfig, lists)
  return createGraphQLSchema(transformedConfig, lists, adminMeta, true)
  // TODO: adminMeta not useful for sudo, remove in breaking change
  // return createGraphQLSchema(transformedConfig, lists, null, true);
}

function injectNewDefaults (prismaClient: unknown, lists: Record<string, InitialisedList>) {
  for (const listKey in lists) {
    const list = lists[listKey]

    // TODO: other fields might use 'random' too
    const { dbField } = list.fields.id

    if ('default' in dbField && dbField.default?.kind === 'random') {
      const { bytes, encoding } = dbField.default

      prismaClient = (prismaClient as any).$extends({
        query: {
          [list.prisma.listKey]: {
            async create ({ model, args, query }: any) {
              return query({
                ...args,
                data: {
                  ...args.data,
                  id: args.data.id ?? randomBytes(bytes).toString(encoding),
                },
              })
            },
          },
        },
      })
    }
  }

  prismaClient = (prismaClient as any).$extends({
    query: {
      async $allOperations ({ model, operation, args, query }: any) {
        try {
          return await query(args)
        } catch (e: any) {
          console.error(e)

          if (e.code === undefined) {
            return new GraphQLError(`Prisma error`, {
              extensions: {
                code: 'KS_PRISMA_ERROR',
                debug: {
                  message: e.message,
                },
              },
            })
          }

          // TODO: remove e.message unless debug
          return new GraphQLError(`Prisma error: ${e.message.split('\n').pop()?.trim()}`, {
            extensions: {
              code: 'KS_PRISMA_ERROR',
              prisma: { ...e },
            },
          })
        }
      }
    }
  })

  return prismaClient
}

function formatUrl (provider: __ResolvedKeystoneConfig['db']['provider'], url: string) {
  if (url.startsWith('file:')) {
    const parsed = new URL(url)
    if (provider === 'sqlite' && !parsed.searchParams.get('connection_limit')) {
      // https://github.com/prisma/prisma/issues/9562
      // https://github.com/prisma/prisma/issues/10403
      // https://github.com/prisma/prisma/issues/11789
      parsed.searchParams.set('connection_limit', '1')

      const [uri] = url.split('?')
      return `${uri}?${parsed.search}`
    }
  }

  return url
}

export function createSystem (config_: KeystoneConfig) {
  const config = resolveDefaults(config_)
  const lists = initialiseLists(config)
  const adminMeta = createAdminMeta(config, lists)
  const graphQLSchema = createGraphQLSchema(config, lists, adminMeta, false)
  const graphQLSchemaSudo = getSudoGraphQLSchema(config)

  return {
    config,
    graphQLSchema,
    adminMeta,
    lists,

    getPaths: (cwd: string) => {
      return getSystemPaths(cwd, config)
    },

    getKeystone: (PM: any) => {
      const prePrismaClient = new PM.PrismaClient({
        datasourceUrl: formatUrl(config.db.provider, config.db.url),
        log: config.db.enableLogging
      })

      const prismaClient = config.db.extendPrismaClient(injectNewDefaults(prePrismaClient, lists))
      const context = createContext({
        config,
        lists,
        graphQLSchema,
        graphQLSchemaSudo,
        prismaClient,
        prismaTypes: {
          DbNull: PM.Prisma.DbNull,
          JsonNull: PM.Prisma.JsonNull,
        },
      })

      return {
        // TODO: replace with server.onStart, remove in breaking change
        async connect () {
          await (prismaClient as any).$connect()
          await config.db.onConnect?.(context)
        },
        // TODO: only used by tests, remove in breaking change
        async disconnect () {
          await (prismaClient as any).$disconnect()
        },
        context,
      }
    },
  }
}

export type System = ReturnType<typeof createSystem>
