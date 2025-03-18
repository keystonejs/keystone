import { config } from '@keystone-6/core'
import { lists } from './schema'
import { CustomLogo } from './admin/components/CustomLogo'

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  lists,
  ui: { components: { Logo: CustomLogo } },
})
