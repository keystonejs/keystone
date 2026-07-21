import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { list, config } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'

console.log('CLI-TESTS-NODE-ENV: ' + process.env.NODE_ENV)
console.log('CLI-TESTS-NODE-ENV-EVAL: ' + eval('process.env' + '.NODE_ENV'))

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
      },
    }),
  },
})
