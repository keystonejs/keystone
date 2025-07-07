import { config } from '@keystone-6/core'
import { createHash, randomBytes } from 'node:crypto'
import pino_ from 'pino-http'

import type { TypeInfo } from '.keystone/types'
import { lists } from './schema'

function sha256 (q: string) {
  return createHash('sha256').update(q).digest('hex')
}

const pino = pino_()

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  server: {
    extendExpressApp(app) {
      // TODO: use the same requestId between express and Apollo
      app.use(pino)
    },
  },
  graphql: {
    apolloConfig: {
      formatError(formattedError, __error) {
        // you can customise the error returned to the client
        return formattedError
      },
      plugins: [
        {
          async requestDidStart() {
            // const requestId = requestContext.request.http?.headers.get('cf-ray')
            // const requestId = requestContext.request.http?.headers.get('x-amzn-trace-id')
            // const requestId = requestContext.request.http?.headers.get('x-request-id')
            const requestId = randomBytes(16).toString('base64url')
            const start = Date.now()

            return {
              async willSendResponse (requestContext) {
                pino.logger.info({
                  requestId, // TODO: share with express
                  duration: Date.now() - start,
                  query: {
                    name: requestContext.request.operationName,
                    type: requestContext.operation?.operation,
                    hash: sha256(requestContext.request.query ?? ''),
                    // query: requestContext.request.query, // WARNING: may be verbose
                  },
                  errors: requestContext.errors?.map(e => ({
                    message: e.message,
                    path: e.path
                  })) || undefined
                }, 'GraphQL')
              },
            }
          },
        },
      ],
    },
  },
  lists,
})
