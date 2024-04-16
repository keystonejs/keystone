import esbuild from 'esbuild'
import nextBuild from 'next/dist/build'
import { generateAdminUI } from '../admin-ui/system'
import {
  createSystem,
  getBuiltKeystoneConfiguration
} from '../lib/createSystem'
import {
  generateArtifacts,
  generatePrismaClient,
  generateTypes,
  validateArtifacts,
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

  if (prisma) {
    if (frozen) {
      await validateArtifacts(cwd, system)
      console.log('✨ GraphQL and Prisma schemas are up to date')
    } else {
      await generateArtifacts(cwd, system)
      console.log('✨ Generated GraphQL and Prisma schemas')
    }

    await generateTypes(cwd, system)
    await generatePrismaClient(cwd, system)
  }

  if (system.config.ui?.isDisabled || !ui) return

  console.log('✨ Generating Admin UI code')
  const paths = system.getPaths(cwd)
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
