import fs from 'node:fs/promises'
import { spawn } from 'node:child_process'
import {
  createSystem,
  getBuiltKeystoneConfigurationPath,
  getBuiltKeystoneConfiguration,
} from '../lib/createSystem'
import {
  validateArtifacts,
} from '../artifacts'
import { ExitError } from './utils'

export async function prisma (cwd: string, args: string[], frozen: boolean) {
  // TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
  const builtConfigPath = getBuiltKeystoneConfigurationPath(cwd)

  // this is the compiled version of the configuration which was generated during the build step
  if (!(await fs.stat(builtConfigPath).catch(() => null))) {
    console.error('🚨 keystone build must be run before running keystone start')
    throw new ExitError(1)
  }

  // TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
  const config = getBuiltKeystoneConfiguration(cwd)
  const system = createSystem(config)

  await validateArtifacts(cwd, system)
  console.log('✨ GraphQL and Prisma schemas are up to date')

  return new Promise<void>((resolve, reject) => {
    const p = spawn('node', [require.resolve('prisma'), ...args], {
      cwd,
      env: {
        ...process.env,
        DATABASE_URL: config.db.url,
        PRISMA_HIDE_UPDATE_MESSAGE: '1',
      },
      stdio: 'inherit',
    })
    p.on('error', err => reject(err))
    p.on('exit', code => {
      if (code) return reject(new ExitError(Number(code)))
      resolve()
    })
  })
}
