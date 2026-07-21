import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { config } from '@keystone-6/core'
import { lists, extendGraphqlSchema } from './schema'

export default config({
  db: {
    provider: 'sqlite',
    prismaClientOptions: () => ({
      adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./test.db' }),
    }),
  },
  lists,
  graphql: {
    extendGraphqlSchema,
  },
  ui: {
    getAdditionalFiles: () => [
      {
        mode: 'write',
        src: "export default function(req,res) {res.send('something')}",
        outputPath: 'pages/api/blah/[...rest].js',
      },
    ],
  },
})
