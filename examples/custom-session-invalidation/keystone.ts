import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { config } from '@keystone-6/core'
import { createAuth, jwtSessions } from '@keystone-6/auth'
import { lists } from './schema'
import type { TypeInfo, Lists } from './generated/keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

// withAuth is a function we can use to wrap our base configuration
const sessionStrategy = withSessionStartedAt(jwtSessions<{ sub: string; startedAt?: number }>())

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

function withSessionStartedAt<T extends object>(
  existingSessionStrategy: ReturnType<typeof jwtSessions<T & { startedAt?: number }>>
) {
  return {
    async start({ context, data }: Parameters<typeof existingSessionStrategy.start>[0]) {
      return existingSessionStrategy.start({
        context,
        data: { ...data, startedAt: Date.now() },
      })
    },
    async get({ context }: Parameters<typeof existingSessionStrategy.get>[0]) {
      const session = await existingSessionStrategy.get({ context })
      if (
        !session ||
        typeof session !== 'object' ||
        !('startedAt' in session) ||
        typeof session.startedAt !== 'number'
      )
        return
      return session
    },
    end: existingSessionStrategy.end,
  }
}

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
      const user = await context.sudo().db.User.findOne({ where: { id: data.sub } })
      if (!user) return
      if (
        data.startedAt !== undefined &&
        user.passwordChangedAt &&
        user.passwordChangedAt > new Date(data.startedAt)
      ) {
        if (context.res) await sessionStrategy.end({ context })
        return
      }
      return { user }
    },
  })
)
