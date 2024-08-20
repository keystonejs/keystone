import { config } from '@keystone-6/core'
import { lists } from './schema'
import type { TypeInfo } from '.keystone/types'

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // our default identifier type can be 128-bit hex strings
    idField: { kind: 'random', bytes: 16, encoding: 'hex' },

    // WARNING: this is only needed for our monorepo examples, don't do this
    prismaClientPath: 'node_modules/myprisma',
  },
  lists,
})
