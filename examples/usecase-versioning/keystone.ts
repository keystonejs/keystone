import { config } from '@keystone-6/core'
import { fixPrismaPath } from '../example-utils'
import { lists } from './schema'
import { type TypeInfo } from '.keystone/types'

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixPrismaPath,
  },
  lists,
})
