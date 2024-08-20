import { config } from '@keystone-6/core'
import { lists } from './schema'
import type { TypeInfo } from '.keystone/types'

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL ?? 'file:./example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  lists,
})
