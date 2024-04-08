import { spawn } from 'node:child_process'
import esbuild from 'esbuild'
import {
  createSystem,
  getBuiltKeystoneConfiguration
} from '../lib/createSystem'
import {
  validateArtifacts,
  generatePrismaClient
} from '../artifacts'
import { getEsbuildConfig } from '../lib/esbuild'
import { ExitError } from './utils'

export async function prisma (cwd: string, args: string[], frozen: boolean) {
  if (frozen) {
    args = args.filter(arg => arg !== '--frozen')
  } else {
    await esbuild.build(getEsbuildConfig(cwd))
  }

  // TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
  const config = getBuiltKeystoneConfiguration(cwd)
  const system = createSystem(config)
  await validateArtifacts(cwd, system)
  await generatePrismaClient(cwd, system)

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
