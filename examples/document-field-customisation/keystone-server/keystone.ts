import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { config } from '@keystone-6/core'
import type { KeystoneConfigPre } from '@keystone-6/core/types'
import { seedDatabase } from './src/seed'
import { lists } from './src/schema'
import type { Context, TypeInfo } from './generated/keystone/types'

const db: KeystoneConfigPre<TypeInfo>['db'] = {
  provider: 'sqlite',
  prismaClientOptions: () => ({
    adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./database.db' }),
  }),
  async onConnect(context: Context) {
    if (process.argv.includes('--seed-database')) {
      await seedDatabase(context)
    }
  },
}

export default config({
  db,
  lists,
})
