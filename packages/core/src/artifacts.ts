import fs from 'node:fs/promises'
import path from 'node:path'
import { printSchema, GraphQLSchema } from 'graphql'
import { getGenerators, formatSchema } from '@prisma/internals'
import { ExitError } from './scripts/utils'
import { type __ResolvedKeystoneConfig } from './types'
import { initialiseLists } from './lib/core/initialise-lists'
import {
  type System,
  getSystemPaths
} from './lib/createSystem'
import { printPrismaSchema } from './lib/core/prisma-schema-printer'
import { printGeneratedTypes } from './lib/typescript-schema-printer'

export function getFormattedGraphQLSchema (schema: string) {
  return (
    '# This file is automatically generated by Keystone, do not modify it manually.\n' +
    '# Modify your Keystone config when you want to change this.\n\n' +
    schema +
    '\n'
  )
}

async function readFileButReturnNothingIfDoesNotExist (path: string) {
  try {
    return await fs.readFile(path, 'utf8')
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return
    }
    throw err
  }
}

export async function validateArtifacts (
  cwd: string,
  system: System,
) {
  const paths = system.getPaths(cwd)
  const artifacts = await getCommittedArtifacts(system.config, system.graphQLSchema)
  const [writtenGraphQLSchema, writtenPrismaSchema] = await Promise.all([
    readFileButReturnNothingIfDoesNotExist(paths.schema.graphql),
    readFileButReturnNothingIfDoesNotExist(paths.schema.prisma),
  ])
  const outOfDateSchemas = (() => {
    if (writtenGraphQLSchema !== artifacts.graphql && writtenPrismaSchema !== artifacts.prisma) {
      return 'both'
    }
    if (writtenGraphQLSchema !== artifacts.graphql) {
      return 'graphql'
    }
    if (writtenPrismaSchema !== artifacts.prisma) {
      return 'prisma'
    }
  })()
  if (!outOfDateSchemas) return

  const message = {
    both: 'Your Prisma and GraphQL schemas are not up to date',
    graphql: 'Your GraphQL schema is not up to date',
    prisma: 'Your Prisma schema is not up to date',
  }[outOfDateSchemas]
  console.error(message)

  throw new ExitError(1)
}

async function getCommittedArtifacts (config: __ResolvedKeystoneConfig, graphQLSchema: GraphQLSchema) {
  const lists = initialiseLists(config)
  const prismaSchema = printPrismaSchema(config, lists)
  return {
    graphql: getFormattedGraphQLSchema(printSchema(graphQLSchema)),
    prisma: await formatSchema({ schema: prismaSchema }),
  }
}

export async function getArtifacts (system: System) {
  return await getCommittedArtifacts(system.config, system.graphQLSchema)
}

export async function generateArtifacts (cwd: string, system: System) {
  const paths = getSystemPaths(cwd, system.config)
  const artifacts = await getCommittedArtifacts(system.config, system.graphQLSchema)
  await fs.writeFile(paths.schema.graphql, artifacts.graphql)
  await fs.writeFile(paths.schema.prisma, artifacts.prisma)
  return artifacts
}

export async function generateTypes (cwd: string, system: System) {
  const paths = getSystemPaths(cwd, system.config)
  const schema = printGeneratedTypes(paths.types.relativePrismaPath, system.graphQLSchema, system.lists)
  await fs.mkdir(path.dirname(paths.schema.types), { recursive: true })
  await fs.writeFile(paths.schema.types, schema)
}

export async function generatePrismaClient (cwd: string, system: System) {
  const paths = getSystemPaths(cwd, system.config)
  const generators = await getGenerators({
    schemaPath: paths.schema.prisma,
  })

  await Promise.all(
    generators.map(async generator => {
      try {
        await generator.generate()
      } finally {
        const closePromise = new Promise<void>(resolve => {
          const child = (generator as any).generatorProcess
            .child as import('child_process').ChildProcess
          child.once('exit', () => {
            resolve()
          })
        })
        generator.stop()
        await closePromise
      }
    })
  )
}
