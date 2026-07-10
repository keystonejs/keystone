import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { list, config } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { checkbox, text } from '@keystone-6/core/fields'

export default config({
  db: {
    provider: 'sqlite',
    prismaClientOptions: () => ({
      adapter: new PrismaBetterSqlite3({ url: 'file:./app.db' }),
    }),
  },
  ui: { isDisabled: true },
  lists: {
    Todo: list({
      access: allowAll,
      fields: {
        title: text(),
        isComplete: checkbox(),
      },
    }),
  },
})
