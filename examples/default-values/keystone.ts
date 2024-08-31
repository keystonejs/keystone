import { config } from '@keystone-6/core'
import { lists } from './schema'

export default config({
  db: {
    provider: 'mongodb',
    url: process.env.DATABASE_URL || 'mongodb://root:prisma@localhost:27017/prisma-mongo?authSource=admin&retryWrites=true&w=majority',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
    idField: { kind: 'objectid', type: 'String' }
  },
  lists,
})
