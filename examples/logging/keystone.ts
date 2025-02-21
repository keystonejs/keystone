import { config } from '@keystone-6/core'
import { lists } from './schema'
import type { TypeInfo } from '.keystone/types'

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  graphql: {
    apolloConfig: {
      formatError(formattedError, error) {
        // you can customise the error returned to the client
        return formattedError
      },
      plugins: [
        {
          async requestDidStart(requestContext) {
            console.log(
              'graphql operation',
              requestContext.request.operationName ?? '(unnamed operation)'
            )
            return {
              async didEncounterErrors(requestContext) {
                console.error(...requestContext.errors)
              },
            }
          },
        },
      ],
    },
  },
  lists,
})
