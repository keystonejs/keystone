import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { config } from '@keystone-6/core'
import { storedSessions } from '@keystone-6/auth'
import { createAuth } from '@keystone-6/auth'
import { createClient } from '@redis/client'
import { lists } from './schema'
import type { TypeInfo, Lists } from './generated/keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

const redis = createClient()

function redisSessionStrategy() {
  // you can find out more at https://keystonejs.com/docs/apis/session#session-api
  return storedSessions<{ sub: string }>({
    store: ({ maxAge }) => ({
      async get(sessionId) {
        const result = await redis.get(sessionId)
        if (!result) return

        return JSON.parse(result) as { sub: string }
      },

      async set(sessionId, data) {
        // we use redis for our Session data, in JSON
        await redis.setEx(sessionId, maxAge, JSON.stringify(data))
      },

      async delete(sessionId) {
        await redis.del(sessionId)
      },
    }),
  })
}

const sessionStrategy = redisSessionStrategy()

// withAuth is a function we can use to wrap our base configuration
const { withAuth } = createAuth<Lists.User.TypeInfo>({
  listKey: 'User',
  identityField: 'name',
  passwordField: 'password',
  sessionStrategy,
  getAuthenticatedItemId(context) {
    return context.session?.user.id
  },
})

export default withAuth(
  config<TypeInfo>({
    db: {
      provider: 'sqlite',
      prismaClientOptions: () => ({
        adapter: new PrismaBetterSqlite3({
          url: process.env.DATABASE_URL || 'file:./keystone-example.db',
        }),
      }),
      async onConnect(context) {
        // this creates an initial user if none exist so you can log in for development
        // WARNING: do not use this in production
        ;(async () => {
          const sudoContext = context.sudo()
          if ((await sudoContext.db.User.count()) !== 0) return

          const password = crypto.getRandomValues(new Uint8Array(16)).toHex()
          await sudoContext.db.User.createOne({ data: { name: 'admin', password } })
          console.log(`Created initial user: admin / ${password}`)
        })().catch(error => console.error('Failed to create initial user:', error))

        await redis.connect()
      },
    },
    lists,
    async getSession({ context }) {
      const data = await sessionStrategy.get({ context })
      if (!data) return
      const user = await context.sudo().db.User.findOne({ where: { id: data.sub } })
      return user ? { user } : undefined
    },
  })
)
