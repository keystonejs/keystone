import { config } from '@keystone-6/core'
import { lists, extendGraphqlSchema } from './schema'

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL ?? 'file:./keystone-example.db',
    enableLogging: ['query', 'info', 'warn', 'error'],

    // WARNING: this is only needed for our monorepo examples, don't do this
    prismaClientPath: 'node_modules/myprisma',
  },
  lists,
  graphql: {
    extendGraphqlSchema,
  }
})
