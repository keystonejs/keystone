import { createHash } from 'node:crypto'
import { config } from '@keystone-6/core'

import type { TypeInfo } from '.keystone/types'
import { lists } from './schema'
import { init as initOtel, tracer } from './otel'

initOtel()

function sha256(q: string) {
  return createHash('sha256').update(q).digest('base64url')
}

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  graphql: {
    apolloConfig: {
      plugins: [
        {
          async requestDidStart() {
            const span = tracer.startSpan('graphql request')

            return {
              async willSendResponse({ operation, request }) {
                span.setAttribute('type', operation?.operation || 'unknown')
                span.setAttribute('name', request.operationName || 'unknown')
                span.setAttribute('hash', request.query ? sha256(request.query) : 'empty')
                // span.setAttribute('query', request.query?.replaceAll(/\s+/g, ' ') || '') // WARNING: verbose
                span.end()
              },
            }
          },
        },
      ],
    },
  },
  server: {
    extendExpressApp(app) {
      app.use((req, res, next) => {
        tracer.startActiveSpan(
          'http request',
          {
            attributes: {
              method: req.method,
              path: req.path,
              userAgent: req.headers['user-agent'] || '',
            },
          },
          span => {
            next()
            res.on('finish', () => {
              span.end()
            })
          }
        )
      })
    },
  },
  ui: {
    getAdditionalFiles: async () => [
      {
        mode: 'write',
        src: `module.exports = ${JSON.stringify({
          // stop the default Next logging
          logging: false, // we use something else

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
