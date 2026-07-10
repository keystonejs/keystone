import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { config } from '@keystone-6/core'
import { lists, extendGraphqlSchema } from './schema'

export default config({
  db: {
    provider: 'sqlite',
    prismaClientOptions: () => ({
      log: ['query', 'info', 'warn', 'error'],
      adapter: new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL ?? 'file:./keystone-example.db',
      }),
    }),

    // WARNING: this is only needed for our monorepo examples, don't do this
  },
  lists,
  graphql: {
    extendGraphqlSchema,
  },
})
