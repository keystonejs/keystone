import esbuild from 'esbuild'
import nextBuild from 'next/dist/build'
import { generateAdminUI } from '../admin-ui/system'
import { createSystem } from '../lib/createSystem'
import {
  getBuiltKeystoneConfiguration,
  getSystemPaths,
  generatePrismaAndGraphQLSchemas,
  generateTypescriptTypesAndPrisma,
  validatePrismaAndGraphQLSchemas,
} from '../artifacts'
import { getEsbuildConfig } from '../lib/esbuild'
import type { Flags } from './cli'

export async function build (
  cwd: string,
  { frozen, prisma, ui }: Pick<Flags, 'frozen' | 'prisma' | 'ui'>
) {
  await esbuild.build(getEsbuildConfig(cwd))

  // TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
  const config = getBuiltKeystoneConfiguration(cwd)
  const { graphQLSchema, adminMeta } = createSystem(config)

  const paths = getSystemPaths(cwd, config)
  if (prisma) {
    if (frozen) {
      await validatePrismaAndGraphQLSchemas(cwd, config, graphQLSchema)
      console.log('✨ GraphQL and Prisma schemas are up to date')
    } else {
      await generatePrismaAndGraphQLSchemas(cwd, config, graphQLSchema)
      console.log('✨ Generated GraphQL and Prisma schemas')
    }

    await generateTypescriptTypesAndPrisma(cwd, config, graphQLSchema)
  }

  if (config.ui?.isDisabled || !ui) return

  console.log('✨ Generating Admin UI code')
  await generateAdminUI(config, graphQLSchema, adminMeta, paths.admin, false)

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
