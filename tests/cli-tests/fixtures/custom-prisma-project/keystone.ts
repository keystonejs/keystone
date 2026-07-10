import { PrismaPg } from '@prisma/adapter-pg'
import { list, config } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'

export default config({
  db: {
    provider: 'postgresql',
    prismaClientOptions: () => ({
      adapter: new PrismaPg({ connectionString: 'file:./app.db' }),
    }),
    extendPrismaSchema: schema =>
      schema
        .replace(/(\ngenerator[^\n]+\{[^}]+)}/, '$1  previewFeatures = ["multiSchema"]\n}')
        .replace(/(datasource[^\n]+\{[^}]+)}/, '$1  schemas = ["first", "second"]\n}'),
  },
  ui: { isDisabled: true },
  lists: {
    Todo: list({
      access: allowAll,
      db: {
        extendPrismaSchema: model => model.replace('}', '@@schema("first")' + '\n}'),
      },
      fields: {
        title: text(),
      },
    }),
    SecondTodo: list({
      access: allowAll,
      db: {
        extendPrismaSchema: model => model.replace('}', '@@schema("second")' + '\n}'),
      },
      fields: {
        title: text(),
      },
    }),
  },
})
