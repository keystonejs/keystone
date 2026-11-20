import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { list, config } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'

export default config({
  db: {
    provider: 'sqlite',
    prismaClientOptions: () => ({
      adapter: new PrismaBetterSqlite3({ url: 'file:./app.db' }),
    }),
  },
  server: {
    extendHttpServer: server => {
      server.on('close', () => console.log('CLI-TESTS-HTTP-SERVER-CLOSED'))
    },
  },
  ui: { isDisabled: true },
  lists: {
    Todo: list({
      access: allowAll,
      fields: {
        title: text(),
      },
    }),
  },
})
