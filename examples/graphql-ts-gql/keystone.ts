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
    async onConnect(args) {
      // note this means you can skip running `ts-gql watch` because this will start by using `keystone dev`
      if (process.argv.includes('dev')) {
        import('@ts-gql/compiler').then(({ watch }) => {
          watch(process.cwd())
        })
      }
    },
  },
  lists,
})
