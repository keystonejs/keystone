import { spawn } from 'node:child_process'

import { createSystem } from '../lib/createSystem'
import { validateArtifacts } from '../artifacts'
import {
  ExitError,
  importBuiltKeystoneConfiguration,
} from './utils'

async function spawnPrisma3 (cwd: string, system: {
  config: {
    db: {
      url: string
    }
  }
}, commands: string[]) {
  return new Promise<{
    exitCode: number | null
  }>((resolve, reject) => {
    const p = spawn('node', [require.resolve('prisma'), ...commands], {
      cwd,
      env: {
        ...process.env,
        DATABASE_URL: system.config.db.url,
        PRISMA_HIDE_UPDATE_MESSAGE: '1',
      },
      stdio: 'inherit'
    })
    p.on('error', err => reject(err))
    p.on('exit', exitCode => (resolve({ exitCode })))
  })
}

export async function prisma (cwd: string, args: string[], frozen: boolean) {
  // TODO: should build unless --frozen?

  const system = createSystem(await importBuiltKeystoneConfiguration(cwd))

  await validateArtifacts(cwd, system)
  console.log('✨ GraphQL and Prisma schemas are up to date')

  const { exitCode } = await spawnPrisma3(cwd, system, args)
  if (typeof exitCode === 'number' && exitCode !== 0) {
    throw new ExitError(exitCode)
  }
}
