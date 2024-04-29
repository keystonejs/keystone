import esbuild from 'esbuild'
import fse from 'fs-extra'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

import {
  createSystem,
  getBuiltKeystoneConfiguration
} from '../lib/createSystem'
import { getEsbuildConfig } from '../lib/esbuild'
import { runMigrationsOnDatabaseMaybeReset } from '../lib/migrations'
import { textPrompt } from '../lib/prompts'

import {
  generateArtifacts,
  generatePrismaClient,
  generateTypes,
  validateArtifacts,
} from '../artifacts'
import { type Flags } from './cli'
import { ExitError } from './utils'

export async function spawnPrisma (cwd: string, system: {
  config: {
    db: {
      url: string
    }
  }
}, commands: string[]) {
  let output = ''
  return new Promise<{
    exitCode: number | null,
    output: string
  }>((resolve, reject) => {
    const p = spawn('node', [require.resolve('prisma'), ...commands], {
      cwd,
      env: {
        ...process.env,
        DATABASE_URL: system.config.db.url,
        PRISMA_HIDE_UPDATE_MESSAGE: '1',
      },
    })
    p.stdout.on('data', (data) => (output += data.toString('utf-8')))
    p.stderr.on('data', (data) => (output += data.toString('utf-8')))
    p.on('error', err => reject(err))
    p.on('exit', exitCode => (resolve({ exitCode, output })))
  })
}

export async function migrateCreate (
  cwd: string,
  { frozen }: Pick<Flags, 'frozen'>
) {
  await esbuild.build(getEsbuildConfig(cwd))

  // TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
  const system = createSystem(getBuiltKeystoneConfiguration(cwd))

  if (frozen) {
    await validateArtifacts(cwd, system)
    console.log('✨ GraphQL and Prisma schemas are up to date')
  } else {
    await generateArtifacts(cwd, system)
    console.log('✨ Generated GraphQL and Prisma schemas')
  }

  await generateTypes(cwd, system)
  await generatePrismaClient(cwd, system)

  // TODO: remove, should be Prisma
  await fse.outputFile(join(cwd, 'migrations/migration_lock.toml'), `Please do not edit this file manually
//  # It should be added in your version-control system (i.e. Git)
provider = ${system.config.db.provider}`)
  // TODO: remove, should be Prisma

  const paths = system.getPaths(cwd)
  const { output: summary, exitCode: prismaExitCode } = await spawnPrisma(cwd, system, [
    'migrate', 'diff',
    ...(system.config.db.shadowDatabaseUrl ? [
      '--shadow-database-url', system.config.db.shadowDatabaseUrl
    ] : []),
    '--from-migrations', 'migrations/',
    '--to-schema-datamodel', paths.schema.prisma,
  ])

  if (typeof prismaExitCode === 'number' && prismaExitCode !== 0) {
    console.error(summary)
    throw new ExitError(prismaExitCode)
  }

  if (summary.startsWith('No difference detected')) {
    console.error('🔄 Database unchanged from Prisma schema')
    throw new ExitError(0)
  }

  console.log(summary)
  const { output: sql, exitCode: prismaExitCode2 } = await spawnPrisma(cwd, system, [
    'migrate', 'diff',
    ...(system.config.db.shadowDatabaseUrl ? [
      '--shadow-database-url', system.config.db.shadowDatabaseUrl
    ] : []),
    '--from-migrations', 'migrations/',
    '--to-schema-datamodel', paths.schema.prisma,
    '--script'
  ])

  if (typeof prismaExitCode2 === 'number' && prismaExitCode2 !== 0) {
    console.error(sql)
    throw new ExitError(prismaExitCode2)
  }

  const prefix = new Date().toLocaleString('sv-SE').replace(/[^0-9]/g, '').slice(0, 14)

  // https://github.com/prisma/prisma/blob/183c14d2aa6059fc3c00c95363887e8941b3d911/packages/migrate/src/utils/promptForMigrationName.ts#L12
  //   Prisma truncates >200 characters
  const name = (await textPrompt('Name of migration')).replace(/[^A-Za-z0-9_]/g, '_').slice(0, 200)
  const path = join(`migrations`, `${prefix}_${name}/migration.sql`)

  await fse.outputFile(join(cwd, path), sql)
  console.log(`✨ Generated SQL migration at ${path}`)
}

export async function migrateApply (
  cwd: string,
  { frozen }: Pick<Flags, 'frozen'>
) {
  await esbuild.build(getEsbuildConfig(cwd))

  // TODO: this cannot be changed for now, circular dependency with getSystemPaths, getEsbuildConfig
  const system = createSystem(getBuiltKeystoneConfiguration(cwd))

  if (frozen) {
    await validateArtifacts(cwd, system)
    console.log('✨ GraphQL and Prisma schemas are up to date')
  } else {
    await generateArtifacts(cwd, system)
    console.log('✨ Generated GraphQL and Prisma schemas')
  }

  await generateTypes(cwd, system)
  await generatePrismaClient(cwd, system)

  console.log('✨ Applying any database migrations')
  const migrations = await runMigrationsOnDatabaseMaybeReset(cwd, system)
  console.log(migrations.length === 0 ? `✨ No database migrations to apply` : `✨ Database migrated`)
}
