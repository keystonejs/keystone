import { config } from '@keystone-6/core'
import { createAuth, SessionStrategy, statelessSessions } from '@keystone-6/auth'
import { lists } from './schema'
import type { TypeInfo, Lists } from '.keystone/types'
import type { BaseKeystoneTypeInfo } from '@keystone-6/core/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

// withAuth is a function we can use to wrap our base configuration
const { withAuth } = createAuth<Lists.User.TypeInfo, { itemId: string; startedAt: number }>({
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

  sessionStrategy: withSessionStartedAt(statelessSessions()),
  async getSession({ context, data }) {
    const user = await context.db.User.findOne({
      where: { id: data.itemId },
    })
    if (!user) return
    if (user.passwordChangedAt && user.passwordChangedAt > new Date(data.startedAt)) {
      return
    }
    return { user }
  },
})

function withSessionStartedAt<T, TypeInfo extends BaseKeystoneTypeInfo>(
  existingSessionStrategy: SessionStrategy<
    T & { startedAt: number },
    T & { startedAt: number },
    TypeInfo
  >
): SessionStrategy<T, T & { startedAt: number }, TypeInfo> {
  return {
    async start({ context, data }) {
      await existingSessionStrategy.start({
        context,
        data: { ...data, startedAt: Date.now() },
      })
    },
    async get({ context }) {
      const session = await existingSessionStrategy.get({ context })
      if (
        !session ||
        typeof session !== 'object' ||
        !('startedAt' in session) ||
        typeof session.startedAt !== 'number'
      )
        return
      return { ...session, startedAt: session.startedAt }
    },
    end: existingSessionStrategy.end,
  }
}

export default withAuth(
  config<TypeInfo>({
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./keystone-example.db',

      // WARNING: this is only needed for our monorepo examples, dont do this
      prismaClientPath: 'node_modules/myprisma',
    },
    lists,
  })
)
