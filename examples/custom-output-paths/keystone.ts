import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { config } from '@keystone-6/core'
import { lists } from './schema'

export default config({
  db: {
    provider: 'sqlite',
    prismaClientOptions: () => ({
      adapter: new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL || 'file:./keystone-example.db',
      }),
    }),
    prismaClientPath: 'generated/custom-prisma',
    prismaSchemaPath: 'my-prisma.prisma',
  },
  lists,

  graphql: {
    schemaPath: 'my-graphql.graphql',
  },

  // when working in a monorepo environment you may want to output the types elsewhere
  //   you can use .types.path to configure where that is
  types: {
    path: 'my-types.ts',
  },
})
