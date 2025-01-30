import { config } from '@keystone-6/core'
import { lists } from './schema'

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
    async onConnect(args) {
      // note this means you can skip running `ts-gql watch` because this will start by using `keystone dev`
      if (process.argv.includes('dev')) {
        import('@ts-gql/compiler').then(({ watch }) => {
          watch(process.cwd())
        })
      }
    },
  },
  lists,
})
