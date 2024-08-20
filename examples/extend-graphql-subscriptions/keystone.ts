import { config } from '@keystone-6/core'
import { lists, extendGraphqlSchema } from './schema'
import { extendHttpServer } from './websocket'

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  graphql: {
    extendGraphqlSchema
  },
  lists,
  server: {
    extendHttpServer,
  },
})
