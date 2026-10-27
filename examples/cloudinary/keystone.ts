// @ts-expect-error graphql-upload does not provide TypeScript declarations
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import 'dotenv/config'
import { config } from '@keystone-6/core'
import { lists } from './schema'

export default config({
  server: {
    extendExpressApp(app) {
      app.use(graphqlUploadExpress({ maxFileSize: 10 * 1024 * 1024, maxFiles: 10 }))
    },
  },
  db: {
    provider: 'sqlite',
    prismaClientOptions: () => ({
      adapter: new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL ?? 'file:./keystone-example.db',
      }),
    }),
  },
  lists,
})
