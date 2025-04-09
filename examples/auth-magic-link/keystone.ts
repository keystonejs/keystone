import { config } from '@keystone-6/core'
import { createAuth } from '@keystone-6/auth'
import { lists, extendGraphqlSchema, sessionStrategy } from './schema'
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
  sessionStrategy,
  getSession: ({ context, data }) =>
    context.query.User.findOne({
      where: { id: data.itemId },
    }),
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
    graphql: {
      extendGraphqlSchema,
    },
  })
)
