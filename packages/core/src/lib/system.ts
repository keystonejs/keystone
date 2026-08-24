import path from 'node:path'

import type { KeystoneConfig } from '../types/index.ts'
import { createContextSystem } from './getContext.ts'

// TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
export function getBuiltKeystoneConfigurationPath(cwd: string) {
  return path.join(cwd, '.keystone/config.js')
}

export function getBuiltPrismaModulePath(cwd: string) {
  return path.join(cwd, '.keystone/prisma.js')
}

function posixify(s: string) {
  return s.split(path.sep).join('/')
}

function relativeModulePath(from: string, to: string) {
  const relative = posixify(path.relative(from, to))
  return relative.startsWith('.') ? relative : `./${relative}`
}

function getSystemPaths(cwd: string, config: KeystoneConfig) {
  const prismaClientOutput = path.resolve(cwd, config.db.prismaClientPath)
  const prismaClientPath = path.join(prismaClientOutput, 'client')

  const builtTypesPath = config.types?.path
    ? path.join(cwd, config.types.path) // TODO: enforce initConfig before getSystemPaths
    : path.join(cwd, 'generated/keystone/types.ts')

  const builtPrismaPath = path.resolve(cwd, config.db.prismaSchemaPath)

  // note using .js is the best way to generically import TypeScript types since TS:
  // - allows .js imports to .ts files in all module resolution modes with any options
  // - doesn't allow bare imports to .ts files in with moduleResolution: nodenext + "type": "module" (like Node)
  // - only allows .ts imports to .ts files when using allowImportingTsExtensions: true
  const relativePrismaPath =
    relativeModulePath(path.dirname(builtTypesPath), prismaClientPath) + '.js'

  const builtGraphqlPath = config.graphql?.schemaPath
    ? path.join(cwd, config.graphql.schemaPath) // TODO: enforce initConfig before getSystemPaths
    : path.join(cwd, 'schema.graphql')

  return {
    config: getBuiltKeystoneConfigurationPath(cwd),
    admin: path.join(cwd, '.keystone/admin'),
    prisma: prismaClientPath,
    prismaClientOutput,
    prismaGeneratorOutput: relativeModulePath(path.dirname(builtPrismaPath), prismaClientOutput),
    types: {
      relativePrismaPath,
    },
    schema: {
      types: builtTypesPath,
      prisma: builtPrismaPath,
      graphql: builtGraphqlPath,
    },
  }
}

export function createSystem(config: KeystoneConfig) {
  const system = createContextSystem(config)

  return {
    ...system,
    getPaths: (cwd: string) => getSystemPaths(cwd, config),
  }
}

export type System = ReturnType<typeof createSystem>
