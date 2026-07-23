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
    async onConnect() {
      if (process.argv.includes('dev')) {
        const { generateOutput } = await import('@gql.tada/cli-utils')
        await generateOutput({ tsconfig: 'tsconfig.json', output: undefined })
      }
    },
  },
  lists,
})
