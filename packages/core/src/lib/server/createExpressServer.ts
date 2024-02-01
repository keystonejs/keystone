import { ApolloServer, type ApolloServerOptions } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import { json } from 'body-parser'
import cors, { type CorsOptions } from 'cors'
import express from 'express'
import type { GraphQLFormattedError, GraphQLSchema } from 'graphql'
import { createServer, type Server } from 'http'
// @ts-expect-error
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js'
import type { GraphQLConfig, KeystoneConfig, KeystoneContext, StorageConfig } from '../../types'
import { s3AssetsCommon, s3FileAssetsAPI, s3ImageAssetsAPI } from '../assets/s3'
import { addHealthCheck } from './addHealthCheck'

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
    Object.entries(config.storage).forEach(([key, storageConfig]) => {
      proxyStorageIfNeeded(key, storageConfig, expressServer, context);
    });
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


const proxyStorageIfNeeded = (storageConfigKey: string, storageConfig: StorageConfig, expressServer: express.Express, context: KeystoneContext) => {

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

  //verifying if isAccessAllowed would be supported in direct mode and warning about it at development time
  if (storageConfig.isAccessAllowed && (storageConfig.kind === 's3' && !storageConfig.serverRoute)) {
    process.env.NODE_ENV !== 'production' && console.warn("storage api isAccessAllowed is not supported in non-proxied mode for kind: s3. The isAccessAllowed function will not get executed");
  }

  /**
   * Also, checking if generateUrl respects the serverRoute path. If it doesn't, we warn about it at development time. 
   */
  if (storageConfig.generateUrl && storageConfig.serverRoute) {
    process.env.NODE_ENV !== 'production' && console.warn("generateUrl storage api config should respect the serverRoute flag. Some assumptions about the generateUrl function must be in place for serverRoute mode to work.")
  }

  if (storageConfig.serverRoute) {

    const { isAccessAllowed } = storageConfig;
    let storageAccessControl: express.RequestHandler = async (request, response, next) => {
      next();
    }

    if (isAccessAllowed) {

      storageAccessControl = async (request, response, next) => {
        const fileKey = request.params[0];

        if (!fileKey) {
          response.status(404).send('Not found')
          return
        }

        const opts = {
          context,
          fileKey,
          headers: (key: string) => {
            return request.header(key);
          },
          ...(storageConfig.kind === 's3' ? s3AssetsCommon(storageConfig) : {})
        };

        if (!isAccessAllowed(
          opts)) {
          response.status(403).send('Forbidden');
          return;
        }
        next();

      };

    }

    const storageProxy: express.RequestHandler = async (request, response, next) => {
      const fileKey = request.params[0];

      //Leave the local storage to express.static as it was in the original code of Keystone 
      if (storageConfig.kind === 'local') {
        next();
        return;
      }

      //S3 downloads are handled by the s3AssetsAPI
      try {
        const assetApi = storageConfig.type === 'image' ? s3ImageAssetsAPI(storageConfig) : s3FileAssetsAPI(storageConfig);
        await assetApi.download(fileKey, response, (key: string, value: string) => {
          response.header(key, value);
        });
      } catch (e) {
        console.error(e);
        response.status(500).send('Failed');

      }

      response.end();
      return;
    }

    expressServer
    .route(`${storageConfig.serverRoute.path}/${storageConfigKey}/*`)
    .get(storageAccessControl)
    .get(storageProxy);

    if (storageConfig.kind === 'local') {
      expressServer.use(`${storageConfig.serverRoute.path}/${storageConfigKey}`,
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
      );
    }
  }
}