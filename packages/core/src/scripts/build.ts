import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

import esbuild from 'esbuild'
import { generateAdminUI } from '../admin-ui/system'
import {
  generateArtifacts,
  generatePrismaClient,
  generateTypes,
  validateArtifacts,
} from '../artifacts'
import { createSystem } from '../lib/system'
import { ensurePrismaConfig } from '../lib/prisma-config'
import type { Flags } from './cli'
import { getEsbuildConfig, getEsbuildPrismaConfig } from './esbuild'
import { ExitError, importBuiltKeystoneConfiguration } from './utils'

export async function build(
  cwd: string,
  { frozen, prisma, quiet, ui }: Pick<Flags, 'frozen' | 'prisma' | 'quiet' | 'ui'>
) {
  function log(message: string) {
    if (quiet) return
    console.log(message)
  }

  // log('✨ Building Keystone configuration')
  await esbuild.build(await getEsbuildConfig(cwd))

  await ensurePrismaConfig(cwd, frozen)
  const system = createSystem(await importBuiltKeystoneConfiguration(cwd))
  if (prisma) {
    if (frozen) {
      await validateArtifacts(cwd, system)
      log('✨ GraphQL and Prisma schemas are up to date') // TODO: validating?
    } else {
      await generateArtifacts(cwd, system)
      log('✨ Generated GraphQL and Prisma schemas') // TODO: generating?
    }

    await generateTypes(cwd, system)
    await generatePrismaClient(cwd, system)

    const paths = system.getPaths(cwd)
    await esbuild.build(await getEsbuildPrismaConfig(cwd, paths.prisma))
  }

  if (system.config.ui?.isDisabled || !ui) return

  log('✨ Generating Admin UI code')
  const paths = system.getPaths(cwd)
  await generateAdminUI(system.config, system.adminMeta, paths.admin, false)

  log('✨ Building Admin UI')

  const nextCli = createRequire(path.join(cwd, 'package.json')).resolve('next/dist/bin/next')
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [nextCli, 'build', paths.admin], {
      cwd,
      stdio: 'inherit',
    })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (typeof code === 'number' && code !== 0) {
        reject(new ExitError(code))
      } else if (code === null) {
        reject(new Error(`Next.js was terminated by signal ${signal ?? 'unknown'}`))
      } else {
        resolve()
      }
    })
  })
}
