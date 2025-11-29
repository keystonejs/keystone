import { type Server, createServer } from 'http'
import cors from 'cors'
import { json } from 'body-parser'
import { expressMiddleware } from '@apollo/server/express4'
import express from 'express'
import { GraphQLError, type GraphQLFormattedError } from 'graphql'
import { type ApolloServerOptions, ApolloServer } from '@apollo/server'
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
// @ts-expect-error
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js'
import type { KeystoneContext, KeystoneConfig } from '../types'
import { createSchemaRefreshServer, SchemaRefreshServer } from './schemaRefresh'

/*
NOTE: This creates the main Keystone express server, including the
GraphQL API, but does NOT add the Admin UI middleware.

The Admin UI takes a while to build for dev, and is created separately
so the CLI can bring up the dev server early to handle GraphQL requests.
*/

function formatError(graphqlConfig: KeystoneConfig['graphql']) {
  let debug = graphqlConfig.debug
  if (debug === undefined) {
    debug = process.env.NODE_ENV !== 'production'
  }
  return (formattedError: GraphQLFormattedError, error: unknown) => {
    if (error instanceof GraphQLError && error.originalError?.name.startsWith('Prisma')) {
      formattedError = {
        ...formattedError,
        extensions: {
          ...formattedError.extensions,
          code: 'KS_PRISMA_ERROR',
        },
        message: 'Prisma error',
      }
    }

    if (!debug && formattedError.extensions) {
      // Strip out any `debug` extensions
      delete formattedError.extensions.debug
      delete formattedError.extensions.exception
    }

    if (graphqlConfig.apolloConfig?.formatError) {
      return graphqlConfig.apolloConfig.formatError(formattedError, error)
    }

    return formattedError
  }
}

export async function createExpressServer(
  config: Pick<KeystoneConfig, 'graphql' | 'server'>,
  context: KeystoneContext
): Promise<{
  expressServer: express.Express
  apolloServer: ApolloServer<KeystoneContext>
  httpServer: Server
  schemaRefreshServer: SchemaRefreshServer
}> {
  const expressServer = express()
  const httpServer = createServer(expressServer)
  const schemaRefreshServer = createSchemaRefreshServer()
  schemaRefreshServer.start(httpServer)

  if (config.server.cors !== null) {
    expressServer.use(cors(config.server.cors))
  }

  await config.server.extendExpressApp(expressServer, context)
  await config.server.extendHttpServer(httpServer, context)

  const apolloConfig = config.graphql.apolloConfig
  const serverConfig = {
    includeStacktraceInErrorResponses: config.graphql.debug,
    ...apolloConfig,
    formatError: formatError(config.graphql),
    schema: context.graphql.schema,
    plugins:
      config.graphql.playground === 'apollo'
        ? apolloConfig?.plugins
        : [
            config.graphql.playground
              ? ApolloServerPluginLandingPageLocalDefault()
              : ApolloServerPluginLandingPageDisabled(),
            ...(apolloConfig?.plugins ?? []),
          ],
  } as ApolloServerOptions<KeystoneContext> // TODO: satisfies

  const apolloServer = new ApolloServer({ ...serverConfig })
  const maxFileSize = config.server.maxFileSize

  expressServer.use(graphqlUploadExpress({ maxFileSize }))
  await apolloServer.start()
  expressServer.use(
    config.graphql.path,
    json(config.graphql.bodyParser),
    (req, res, next) => {
      // WARNING: body-parser@^2 only sets .body if a .body is parsed, Apollo always wants .body to be set
      req.body ??= {}
      next()
    },
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => {
        return await context.withRequest(req, res)
      },
    })
  )

  return { expressServer, apolloServer, httpServer, schemaRefreshServer }
}
