import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { config, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text, timestamp } from '@keystone-6/core/fields'
import type { TypeInfo } from '.keystone/types'

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    prismaClientOptions: () => ({
      adapter: new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL || 'file:./keystone-example.db',
      }),
    }),
    // this is called by Keystone on start, or when connect() is called in script.ts
    onConnect: async context => {
      console.log('(keystone.ts)', 'onConnect')
      await context.db.Post.createOne({ data: { title: 'Created in onConnect' } })
    },
  },
  lists: {
    Post: list({
      access: allowAll,
      fields: {
        title: text(),
        createdAt: timestamp({
          db: {
            isNullable: false,
          },
          defaultValue: { kind: 'now' },
        }),
      },
    }),
  },
})
