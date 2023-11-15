import { config, list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'

export type something = string

export default config({
  db: {
    provider: 'sqlite',
    url: 'file:./app.db',
    prismaClientPath: 'node_modules/.testprisma/client',
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
