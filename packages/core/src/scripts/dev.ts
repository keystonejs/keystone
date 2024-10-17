import fsp from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import { createServer } from 'node:http'
import { type ListenOptions } from 'node:net'

import chalk from 'chalk'
import esbuild, { type BuildResult } from 'esbuild'
import express from 'express'
import next from 'next'
import { printSchema } from 'graphql'
import { createDatabase } from '@prisma/internals'

import { generateAdminUI } from '../admin-ui/system'
import { withMigrate } from '../lib/migrations'
import { confirmPrompt } from '../lib/prompts'
import { createSystem, } from '../lib/createSystem'
import { getEsbuildConfig } from './esbuild'
import { createExpressServer } from '../lib/createExpressServer'
import { createAdminUIMiddlewareWithNextApp } from '../lib/createAdminUIMiddleware'
import { runTelemetry } from '../lib/telemetry'
import {
  generateArtifacts,
  generatePrismaClient,
  generateTypes,
  getFormattedGraphQLSchema,
} from '../artifacts'
import { type KeystoneConfig } from '../types'
import { printPrismaSchema } from '../lib/core/prisma-schema-printer'
import { pkgDir } from '../pkg-dir'
import {
  ExitError,
  importBuiltKeystoneConfiguration,
} from './utils'
import { type Flags } from './cli'

const devLoadingHTMLFilepath = path.join(pkgDir, 'static', 'dev-loading.html')

function stripExtendHttpServer (config: KeystoneConfig): KeystoneConfig {
  const { server, ...rest } = config
  if (server) {
    const { extendHttpServer, ...restServer } = server
    return { ...rest, server: restServer }
  }
  return rest
}

function resolvablePromise<T> () {
  let _resolve!: (value: T) => void
  const promise: any = new Promise<T>(resolve => {
    _resolve = resolve
  })
  promise.resolve = _resolve
  return promise
}

export async function dev (
  cwd: string,
  { dbPush, prisma, server, ui }: Pick<Flags, 'dbPush' | 'prisma' | 'server' | 'ui'>
) {
  console.log('✨ Starting Keystone')
  let lastPromise = resolvablePromise<IteratorResult<BuildResult>>()

  const builds: AsyncIterable<BuildResult> = {
    [Symbol.asyncIterator]: () => ({ next: () => lastPromise }),
  }

  function addBuildResult (build: BuildResult) {
    const prev = lastPromise
    lastPromise = resolvablePromise()
    prev.resolve({ value: build, done: false })
  }

  const esbuildConfig = await getEsbuildConfig(cwd)
  const esbuildContext = await esbuild.context({
    ...esbuildConfig,
    plugins: [
      ...(esbuildConfig.plugins ?? []),
      {
        name: 'esbuildWatchPlugin',
        setup (build: any) {
          // TODO: no any
          build.onEnd(addBuildResult)
        },
      },
    ],
  })

  try {
    const firstBuild = await esbuildContext.rebuild()
    addBuildResult(firstBuild)
  } catch (e) {
    // esbuild prints everything we want users to see
  }

  esbuildContext.watch()

  let prismaClient: any = null
  async function stop (aHttpServer: any, exit = false) {
    await esbuildContext.dispose()

    //   WARNING: this is only actually required for tests
    // stop httpServer
    if (aHttpServer) {
      await new Promise((resolve, reject) => {
        aHttpServer.close(async (err: any) => {
          if (err) {
            console.error('Error closing the server', err)
            return reject(err)
          }

          resolve(null)
        })
      })
    }

    //   WARNING: this is only required for tests
    // stop Prisma
    try {
      await prismaClient?.disconnect?.()
    } catch (err) {
      console.error('Error disconnecting from the database', err)
      throw err
    }

    if (exit) throw new ExitError(1)
  }

  const app = server ? express() : null
  const httpServer = app ? createServer(app) : null
  let expressServer: express.Express | null = null
  let hasAddedAdminUIMiddleware = false
  const isReady = () => !server || (expressServer !== null && hasAddedAdminUIMiddleware)

  const initKeystone = async () => {
    const configWithExtendHttp = await importBuiltKeystoneConfiguration(cwd)
    const {
      system,
      context,
      prismaClientModule,
      apolloServer,
      ...rest
    } = await (async function () {
      const system = createSystem(stripExtendHttpServer(configWithExtendHttp))

      // mkdir's for local storage
      for (const val of Object.values(system.config.storage)) {
        if (val.kind !== 'local') continue

        await fsp.mkdir(val.storagePath, { recursive: true })
        console.warn(`WARNING: 'mkdir -p ${val.storagePath}' won't happen in production`)
      }

      // Generate the Artifacts
      if (prisma) {
        console.log('✨ Generating GraphQL and Prisma schemas')
        const { prisma: generatedPrismaSchema } = await generateArtifacts(cwd, system)
        await generateTypes(cwd, system)
        await generatePrismaClient(cwd, system)

        const paths = system.getPaths(cwd)
        if (dbPush) {
          const created = await createDatabase(system.config.db.url, path.dirname(paths.schema.prisma))
          if (created) console.log(`✨ Database created`)

          const migration = await withMigrate(paths.schema.prisma, system, async (m) => {
            // what does force on migrate.engine.schemaPush mean?
            // - true: ignore warnings, but unexecutable steps will block
            // - false: warnings or unexecutable steps will block
            const migration_ = await m.schema(generatedPrismaSchema, false)

            // if there are unexecutable steps, we need to reset the database [or the user can use migrations]
            if (migration_.unexecutable.length) {
              console.log(`${chalk.bold.red('\n⚠️ We found changes that cannot be executed:\n')}`)
              for (const item of migration_.unexecutable) {
                console.log(`  • ${item}`)
              }

              if (migration_.warnings.length) {
                console.warn(chalk.bold(`\n⚠️  Warnings:\n`))
                for (const warning of migration_.warnings) {
                  console.warn(`  • ${warning}`)
                }
              }

              console.log('\nTo apply this migration, we need to reset the database')
              if (!(await confirmPrompt(`Do you want to continue? ${chalk.red('All data will be lost')}`, false))) {
                console.log('Reset cancelled')
                throw new ExitError(0)
              }

              await m.reset()
              return m.schema(generatedPrismaSchema, false)
            }

            if (migration_.warnings.length) {
              if (migration_.warnings.length) {
                console.warn(chalk.bold(`\n⚠️  Warnings:\n`))
                for (const warning of migration_.warnings) {
                  console.warn(`  • ${warning}`)
                }
              }

              if (!(await confirmPrompt(`Do you want to continue? ${chalk.red('Some data will be lost')}`, false))) {
                console.log('Push cancelled')
                throw new ExitError(0)
              }

              return m.schema(generatedPrismaSchema, true)
            }

            return migration_
          })

          if (migration.warnings.length === 0 && migration.executedSteps === 0) {
            console.log(`✨ Database unchanged`)
          } else {
            console.log(`✨ Database synchronized with Prisma schema`)
          }

        } else {
          console.warn('⚠️ Skipping database schema push')
        }

        const prismaClientModule = require(paths.prisma)
        const keystone = system.getKeystone(prismaClientModule)

        console.log('✨ Connecting to the database')
        await keystone.connect() // TODO: remove, replace with server.onStart
        if (!server) {
          return {
            system,
            context: keystone.context,
            prismaClientModule,
          }
        }

        console.log('✨ Creating server')
        const { apolloServer, expressServer } = await createExpressServer(system.config, keystone.context)
        console.log(`✅ GraphQL API ready`)

        return {
          system,
          context: keystone.context,
          expressServer,
          apolloServer,
          prismaClientModule,
        }
      }
      return {
        system,
      }
    })()

    if (configWithExtendHttp?.server?.extendHttpServer && httpServer && context) {
      configWithExtendHttp.server.extendHttpServer(httpServer, context)
    }

    prismaClient = context?.prisma
    if (rest.expressServer) {
      ({ expressServer } = rest)
    }

    let nextApp
    if (!system.config.ui?.isDisabled && ui) {
      if (!expressServer || !context) throw new TypeError('Error trying to prepare the Admin UI')

      console.log('✨ Generating Admin UI code')
      const paths = system.getPaths(cwd)
      await fsp.rm(paths.admin, { recursive: true, force: true })
      await generateAdminUI(system.config, system.graphQLSchema, system.adminMeta, paths.admin, false)

      console.log('✨ Preparing Admin UI')
      nextApp = next({ dev: true, dir: paths.admin })
      await nextApp.prepare()
      expressServer.use(createAdminUIMiddlewareWithNextApp(system.config, context, nextApp))
      console.log(`✅ Admin UI ready`)
    }

    hasAddedAdminUIMiddleware = true
    initKeystonePromiseResolve()

    const originalPrismaSchema = printPrismaSchema(system.config, system.lists)
    let lastPrintedGraphQLSchema = printSchema(system.graphQLSchema)
    let lastApolloServer = apolloServer ?? null

    if (system.config.telemetry !== false) {
      runTelemetry(cwd, system.lists, system.config.db.provider)
    }

    for await (const buildResult of builds) {
      if (buildResult.errors.length) continue

      console.log('compiled successfully')
      try {
        const paths = system.getPaths(cwd)

        // wipe the require cache
        {
          const resolved = require.resolve(paths.config)
          delete require.cache[resolved]
        }

        const newConfigWithHttp = await importBuiltKeystoneConfiguration(cwd)
        const newSystem = createSystem(stripExtendHttpServer(newConfigWithHttp))

        if (prisma) {
          if (!originalPrismaSchema) throw new TypeError('Missing Prisma schema source')

          const newPrismaSchema = printPrismaSchema(newSystem.config, newSystem.lists)
          if (originalPrismaSchema !== newPrismaSchema) {
            console.error('🔄 Your prisma schema has changed, please restart Keystone')
            return stop(null, true)
          }
          // we only need to test for the things which influence the prisma client creation
          // and aren't written into the prisma schema since we check whether the prisma schema has changed above
          if (
            JSON.stringify(newSystem.config.db.enableLogging) !== JSON.stringify(system.config.db.enableLogging)
            || newSystem.config.db.url !== system.config.db.url
          ) {
            console.error('Your database configuration has changed, please restart Keystone')
            return stop(null, true)
          }
        }

        // we're not using generateCommittedArtifacts or any of the similar functions
        // because we will never need to write a new prisma schema here
        // and formatting the prisma schema leaves some listeners on the process
        // which means you get a "there's probably a memory leak" warning from node
        const newPrintedGraphQLSchema = printSchema(newSystem.graphQLSchema)
        if (newPrintedGraphQLSchema !== lastPrintedGraphQLSchema) {
          await fsp.writeFile(paths.schema.graphql, getFormattedGraphQLSchema(newPrintedGraphQLSchema))
          lastPrintedGraphQLSchema = newPrintedGraphQLSchema
        }

        await generateTypes(cwd, newSystem)
        await generateAdminUI(newSystem.config, newSystem.graphQLSchema, newSystem.adminMeta, paths.admin, true)
        if (prismaClientModule) {
          if (server && lastApolloServer) {
            const { context: newContext } = newSystem.getKeystone(prismaClientModule)
            const servers = await createExpressServer(newSystem.config, newContext)
            if (nextApp) {
              servers.expressServer.use(createAdminUIMiddlewareWithNextApp(newSystem.config, newContext, nextApp))
            }
            expressServer = servers.expressServer
            const prevApolloServer = lastApolloServer
            lastApolloServer = servers.apolloServer
            await prevApolloServer.stop()
          }
        }
      } catch (err) {
        console.error(`Error loading your Keystone config`, err)
      }
    }
  }

  // Serve the dev status page for the Admin UI
  let initKeystonePromiseResolve: () => void | undefined
  let initKeystonePromiseReject: (err: any) => void | undefined
  const initKeystonePromise = new Promise<void>((resolve, reject) => {
    initKeystonePromiseResolve = resolve
    initKeystonePromiseReject = reject
  })

  if (app && httpServer) {
    const config = await importBuiltKeystoneConfiguration(cwd)

    app.use('/__keystone/dev/status', (req, res) => {
      res.status(isReady() ? 200 : 501).end()
    })

    app.use((req, res, next) => {
      if (expressServer && hasAddedAdminUIMiddleware) {
        return expressServer(req, res, next)
      }

      const { pathname } = url.parse(req.url)
      if (expressServer && pathname === (config.graphql?.path || '/api/graphql')) {
        return expressServer(req, res, next)
      }

      res.sendFile(devLoadingHTMLFilepath)
    })

    const httpOptions: ListenOptions = {
      port: 3000,
    }

    if (config?.server && 'port' in config.server) {
      httpOptions.port = config.server.port
    }

    if (config?.server && 'options' in config.server && config.server.options) {
      Object.assign(httpOptions, config.server.options)
    }

    // preference env.PORT if supplied
    if ('PORT' in process.env) {
      httpOptions.port = parseInt(process.env.PORT || '')
    }

    // preference env.HOST if supplied
    if ('HOST' in process.env) {
      httpOptions.host = process.env.HOST || ''
    }

    const server = httpServer.listen(httpOptions, (err?: any) => {
      if (err) throw err

      const easyHost = [undefined, '', '::', '0.0.0.0'].includes(httpOptions.host)
        ? 'localhost'
        : httpOptions.host
      console.log(
        `⭐️ Server listening on ${httpOptions.host || ''}:${
          httpOptions.port
        } (http://${easyHost}:${httpOptions.port}/)`
      )
      console.log(`⭐️ GraphQL API available at ${config.graphql?.path || '/api/graphql'}`)

      // Don't start initialising Keystone until the dev server is ready,
      // otherwise it slows down the first response significantly
      initKeystone().catch(async err => {
        await stop(server)
        initKeystonePromiseReject(err)
      })
    })

    await initKeystonePromise
    return async () => await stop(server)
  } else {
    await initKeystone()
    return () => Promise.resolve()
  }
}
