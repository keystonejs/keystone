import next from 'next'

import { createSystem } from '../lib/system'
import { createExpressServer } from '../lib/express'
import { createAdminUIMiddlewareWithNextApp } from '../lib/middleware'
import { ensurePrismaConfig } from '../lib/prisma-config'
import type { Flags } from './cli'
import { importBuiltKeystoneConfiguration, importBuiltPrismaModule } from './utils'

export async function start(
  cwd: string,
  { quiet, server, ui }: Pick<Flags, 'quiet' | 'server' | 'ui'>
) {
  function log(message: string) {
    if (quiet) return
    console.log(message)
  }
  log('✨ Starting Keystone')

  await ensurePrismaConfig(cwd, false)
  const keystoneConfig = await importBuiltKeystoneConfiguration(cwd)
  const system = createSystem(keystoneConfig)
  const paths = system.getPaths(cwd)

  if (!server) return

  const prismaClient = await importBuiltPrismaModule(cwd)
  const keystone = system.getKeystone(prismaClient)

  log('✨ Connecting to the database')
  await keystone.connect()

  log('✨ Creating server')
  const { expressServer, httpServer, apolloServer } = await createExpressServer(
    system.config,
    keystone.context
  )

  let isShuttingDown = false
  let disconnectPromise: Promise<void> | undefined
  function disconnect() {
    return (disconnectPromise ??= keystone.disconnect())
  }
  async function shutdown() {
    if (isShuttingDown) return
    isShuttingDown = true
    try {
      if (httpServer.listening) {
        await new Promise<void>((resolve, reject) => {
          httpServer.close(error => (error ? reject(error) : resolve()))
        })
      }
    } finally {
      try {
        await apolloServer.stop()
      } finally {
        await disconnect()
      }
    }
  }

  httpServer.once('close', () => {
    void disconnect().catch(error => {
      if (!isShuttingDown) console.error(error)
    })
  })

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      void shutdown().then(
        () => process.exit(0),
        error => {
          console.error(error)
          process.exit(1)
        }
      )
    })
  }

  log(`✅ GraphQL API ready`)
  if (!system.config.ui?.isDisabled && ui) {
    log('✨ Preparing Admin UI')
    const nextApp = next({ dev: false, dir: paths.admin })
    await nextApp.prepare()
    expressServer.use(createAdminUIMiddlewareWithNextApp(system.config, keystone.context, nextApp))
    log(`✅ Admin UI ready`)
  }

  const httpOptions = system.config.server.options

  // prefer env.PORT
  if ('PORT' in process.env) {
    httpOptions.port = parseInt(process.env.PORT || '')
  }

  // prefer env.HOST
  if ('HOST' in process.env) {
    httpOptions.host = process.env.HOST || ''
  }

  httpServer.listen(system.config.server.options, (err?: any) => {
    if (err) {
      void disconnect()
      throw err
    }

    const easyHost = [undefined, '', '::', '0.0.0.0'].includes(httpOptions.host)
      ? 'localhost'
      : httpOptions.host

    log(
      `⭐️ Server listening on ${httpOptions.host || ''}:${httpOptions.port} (http://${easyHost}:${httpOptions.port}/)`
    )
  })
}
