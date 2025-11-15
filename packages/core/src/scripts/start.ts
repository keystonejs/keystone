import next from 'next'

import { createSystem } from '../lib/system'
import { createExpressServer } from '../lib/express'
import { createAdminUIMiddlewareWithNextApp } from '../lib/middleware'
import { withMigrate } from '../lib/migrations'
import type { Flags } from './cli'
import { importBuiltKeystoneConfiguration } from './utils'

export async function start(
  cwd: string,
  { quiet, server, ui, withMigrations }: Pick<Flags, 'quiet' | 'server' | 'ui' | 'withMigrations'>
) {
  function log(message: string) {
    if (quiet) return
    console.log(message)
  }
  log('✨ Starting Keystone')

  const system = createSystem(await importBuiltKeystoneConfiguration(cwd))
  const paths = system.getPaths(cwd)

  if (withMigrations) {
    log('✨ Applying any database migrations')
    const { appliedMigrationNames } = await withMigrate(paths.schema.prisma, system, m => m.apply())
    log(
      appliedMigrationNames.length === 0
        ? `✨ No database migrations to apply`
        : `✨ Database migrated`
    )
  }

  if (!server) return

  const prismaClient = require(paths.prisma)
  const keystone = system.getKeystone(prismaClient)

  log('✨ Connecting to the database')
  await keystone.connect()

  log('✨ Creating server')
  const { expressServer, httpServer } = await createExpressServer(system.config, keystone.context)

  log(`✅ GraphQL API ready`)
  if (!system.config.ui?.isDisabled && ui) {
    log('✨ Preparing Admin UI')
    const nextApp = next({ dev: false, dir: cwd })
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
    if (err) throw err

    const easyHost = [undefined, '', '::', '0.0.0.0'].includes(httpOptions.host)
      ? 'localhost'
      : httpOptions.host

    log(
      `⭐️ Server listening on ${httpOptions.host || ''}:${httpOptions.port} (http://${easyHost}:${httpOptions.port}/)`
    )
  })
}
