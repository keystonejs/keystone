import { config } from '@keystone-6/core'
import { lists } from './schema'
import { extension } from './extend'

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
    async onConnect() {
      if (process.argv.includes('dev')) {
        const { generateOutput } = await import('@gql.tada/cli-utils')
        await generateOutput({ tsconfig: 'tsconfig.json', output: undefined })
      }
    },
  },
  lists,
  graphql: {
    extendGraphqlSchema: extension,
  },
})
