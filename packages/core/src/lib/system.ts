import { randomBytes } from 'node:crypto'
import path from 'node:path'

import type { BaseKeystoneTypeInfo, KeystoneConfig, KeystoneContext } from '../types'
import { createAdminMeta } from './admin-meta'
import { createContext } from './context/createContext'
import { initialiseLists, type InitialisedList } from './core/initialise-lists'
import { createGraphQLSchema } from './graphql'

// TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
export function getBuiltKeystoneConfigurationPath(cwd: string) {
  return path.join(cwd, '.keystone/config.js')
}

export function getBuiltPrismaModulePath(cwd: string) {
  return path.join(cwd, '.keystone/prisma.js')
}

function posixify(s: string) {
  return s.split(path.sep).join('/')
}

function relativeModulePath(from: string, to: string) {
  const relative = posixify(path.relative(from, to))
  return relative.startsWith('.') ? relative : `./${relative}`
}

function getSystemPaths(cwd: string, config: KeystoneConfig) {
  const prismaClientOutput = path.resolve(cwd, config.db.prismaClientPath)
  const prismaClientPath = path.join(prismaClientOutput, 'client')

  const builtTypesPath = config.types?.path
    ? path.join(cwd, config.types.path) // TODO: enforce initConfig before getSystemPaths
    : path.join(cwd, 'generated/keystone/types.ts')

  const builtPrismaPath = path.resolve(cwd, config.db.prismaSchemaPath)

  const relativePrismaPath = relativeModulePath(path.dirname(builtTypesPath), prismaClientPath)

  const builtGraphqlPath = config.graphql?.schemaPath
    ? path.join(cwd, config.graphql.schemaPath) // TODO: enforce initConfig before getSystemPaths
    : path.join(cwd, 'schema.graphql')

  return {
    config: getBuiltKeystoneConfigurationPath(cwd),
    admin: path.join(cwd, '.keystone/admin'),
    prisma: prismaClientPath,
    prismaClientOutput,
    prismaGeneratorOutput: relativeModulePath(path.dirname(builtPrismaPath), prismaClientOutput),
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

function getInternalGraphQLSchema(config: KeystoneConfig) {
  // omit `graphql.omit`
  const withoutOmit: KeystoneConfig = {
    ...config,
    lists: Object.fromEntries(
      Object.entries(config.lists).map(([listKey, list]) => {
        return [
          listKey,
          {
            ...list,
            graphql: { ...(list.graphql || {}), omit: false },
            fields: Object.fromEntries(
              Object.entries(list.fields).map(([fieldKey, field]) => {
                if (fieldKey.startsWith('__group')) return [fieldKey, field]
                return [
                  fieldKey,
                  data => {
                    const f = field(data)
                    return {
                      ...f,
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

  const lists = initialiseLists(withoutOmit)
  const adminMeta = createAdminMeta(withoutOmit, lists)
  return createGraphQLSchema(withoutOmit, lists, adminMeta, 'internal')
}

function injectNewDefaults(prismaClient: unknown, lists: Record<string, InitialisedList>) {
  for (const listKey in lists) {
    const list = lists[listKey]

    // TODO: other fields might use 'random' too
    const { dbField } = list.fields.id

    if ('default' in dbField && dbField.default?.kind === 'random') {
      const { bytes, encoding } = dbField.default

      prismaClient = (prismaClient as any).$extends({
        query: {
          [list.prisma.listKey]: {
            async create({ args, query }: any) {
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

  return prismaClient
}

export function createSystem(config: KeystoneConfig) {
  const lists = initialiseLists(config)
  const adminMeta = createAdminMeta(config, lists)
  const graphQLSchemas = {
    public: createGraphQLSchema(config, lists, adminMeta, 'public'),
    internal: getInternalGraphQLSchema(config),
  }

  return {
    config,
    graphql: {
      schemas: graphQLSchemas,
    },
    adminMeta,
    lists,
    getPaths: (cwd: string) => getSystemPaths(cwd, config),

    getKeystone: (PM: any, existingPrismaClient?: any) => {
      const prismaClient =
        existingPrismaClient ??
        config.db.extendPrismaClient(
          injectNewDefaults(new PM.PrismaClient(config.db.prismaClientOptions()), lists)
        )
      const context = createContext({
        config,
        lists,
        graphQLSchemas,
        prismaClient,
        prismaTypes: {
          DbNull: PM.Prisma.DbNull,
          JsonNull: PM.Prisma.JsonNull,
        },
      })

      return {
        // TODO: replace with server.onStart, remove in breaking change
        async connect() {
          await (prismaClient as any).$connect()
          await config.db.onConnect?.(context)
        },
        // TODO: only used by tests, remove in breaking change
        async disconnect() {
          await (prismaClient as any).$disconnect()
        },
        context,
      }
    },
  }
}

export type System = ReturnType<typeof createSystem>

export function getContext<TypeInfo extends BaseKeystoneTypeInfo>(
  config: KeystoneConfig<TypeInfo>,
  PrismaModule: unknown
): KeystoneContext<TypeInfo> {
  const system = createSystem(config)
  const { context } = system.getKeystone(PrismaModule)
  return context
}
