import fs from 'node:fs/promises'
import type { ListenOptions } from 'node:net'
import next from 'next'
import { createSystem } from '../system'
import { createExpressServer } from '../lib/createExpressServer'
import { createAdminUIMiddlewareWithNextApp } from '../lib/createAdminUIMiddleware'
import {
  getBuiltKeystoneConfigurationPath,
  getBuiltKeystoneConfiguration,
  getSystemPaths,
} from '../artifacts'
import { deployMigrations } from '../lib/migrations'
import { ExitError } from './utils'
import type { Flags } from './cli'

export async function start (
  cwd: string,
  { ui, withMigrations }: Pick<Flags, 'ui' | 'withMigrations'>
) {
  console.log('✨ Starting Keystone')

  // TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
  const builtConfigPath = getBuiltKeystoneConfigurationPath(cwd)

  // this is the compiled version of the configuration which was generated during the build step
  if (!(await fs.stat(builtConfigPath).catch(() => null))) {
    console.error('🚨 keystone build must be run before running keystone start')
    throw new ExitError(1)
  }

  const config = getBuiltKeystoneConfiguration(cwd)
  const paths = getSystemPaths(cwd, config)
  const { getKeystone } = createSystem(config)
  const prismaClient = require(paths.prisma)
  const keystone = getKeystone(prismaClient)

  if (withMigrations) {
    console.log('✨ Applying database migrations')
    await deployMigrations(paths.schema.prisma, config.db.url)
  }

  console.log('✨ Connecting to the database')
  await keystone.connect()

  console.log('✨ Creating server')
  const { expressServer, httpServer } = await createExpressServer(config, null, keystone.context)

  console.log(`✅ GraphQL API ready`)
  if (!config.ui?.isDisabled && ui) {
    console.log('✨ Preparing Admin UI Next.js app')
    const nextApp = next({ dev: false, dir: paths.admin })
    await nextApp.prepare()

    expressServer.use(await createAdminUIMiddlewareWithNextApp(config, keystone.context, nextApp))
    console.log(`✅ Admin UI ready`)
  }

  const httpOptions: ListenOptions = { port: 3000 }
  if (config?.server && 'port' in config.server) {
    httpOptions.port = config.server.port
  }

  if (config?.server && 'options' in config.server && config.server.options) {
    Object.assign(httpOptions, config.server.options)
  }

  // prefer env.PORT
  if ('PORT' in process.env) {
    httpOptions.port = parseInt(process.env.PORT || '')
  }

  // prefer env.HOST
  if ('HOST' in process.env) {
    httpOptions.host = process.env.HOST || ''
  }

  httpServer.listen(httpOptions, (err?: any) => {
    if (err) throw err

    const easyHost = [undefined, '', '::', '0.0.0.0'].includes(httpOptions.host)
      ? 'localhost'
      : httpOptions.host
    console.log(
      `⭐️ Server listening on ${httpOptions.host || ''}:${httpOptions.port} (http://${easyHost}:${
        httpOptions.port
      }/)`
    )
  })
}
