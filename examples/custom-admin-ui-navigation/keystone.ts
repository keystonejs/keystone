import { config } from '@keystone-6/core'
import { lists } from './schema'
import { CustomNavigation } from './admin/components/CustomNavigation'

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  lists,
  ui: {
    components: { Navigation: CustomNavigation },
  },
})
