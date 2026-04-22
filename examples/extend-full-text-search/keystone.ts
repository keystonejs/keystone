import { config } from '@keystone-6/core'
import { lists, extendGraphqlSchema } from './schema'

export default config({
  db: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL || 'postgresql://localhost/keystone-example',

    extendPrismaSchema: schema => {
      return schema.replace(
        /(generator [^}]+)}/g,
        ['$1', '  previewFeatures = ["fullTextSearchPostgres"]', '}'].join('\n')
      )
    },

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  graphql: {
    extendGraphqlSchema,
  },
  lists,
})
