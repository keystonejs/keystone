import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { config, list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'

export type something = string

export default config({
  db: {
    provider: 'sqlite',
    prismaClientOptions: () => ({
      adapter: new PrismaBetterSqlite3({ url: 'file:./app.db' }),
    }),
  },
  lists: {
    Todo: list({
      access: allowAll,
      fields: {
        title: text(),
      },
    }),
  },
})
