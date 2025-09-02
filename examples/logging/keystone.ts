import { config } from '@keystone-6/core'
import { createHash } from 'node:crypto'
import pino_ from 'pino-http'

import type { TypeInfo } from '.keystone/types'
import { lists } from './schema'

function sha256(q: string) {
  return createHash('sha256').update(q).digest('base64url')
}

const pino = pino_({
  // genReqId: (req, res) => req.headers["cf-ray"] ?? '',
  // genReqId: (req, res) => req.headers["x-amzn-trace-id"] ?? '',
  // genReqId: (req, res) => req.headers["x-request-id"] ?? '',
})

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  server: {
    extendExpressApp(app) {
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
            const start = Date.now()

            return {
              async willSendResponse(requestContext) {
                pino.logger.info(
                  {
                    req: requestContext.contextValue.req
                      ? { id: requestContext.contextValue.req?.id }
                      : undefined,
                    responseTime: Date.now() - start,
                    graphql: {
                      type: requestContext.operation?.operation,
                      name: requestContext.request.operationName,
                      hash: sha256(requestContext.request.query ?? ''),
                      // query: requestContext.request.query, // WARNING: verbose
                      errors:
                        requestContext.errors?.map(e => ({
                          path: e.path,
                          message: e.message,
                        })) || undefined,
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
  ui: {
    getAdditionalFiles: async () => [
      {
        mode: 'write',
        src: `module.exports = ${JSON.stringify({
          // stop the default Next logging
          logging: false, // we use pino

          // defaults from packages/core/src/templates/next-config.ts
          bundlePagesRouterDependencies: true,
          eslint: { ignoreDuringBuilds: true },
          typescript: { ignoreBuildErrors: true },
          transpilePackages: ['../../admin'],
        })}`,
        outputPath: 'next.config.js',
      },
    ],
  },
  lists,
})
