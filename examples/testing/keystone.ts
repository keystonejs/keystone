import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { config } from '@keystone-6/core'
import { createAuth, jwtSessions } from '@keystone-6/auth'
import { lists } from './schema'
import type { TypeInfo, Lists } from './generated/keystone/types'

const sessionStrategy = jwtSessions()

// WARNING: this example is for TESTING purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

declare module './generated/keystone/types' {
  interface Session {
    user: Lists.User.Item
  }
}

// withAuth is a function we can use to wrap our base configuration
const { withAuth } = createAuth<Lists.User.TypeInfo>({
  // this is the list that contains our users
  listKey: 'User',

  // an identity field, typically a username or an email address
  identityField: 'name',

  // the password field must use the password field type
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
      },
    },
    lists,
    async getSession({ context }) {
      const data = await sessionStrategy.get({ context })
      if (!data) return
      const user = await context.db.User.findOne({
        where: { id: data.sub },
      })
      return user ? { user } : undefined
    },
  })
)
