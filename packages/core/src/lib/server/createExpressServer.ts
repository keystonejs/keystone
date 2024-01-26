import { createServer, type Server } from 'http'
import cors, { type CorsOptions } from 'cors'
import { json } from 'body-parser'
import { expressMiddleware } from '@apollo/server/express4'
import express from 'express'
import type { GraphQLFormattedError, GraphQLSchema } from 'graphql'
import { ApolloServer, type ApolloServerOptions } from '@apollo/server'
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
// @ts-expect-error
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js'
import type { KeystoneConfig, KeystoneContext, GraphQLConfig } from '../../types'
import { addHealthCheck } from './addHealthCheck'
import { s3AssetsCommon, s3FileAssetsAPI, s3ImageAssetsAPI } from '../assets/s3'

/*
NOTE: This creates the main Keystone express server, including the
GraphQL API, but does NOT add the Admin UI middleware.

The Admin UI takes a while to build for dev, and is created separately
so the CLI can bring up the dev server early to handle GraphQL requests.
*/

const DEFAULT_MAX_FILE_SIZE = 200 * 1024 * 1024 // 200 MiB

const formatError = (graphqlConfig: GraphQLConfig | undefined) => {
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
    } else {
      return formattedError
    }
  }
}

export const createExpressServer = async (
  config: KeystoneConfig,
  graphQLSchema: GraphQLSchema,
  context: KeystoneContext
): Promise<{
  expressServer: express.Express
  apolloServer: ApolloServer<KeystoneContext>
  httpServer: Server
}> => {
  const expressServer = express()
  const httpServer = createServer(expressServer)

  if (config.server?.cors) {
    // Setting config.server.cors = true will provide backwards compatible defaults
    // Otherwise, the user can provide their own config object to use
    const corsConfig: CorsOptions =
      typeof config.server.cors === 'boolean'
        ? { origin: true, credentials: true }
        : config.server.cors
    expressServer.use(cors(corsConfig))
  }

  addHealthCheck({ config, server: expressServer })

  if (config.server?.extendExpressApp) {
    await config.server.extendExpressApp(expressServer, context)
  }

  if (config.server?.extendHttpServer) {
    config.server?.extendHttpServer(httpServer, context, graphQLSchema)
  }

  if (config.storage) {
    for (const key of Object.keys(config.storage)) {
      const storageConfig = config.storage[key];

      /**we can only verify isAccessAllowed in the following cases: 
      * 1. local storage: if serverRoute is defined 
      * 2. s3 storage: if serverRoute is defined. 
      * 
      * Otherwise the generateUrl would generate a direct url to s3 supporting solution 
      * like aws or minio or what not and as such, we wouldn't be able to intercept the 
      * request properly. 
      * 
      * Actually we could by "redirection", sending the browser back to us 
      * and checking before redirecting, but that would be a bit of a hack.
      */

      //verifying if isAccessAllowed would be supported in non-proxied mode and warning about it at development time
      if (storageConfig.isAccessAllowed && (storageConfig.kind === 's3' && !storageConfig.serverRoute)) {
        process.env.NODE_ENV === 'development' && console.warn("storage api isAccessAllowed is not supported in non-proxied mode for kind: s3. The isAccessAllowed function will not get executed");
      }

      /**
       * Also, checking if generateUrl respects the proxied flag. If it doesn't, we warn about it at development time. 
       */
      if (storageConfig.generateUrl && storageConfig.serverRoute) {
        process.env.NODE_ENV === 'development' && console.warn("generateUrl storage api config should respect the serverRoute flag. Some assumptions about the generateUrl function must be in place for serverRoute mode to work.")
      }

      if (storageConfig.serverRoute) {
        //now we need 2 implementations 
        //one for local storage, using express static middleware BUT with isAccessAllowed checked properly beforehand
        //another for s3, which will issue a GET Object request to s3, and pipe the stream to the response
        let expressMiddleware: express.RequestHandler;
        if (storageConfig.kind === 'local') {

          expressMiddleware = (request, response) => {

            const { extraPath } = request.params

            if (typeof storageConfig.isAccessAllowed === 'function' &&
              !storageConfig.isAccessAllowed(context, extraPath, response.getHeader)) {
              response.status(403).send('Forbidden')
              return
            }

            express.static(storageConfig.storagePath, {
              setHeaders(res) {
                if (storageConfig.type === 'file') {
                  res.setHeader('Content-Type', 'application/octet-stream')
                }
              },
              index: false,
              redirect: false,
              lastModified: false,
            })
          }
        }
        else if (storageConfig.kind === 's3') {

          const assetApi = storageConfig.type === 'image' ? s3ImageAssetsAPI(storageConfig) : s3FileAssetsAPI(storageConfig);

          expressMiddleware = (request, response) => {
            const { extraPath } = request.params

            if (!extraPath) {
              response.status(404).send('Not found')
              return
            }

            const { s3, s3Endpoint } = s3AssetsCommon(storageConfig);

            if (typeof storageConfig.isAccessAllowed === 'function' &&
              !storageConfig.isAccessAllowed(context, s3, s3Endpoint, extraPath, response.getHeader)) {
              response.status(403).send('Forbidden')
              return
            }

            assetApi.download(extraPath, response, response.setHeader);
          }

        }
        else {
          expressMiddleware = (request, response) => {
            process.env.NODE_ENV === 'development' && console.warn("storage api kind not supported");
            response.status(404).send('Not found')
          }
        }


        expressServer.use(
          `${storageConfig.serverRoute.path}/:extraPath`,
          expressMiddleware);
      }

    }
  }

  const apolloConfig = config.graphql?.apolloConfig
  const playgroundOption = config.graphql?.playground ?? process.env.NODE_ENV !== 'production'
  const serverConfig = {
    formatError: formatError(config.graphql),
    includeStacktraceInErrorResponses: config.graphql?.debug, // If undefined, use Apollo default of NODE_ENV !== 'production'
    ...apolloConfig,
    schema: graphQLSchema,
    plugins:
      playgroundOption === 'apollo'
        ? apolloConfig?.plugins
        : [
          playgroundOption
            ? ApolloServerPluginLandingPageLocalDefault()
            : ApolloServerPluginLandingPageDisabled(),
          ...(apolloConfig?.plugins || []),
        ],
  } as ApolloServerOptions<KeystoneContext>

  const apolloServer = new ApolloServer({ ...serverConfig })

  const maxFileSize = config.server?.maxFileSize || DEFAULT_MAX_FILE_SIZE
  expressServer.use(graphqlUploadExpress({ maxFileSize }))
  await apolloServer.start()
  expressServer.use(
    config.graphql?.path || '/api/graphql',
    json(config.graphql?.bodyParser),
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => {
        return await context.withRequest(req, res)
      },
    })
  )

  return { expressServer, apolloServer, httpServer }
}
