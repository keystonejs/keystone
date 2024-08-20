import { config } from '@keystone-6/core'
import { lists } from './schema'

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL ?? 'file:./keystone-example.db',

    extendPrismaSchema: (schema) => {
      return schema
        .replace(/(generator [^}]+)}/g, [
          '$1',
          '  binaryTargets = ["native", "linux-musl"]',
          '  previewFeatures = ["metrics"]',
          '}'
        ].join('\n'))
    },

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  lists,
})
