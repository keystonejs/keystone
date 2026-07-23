import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { list, config } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'
import type { TypeInfo } from './generated/keystone/types'

export default config<TypeInfo>({
  db: {
    // we're using sqlite for the fastest startup experience
    //   for more information on what database might be appropriate for you
    //   see https://keystonejs.com/docs/guides/choosing-a-database#title
    provider: 'sqlite',
    prismaClientOptions: () => ({
      adapter: new PrismaBetterSqlite3({ url: `file:${process.cwd()}/keystone.db` }),
    }),
  },
  server: {
    port: 4000,
  },
  lists: {
    Post: list({
      access: allowAll,
      fields: {
        name: text(),
        content: text(),
      },
    }),
  },
})
