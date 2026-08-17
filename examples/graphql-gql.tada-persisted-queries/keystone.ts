import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { createAuth } from '@keystone-6/auth'
import { config } from '@keystone-6/core'
import { statelessSessions } from '@keystone-6/core/session'
import { GraphQLError } from 'graphql'
import persistedQueriesJson from './persisted-queries.json' with { type: 'json' }
import { isAdmin, lists, type Session } from './schema.ts'
import type { Context, TypeInfo } from './generated/keystone/types.ts'

const sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --'

const auth = createAuth({
  listKey: 'User',
  identityField: 'name',
  secretField: 'password',
  sessionData: 'isAdmin',
})

const persistedQueries: Record<string, string> = {
  ...persistedQueriesJson,
  ...auth.persistedQueries(),
}

// Apollo prefixes keys passed to a custom APQ cache with "apq:". This cache is
// deliberately read-only so clients cannot register arbitrary operations.
const staticPersistedQueryCache = {
  async get(key: string) {
    console.log(key)
    const hash = key.startsWith('apq:') ? key.slice('apq:'.length) : key
    return persistedQueries[hash]
  },
  async set(_key: string, _query: string) {},
  async delete(_key: string) {
    return false
  },
}

const requirePersistedQueries = {
  async requestDidStart() {
    return {
      async didResolveSource(requestContext: {
        contextValue: Context
        source: string
        request: {
          extensions?: Record<string, unknown>
        }
      }) {
        // The Admin UI uses ordinary GraphQL documents. It is allowed to do so
        // only after the request has the same admin session required by the UI.
        if (isAdmin(requestContext.contextValue)) return

        const persistedQuery = requestContext.request.extensions?.persistedQuery
        if (
          typeof persistedQuery !== 'object' ||
          persistedQuery === null ||
          !('version' in persistedQuery) ||
          !('sha256Hash' in persistedQuery) ||
          persistedQuery.version !== 1 ||
          typeof persistedQuery.sha256Hash !== 'string' ||
          !Object.hasOwn(persistedQueries, persistedQuery.sha256Hash) ||
          requestContext.source !== persistedQueries[persistedQuery.sha256Hash]
        ) {
          throw new GraphQLError('This API requires a persisted query')
        }
      },
    }
  },
}

export default auth.withAuth<TypeInfo<Session>>(
  config<TypeInfo>({
    db: {
      provider: 'sqlite',
      prismaClientOptions: () => ({
        adapter: new PrismaBetterSqlite3({
          url: process.env.DATABASE_URL ?? 'file:./keystone-example.db',
        }),
      }),
      async onConnect(context) {
        const sudoContext = context.sudo()
        if ((await sudoContext.db.User.count()) !== 0) return

        const password = crypto.getRandomValues(new Uint8Array(16)).toHex()
        await sudoContext.db.User.createOne({
          data: { name: 'admin', password, isAdmin: true },
        })
        await sudoContext.db.Post.createMany({
          data: [{ title: 'Persisted queries' }, { title: 'Keystone and gql.tada' }],
        })
        console.log(`Created initial user: admin / ${password}`)
      },
    },
    lists,
    session: statelessSessions({
      maxAge: 60 * 60,
      secret: sessionSecret,
    }),
    ui: {
      isAccessAllowed: isAdmin,
    },
    graphql: {
      apolloConfig: {
        persistedQueries: {
          cache: staticPersistedQueryCache,
          ttl: null,
        },
        plugins: [requirePersistedQueries],
      },
    },
  })
)
