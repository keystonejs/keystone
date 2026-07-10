import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { config } from '@keystone-6/core'
import { lists, extendGraphqlSchema } from './schema'
import { extendHttpServer } from './websocket'

export default config({
  db: {
    provider: 'sqlite',
    prismaClientOptions: () => ({
      adapter: new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL || 'file:./keystone-example.db',
      }),
    }),
  },
  graphql: {
    extendGraphqlSchema,
  },
  lists,
  server: {
    extendHttpServer,
  },
})
