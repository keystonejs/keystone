import esbuild from 'esbuild'
import { generateAdminUI } from '../admin-ui/system'
import { createSystem } from '../lib/createSystem'
import {
  generateArtifacts,
  generatePrismaClient,
  generateTypes,
  validateArtifacts,
} from '../artifacts'
import { getEsbuildConfig } from './esbuild'
import type { Flags } from './cli'
import { importBuiltKeystoneConfiguration } from './utils'

export async function build(
  cwd: string,
  { frozen, prisma, ui }: Pick<Flags, 'frozen' | 'prisma' | 'ui'>
) {
  // TODO: should this happen if frozen?
  await esbuild.build(await getEsbuildConfig(cwd))

  const system = createSystem(await importBuiltKeystoneConfiguration(cwd))
  if (prisma) {
    if (frozen) {
      await validateArtifacts(cwd, system)
      console.log('✨ GraphQL and Prisma schemas are up to date') // TODO: validating?
    } else {
      await generateArtifacts(cwd, system)
      console.log('✨ Generated GraphQL and Prisma schemas') // TODO: generating?
    }

    await generateTypes(cwd, system)
    await generatePrismaClient(cwd, system)
  }

  if (system.config.ui?.isDisabled || !ui) return

  console.log('✨ Generating Admin UI code')
  const paths = system.getPaths(cwd)
  await generateAdminUI(system.config, system.adminMeta, paths.admin, paths.hasSrc, false)

  console.log('✨ Building Admin UI')

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
