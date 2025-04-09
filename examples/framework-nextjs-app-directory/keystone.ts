import { config } from '@keystone-6/core'
import { createAuth, statelessSessions } from '@keystone-6/auth'
import { lists } from './src/keystone/schema'
import { seedDemoData } from './src/keystone/seed'
import type { Context, Lists } from '.keystone/types'

declare module '.keystone/types' {
  interface Session {
    user: Lists.User.Item
  }
}

const { withAuth } = createAuth<Lists.User.TypeInfo>({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionStrategy: statelessSessions(),
  getSession: async ({ data, context }) => {
    const user = await context.db.User.findOne({ where: { id: data.itemId } })
    if (!user) return
    return { user }
  },
})

export default withAuth(
  config({
    db: {
      provider: 'sqlite',
      url: `file:${process.cwd()}/keystone.db`, // next.js requires an absolute path for sqlite
      onConnect: async (context: Context) => {
        await seedDemoData(context)
      },

      // WARNING: this is only needed for our monorepo examples, dont do this
      prismaClientPath: 'node_modules/myprisma',
    },
    lists,
    ui: {
      isAccessAllowed: ({ session }) => session !== undefined,
    },
  })
)
