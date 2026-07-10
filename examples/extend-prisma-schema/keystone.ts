import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { config } from '@keystone-6/core'
import { lists } from './schema'

export default config({
  db: {
    provider: 'sqlite',
    prismaClientOptions: () => ({
      adapter: new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL ?? 'file:./keystone-example.db',
      }),
    }),
    extendPrismaSchema: schema => {
      return schema.replace(
        /(generator [^}]+)}/g,
        ['$1', '  previewFeatures = ["views"]', '}'].join('\n')
      )
    },
  },
  lists,
})
