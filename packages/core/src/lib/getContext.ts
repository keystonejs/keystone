import type { BaseKeystoneTypeInfo, KeystoneConfig, KeystoneContext } from '../types/index.ts'
import { createAdminMeta } from './admin-meta.ts'
import { createContext } from './context/createContext.ts'
import { initialiseLists, type InitialisedList } from './core/initialise-lists.ts'
import { toBase64Url, toHex } from './encoding.ts'
import { createGraphQLSchema } from './graphql.ts'

function getInternalGraphQLSchema(config: KeystoneConfig) {
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
                  id:
                    args.data.id ??
                    (encoding === 'hex'
                      ? toHex(crypto.getRandomValues(new Uint8Array(bytes)))
                      : toBase64Url(crypto.getRandomValues(new Uint8Array(bytes)))),
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

export function createContextSystem(config: KeystoneConfig) {
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
        async connect() {
          await prismaClient.$connect()
          await config.db.onConnect?.(context)
        },
        async disconnect() {
          await prismaClient.$disconnect()
        },
        context,
      }
    },
  }
}

export function getContext<TypeInfo extends BaseKeystoneTypeInfo>(
  config: KeystoneConfig<TypeInfo>,
  PrismaModule: unknown
): KeystoneContext<TypeInfo> {
  const system = createContextSystem(config)
  const { context } = system.getKeystone(PrismaModule)
  return context
}
