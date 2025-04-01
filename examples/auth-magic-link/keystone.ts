import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { config } from '@keystone-6/core'
import { createAuth } from '@keystone-6/auth'
import { lists, extendGraphqlSchema, sessionStrategy } from './schema'
import type { TypeInfo } from './generated/keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

// withAuth is a function we can use to wrap our base configuration
const { withAuth } = createAuth({
  // this is the list that contains our users
  listKey: 'User',

  // an identity field, typically a username or an email address
  identityField: 'name',

  // the password field must use the password field type
  passwordField: 'password',
  sessionStrategy,
  getAuthenticatedItemId(context) {
    return context.session?.id
  },
})

export default withAuth<TypeInfo>(
  config<TypeInfo>({
    db: {
      provider: 'sqlite',
      prismaClientOptions: () => ({
        adapter: new PrismaBetterSqlite3({
          url: process.env.DATABASE_URL ?? 'file:./keystone-example.db',
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
      return (await context.db.User.findOne({ where: { id: data.sub } })) ?? undefined
    },
    graphql: {
      extendGraphqlSchema,
    },
  })
)
