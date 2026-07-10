import { PrismaPg } from '@prisma/adapter-pg'
import { config } from '@keystone-6/core'
import { lists, extendGraphqlSchema } from './schema'

export default config({
  db: {
    provider: 'postgresql',
    prismaClientOptions: () => ({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL || 'postgresql://localhost/keystone-example',
      }),
    }),
    extendPrismaSchema: schema => {
      return schema.replace(
        /(generator [^}]+)}/g,
        ['$1', '  previewFeatures = ["fullTextSearchPostgres"]', '}'].join('\n')
      )
    },
  },
  graphql: {
    extendGraphqlSchema,
  },
  lists,
})
