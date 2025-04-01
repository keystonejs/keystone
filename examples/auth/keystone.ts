import { config } from '@keystone-6/core'
import { createAuth, statelessSessions } from '@keystone-6/auth'
import { lists } from './schema'
import type { TypeInfo } from '.keystone/types'

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

  // initFirstItem enables the "First User" experience, this will add an interface form
  //   adding a new User item if the database is empty
  //
  // WARNING: do not use initFirstItem in production
  //   see https://keystonejs.com/docs/config/auth#init-first-item for more
  initFirstItem: {
    // the following fields are used by the "Create First User" form
    fields: ['name', 'password'],

    // the following fields are configured by default for this item
    itemData: {
      // isAdmin is true, so the admin can pass isAccessAllowed (see below)
      isAdmin: true,
    },
  },
  sessionStrategy: statelessSessions({
    // the maxAge option controls how long session cookies are valid for before they expire
    maxAge: sessionMaxAge,
    // the session secret is used to encrypt cookie data
    secret: sessionSecret,
  }),
  async getSession({ context, data }) {
    const user = await context.db.User.findOne({
      where: { id: data.itemId },
    })
    if (!user) return
    return { user }
  },
})

export default withAuth<TypeInfo>(
  config<TypeInfo>({
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL ?? 'file:./keystone-example.db',

      // WARNING: this is only needed for our monorepo examples, dont do this
      prismaClientPath: 'node_modules/myprisma',
    },
    lists,
    ui: {
      // only admins can view the AdminUI
      isAccessAllowed: context => {
        return context.session?.user.isAdmin ?? false
      },
    },
  })
)
