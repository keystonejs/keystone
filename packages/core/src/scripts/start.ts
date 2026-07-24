import { createNextServer } from '../next.ts'

import { createSystem } from '../lib/system.ts'
import { createExpressServer } from '../lib/express.ts'
import { createAdminUIMiddlewareWithNextApp } from '../lib/middleware.ts'
import type { Flags } from './cli.ts'
import { importBuiltKeystoneConfiguration, importBuiltPrismaModule } from './utils.ts'

export async function start(
  cwd: string,
  { quiet, server, ui }: Pick<Flags, 'quiet' | 'server' | 'ui'>
) {
  function log(message: string) {
    if (quiet) return
    console.log(message)
  }
  log('✨ Starting Keystone')

  const system = createSystem(await importBuiltKeystoneConfiguration(cwd))
  const paths = system.getPaths(cwd)

  if (!server) return

  const prismaClient = await importBuiltPrismaModule(cwd)
  const keystone = system.getKeystone(prismaClient)

  log('✨ Connecting to the database')
  await keystone.connect()

  log('✨ Creating server')
  const { expressServer, httpServer } = await createExpressServer(system.config, keystone.context)

  log(`✅ GraphQL API ready`)
  if (!system.config.ui?.isDisabled && ui) {
    log('✨ Preparing Admin UI')
    const nextApp = createNextServer({ dev: false, dir: paths.admin })
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
