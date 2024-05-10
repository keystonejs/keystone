import { config } from '@keystone-6/core'
import { fixPrismaPath } from '../example-utils'
import { lists } from './src/schema'
import extendGraphqlSchema from './src/static-data'
import { type Context } from '.keystone/types'
import { seedDatabase } from './src/seed'

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
    async onConnect(context: Context) {
      if (process.argv.includes('--seed-database')) {
        await seedDatabase(context)
      }
    },

    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixPrismaPath,
  },
  graphql: { extendGraphqlSchema },
  lists,
})
