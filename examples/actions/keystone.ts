import { config } from '@keystone-6/core'
import { lists } from './schema'
import type { TypeInfo } from '.keystone/types'

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL ?? 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  lists,
  graphql: {
    apolloConfig: {
      formatError(formattedError, __error) {
        // you can customise the error returned to the client
        return formattedError
      },
      plugins: [
        {
          async requestDidStart() {
            const start = Date.now()

            return {
              async willSendResponse(requestContext) {
                console.error(
                  {
                    req: requestContext.contextValue.req
                      ? { id: requestContext.contextValue.req?.id }
                      : undefined,
                    responseTime: Date.now() - start,
                    graphql: {
                      type: requestContext.operation?.operation,
                      name: requestContext.request.operationName,
                      // query: requestContext.request.query, // WARNING: may be verbose
                      errors: JSON.stringify(
                        requestContext.errors?.map(e => ({
                          path: e.path,
                          message: e.message,
                        })) || undefined,
                        null,
                        2
                      ),
                    },
                  },
                  'graphql query completed'
                )
              },
            }
          },
        },
      ],
    },
  },
})
