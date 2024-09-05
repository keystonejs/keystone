import { config } from '@keystone-6/core'
import { storedSessions } from '@keystone-6/core/session'
import { createAuth } from '@keystone-6/auth'
import { createClient } from '@redis/client'
import { lists, type Session } from './schema'
import type { TypeInfo } from '.keystone/types'

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

  // initFirstItem enables the "First User" experience, this will add an interface form
  //   adding a new User item if the database is empty
  //
  // WARNING: do not use initFirstItem in production
  //   see https://keystonejs.com/docs/config/auth#init-first-item for more
  initFirstItem: {
    // the following fields are used by the "Create First User" form
    fields: ['name', 'password'],
  },
})

const redis = createClient()

function redisSessionStrategy () {
  // you can find out more at https://keystonejs.com/docs/apis/session#session-api
  return storedSessions<Session>({
    store: ({ maxAge }) => ({
      async get (sessionId) {
        const result = await redis.get(sessionId)
        if (!result) return

        return JSON.parse(result) as Session
      },

      async set (sessionId, data) {
        // we use redis for our Session data, in JSON
        await redis.setEx(sessionId, maxAge, JSON.stringify(data))
      },

      async delete (sessionId) {
        await redis.del(sessionId)
      },
    }),
  })
}

export default withAuth(
  config<TypeInfo<Session>>({
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./keystone-example.db',
      async onConnect () {
        await redis.connect()
      },

      // WARNING: this is only needed for our monorepo examples, dont do this
      prismaClientPath: 'node_modules/myprisma',
    },
    lists,
    session: redisSessionStrategy(),
  })
)
