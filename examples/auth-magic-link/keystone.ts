import { config } from '@keystone-6/core'
import { statelessSessions } from '@keystone-6/core/session'
import { createAuth } from '@keystone-6/auth'
import { type Session, lists, extendGraphqlSchema } from './schema'
import type { TypeInfo } from './generated/keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

// WARNING: you need to change this
const sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --'

// statelessSessions uses cookies for session tracking
//   these cookies have an expiry, in seconds
//   we use an expiry of one hour for this example
const sessionMaxAge = 60 * 60

// withAuth is a function we can use to wrap our base configuration
const { withAuth } = createAuth({
  // this is the list that contains our users
  listKey: 'User',

  // an identity field, typically a username or an email address
  identityField: 'name',

  // a secret field must be a password field type
  secretField: 'password',
})

export default withAuth<TypeInfo<Session>>(
  config<TypeInfo>({
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL ?? 'file:./keystone-example.db',
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
    graphql: {
      extendGraphqlSchema,
    },
    // you can find out more at https://keystonejs.com/docs/apis/session#session-api
    session: statelessSessions({
      // the maxAge option controls how long session cookies are valid for before they expire
      maxAge: sessionMaxAge,
      // the session secret is used to encrypt cookie data
      secret: sessionSecret,
    }),
  })
)
