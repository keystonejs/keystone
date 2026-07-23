import { config } from '@keystone-6/core'
import { statelessSessions } from '@keystone-6/core/session'
import { createAuth } from '@keystone-6/auth'
import { type Session, lists } from './schema'
import type { Config, Context, TypeInfo } from './generated/keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

// withAuth is a function we can use to wrap our base configuration
const { withAuth } = createAuth({
  // this is the list that contains our users
  listKey: 'User',

  // an identity field, typically a username or an email address
  identityField: 'name',

  // a secret field must be a password field type
  secretField: 'password',

  sessionData: 'passwordChangedAt',
})

function withSessionInvalidation(config: Config<Session>): Config<Session> {
  const existingSessionStrategy = config.session!

  return {
    ...config,
    session: {
      ...existingSessionStrategy,
      async get({ context }: { context: Context }): Promise<Session | undefined> {
        const session = await existingSessionStrategy.get({ context })
        if (!session) return

        // has the password changed since the session started?
        if (new Date(session.data.passwordChangedAt) > new Date(session.startedAt)) {
          // invalidate the session if password changed
          await existingSessionStrategy.end({ context })
          return
        }

        return session
      },
      async start({ context, data }: { context: Context; data: Session }) {
        return await existingSessionStrategy.start({
          context,
          data: {
            ...data,
            startedAt: Date.now(),
          },
        })
      },
    },
  }
}

export default withSessionInvalidation(
  withAuth(
    config<TypeInfo>({
      db: {
        provider: 'sqlite',
        url: process.env.DATABASE_URL || 'file:./keystone-example.db',
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

        // WARNING: this is only needed for our monorepo examples, dont do this
        prismaClientPath: 'node_modules/myprisma',
      },
      lists,
      // you can find out more at https://keystonejs.com/docs/apis/session#session-api
      session: statelessSessions<Session>(),
    })
  )
)
