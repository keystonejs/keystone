import esbuild from 'esbuild'
import nextBuild from 'next/dist/build'
import { generateAdminUI } from '../admin-ui/system'
import {
  createSystem,
} from '../lib/createSystem'
import {
  generateArtifacts,
  generatePrismaClient,
  generateTypes,
  validateArtifacts,
} from '../artifacts'
import { getEsbuildConfig } from './esbuild'
import type { Flags } from './cli'
import { importBuiltKeystoneConfiguration } from './utils'

export async function build (
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
    'default'
  )
}
