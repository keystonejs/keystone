import esbuild from 'esbuild'
import nextBuild from 'next/dist/build'
import { generateAdminUI } from '../admin-ui/system'
import { createSystem } from '../lib/createSystem'
import {
  getBuiltKeystoneConfiguration,
} from '../artifacts'
import { getEsbuildConfig } from '../lib/esbuild'
import type { Flags } from './cli'

export async function build (
  cwd: string,
  { frozen, prisma, ui }: Pick<Flags, 'frozen' | 'prisma' | 'ui'>
) {
  await esbuild.build(getEsbuildConfig(cwd))

  // TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
  const system = createSystem(getBuiltKeystoneConfiguration(cwd))

  const paths = system.getPaths(cwd)
  if (prisma) {
    if (frozen) {
      await system.validateArtifacts(cwd)
      console.log('✨ GraphQL and Prisma schemas are up to date')
    } else {
      await system.generateArtifacts(cwd)
      console.log('✨ Generated GraphQL and Prisma schemas')
    }

    await system.generateTypes(cwd)
    await system.generatePrismaClient(cwd)
  }

  if (system.config.ui?.isDisabled || !ui) return

  console.log('✨ Generating Admin UI code')
  await generateAdminUI(system.config, system.graphQLSchema, system.adminMeta, paths.admin, false)

  console.log('✨ Building Admin UI')
  await nextBuild(
    paths.admin,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    'default'
  )
}
