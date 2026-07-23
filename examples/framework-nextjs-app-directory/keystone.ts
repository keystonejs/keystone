import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { config } from '@keystone-6/core'
import { lists } from './src/keystone/schema'
import { seedDemoData } from './src/keystone/seed'
import type { Context } from './generated/keystone/types'

export default config({
  db: {
    provider: 'sqlite',
    prismaClientOptions: () => ({
      // next.js requires an absolute path for sqlite
      adapter: new PrismaBetterSqlite3({ url: `file:${process.cwd()}/keystone.db` }),
    }),
    onConnect: async (context: Context) => {
      await seedDemoData(context)
    },
  },
  lists,
})
