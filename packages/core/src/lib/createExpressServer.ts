import { createServer, type Server } from 'http'
import cors from 'cors'
import { json } from 'body-parser'
import { expressMiddleware } from '@apollo/server/express4'
import express from 'express'
import {
  type GraphQLFormattedError,
} from 'graphql'
import { ApolloServer, type ApolloServerOptions } from '@apollo/server'
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
// @ts-expect-error
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js'
import {
  type GraphQLConfig,
  type KeystoneConfig,
  type KeystoneContext,
} from '../types'

/*
NOTE: This creates the main Keystone express server, including the
GraphQL API, but does NOT add the Admin UI middleware.

The Admin UI takes a while to build for dev, and is created separately
so the CLI can bring up the dev server early to handle GraphQL requests.
*/

function formatError (graphqlConfig: GraphQLConfig | undefined) {
  return (formattedError: GraphQLFormattedError, error: unknown) => {
    let debug = graphqlConfig?.debug
    if (debug === undefined) {
      debug = process.env.NODE_ENV !== 'production'
    }

    if (!debug && formattedError.extensions) {
      // Strip out any `debug` extensions
      delete formattedError.extensions.debug
      delete formattedError.extensions.exception
    }

    if (graphqlConfig?.apolloConfig?.formatError) {
      return graphqlConfig.apolloConfig.formatError(formattedError, error)
    }

    return formattedError
  }
}

export async function createExpressServer (
  config: Pick<KeystoneConfig, 'graphql' | 'server' | 'storage'>,
  _: any, // TODO: uses context.graphql.schema now, remove in breaking change
  context: KeystoneContext
): Promise<{
  expressServer: express.Express
  apolloServer: ApolloServer<KeystoneContext>
  httpServer: Server
}> {
  const expressServer = express()
  const httpServer = createServer(expressServer)

  if (config.server?.cors) {
    // TODO: remove default in breaking change, prefer resolveDefaults
    const corsConfig =
      config.server.cors === true
        ? { origin: true, credentials: true }
        : config.server.cors

    expressServer.use(cors(corsConfig))
  }

  /** @deprecated, TODO: remove in breaking change */
  if (config.server?.healthCheck) {
    const healthCheck = config.server.healthCheck === true ? {} : config.server.healthCheck

    expressServer.use(healthCheck.path ?? '/_healthcheck', (req, res) => {
      if (typeof healthCheck.data === 'function') return res.json(healthCheck.data())
      if (healthCheck.data) return res.json(healthCheck.data)

      res.json({
        status: 'pass',
        timestamp: Date.now(),
      })
    })
  }

  await config.server?.extendExpressApp?.(expressServer, context)
  await config.server?.extendHttpServer?.(httpServer, context, context.graphql.schema)

  if (config.storage) {
    for (const val of Object.values(config.storage)) {
      if (val.kind !== 'local' || !val.serverRoute) continue
      expressServer.use(
        val.serverRoute.path,
        express.static(val.storagePath, {
          setHeaders (res) {
            if (val.type === 'file') {
              res.setHeader('Content-Type', 'application/octet-stream')
            }
          },
          index: false,
          redirect: false,
          lastModified: false,
        })
      )
    }
  }

  const apolloConfig = config.graphql?.apolloConfig

  // TODO: remove default in breaking change, prefer resolveDefaults
  const playgroundOption = config.graphql?.playground ?? process.env.NODE_ENV !== 'production'
  const serverConfig = {
    formatError: formatError(config.graphql),

    // when undefined, use Apollo default of NODE_ENV !== 'production'
    includeStacktraceInErrorResponses: config.graphql?.debug,

    ...apolloConfig,
    schema: context.graphql.schema,
    plugins:
      playgroundOption === 'apollo'
        ? apolloConfig?.plugins
        : [
            playgroundOption
              ? ApolloServerPluginLandingPageLocalDefault()
              : ApolloServerPluginLandingPageDisabled(),
            ...(apolloConfig?.plugins ?? []),
          ],
  } as ApolloServerOptions<KeystoneContext>

  const apolloServer = new ApolloServer({ ...serverConfig })
  const maxFileSize = config.server?.maxFileSize

  expressServer.use(graphqlUploadExpress({ maxFileSize }))
  await apolloServer.start()
  expressServer.use(
    // TODO: remove default in breaking change, prefer resolveDefaults
    config.graphql?.path ?? '/api/graphql',
    json(config.graphql?.bodyParser),
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => {
        return await context.withRequest(req, res)
      },
    })
  )

  return { expressServer, apolloServer, httpServer }
}
