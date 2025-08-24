import esbuild from 'esbuild'
import { generateAdminUI } from '../admin-ui/system'
import {
  generateArtifacts,
  generatePrismaClient,
  generateTypes,
  validateArtifacts,
} from '../artifacts'
import { createSystem } from '../lib/system'
import type { Flags } from './cli'
import { getEsbuildConfig } from './esbuild'
import { importBuiltKeystoneConfiguration } from './utils'

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
  }

  if (system.config.ui?.isDisabled || !ui) return

  log('✨ Generating Admin UI code')
  const paths = system.getPaths(cwd)
  await generateAdminUI(system.config, system.adminMeta, paths.admin, paths.hasSrc, false)

  log('✨ Building Admin UI')

  // do _NOT_ change this to a static import, it is intentionally like this
  // to avoid loading it in the common case where the UI is not being built
  const nextBuild = require('next/dist/build').default
  await nextBuild(
    cwd,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    'default',
    undefined
  )
}
