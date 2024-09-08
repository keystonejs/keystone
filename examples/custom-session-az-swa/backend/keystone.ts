import { config } from '@keystone-6/core'
import { lists } from './schema'
import type { TypeInfo } from '.keystone/types'
import { AzStaticWebAppAuthSessionStrategy } from './session'

export default config<TypeInfo>({
  server:
  {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  },
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL ?? 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  lists,
  session: AzStaticWebAppAuthSessionStrategy,
  ui: {
    basePath: '/api/admin', // move admin ui under api path
  }
})
