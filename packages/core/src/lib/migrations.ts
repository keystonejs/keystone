import { type ChildProcess } from 'node:child_process'
import path from 'node:path'

import chalk from 'chalk'
import { createDatabase, uriToCredentials, type DatabaseCredentials } from '@prisma/internals'
import { Migrate } from '@prisma/migrate'

import { type System } from './createSystem'

import { ExitError } from '../scripts/utils'
import { confirmPrompt } from './prompts'

// we don't want to pollute process.env.DATABASE_URL so we're
// setting the env variable _just_ long enough for Migrate to
// read it and then we reset it immediately after.
// Migrate reads the env variables a single time when it starts the child process that it talks to

// note that we could only run this once per Migrate instance but we're going to do it consistently for all migrate calls
// so that calls can moved around freely without implictly relying on some other migrate command being called before it

// We also want to silence messages from Prisma about available updates, since the developer is
// not in control of their Prisma version.
// https://www.prisma.io/docs/reference/api-reference/environment-variables-reference#prisma_hide_update_message
function runMigrateWithDbUrl<T> (
  system: {
    config: {
      db: Pick<System['config']['db'], 'url' | 'shadowDatabaseUrl'>
    }
  },
  cb: () => T
): T {
  const prevDBURLFromEnv = process.env.DATABASE_URL
  const prevShadowDBURLFromEnv = process.env.SHADOW_DATABASE_URL
  const prevHiddenUpdateMessage = process.env.PRISMA_HIDE_UPDATE_MESSAGE
  try {
    process.env.DATABASE_URL = system.config.db.url
    setOrRemoveEnvVariable('SHADOW_DATABASE_URL', system.config.db.shadowDatabaseUrl)
    process.env.PRISMA_HIDE_UPDATE_MESSAGE = '1'
    return cb()
  } finally {
    setOrRemoveEnvVariable('DATABASE_URL', prevDBURLFromEnv)
    setOrRemoveEnvVariable('SHADOW_DATABASE_URL', prevShadowDBURLFromEnv)
    setOrRemoveEnvVariable('PRISMA_HIDE_UPDATE_MESSAGE', prevHiddenUpdateMessage)
  }
}

function setOrRemoveEnvVariable (name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name]
  } else {
    process.env[name] = value
  }
}

async function withMigrate<T> (schemaPath: string, cb: (migrate: Migrate) => Promise<T>) {
  const migrate = new Migrate(schemaPath)
  try {
    return await cb(migrate)
  } finally {
    const closePromise = new Promise<void>(resolve => {
      const child = (migrate.engine as any).child as ChildProcess
      child.once('exit', () => resolve())
    })
    migrate.stop()
    await closePromise
  }
}

export async function runMigrationsOnDatabase (cwd: string, system: System) {
  const paths = system.getPaths(cwd)
  return await withMigrate(paths.schema.prisma, async (migrate) => {
    const { appliedMigrationNames } = await runMigrateWithDbUrl(system, () => migrate.applyMigrations())
    return appliedMigrationNames
  })
}

export async function runMigrationsOnDatabaseMaybeReset (cwd: string, system: System) {
  const paths = system.getPaths(cwd)

  return await withMigrate(paths.schema.prisma, async (migrate) => {
    const diagnostic = await runMigrateWithDbUrl(system, () => migrate.devDiagnostic())

    if (diagnostic.action.tag === 'reset') {
      console.log(diagnostic.action.reason)
      const consent = await confirmPrompt(`Do you want to continue? ${chalk.red('All data will be lost')}`)
      if (!consent) throw new ExitError(1)

      await runMigrateWithDbUrl(system, () => migrate.reset())
    }

    const { appliedMigrationNames } = await runMigrateWithDbUrl(system, () => migrate.applyMigrations())
    return appliedMigrationNames
  })
}

export async function resetDatabase (dbUrl: string, prismaSchemaPath: string) {
  await createDatabase(dbUrl, path.dirname(prismaSchemaPath))
  const config = {
    db: {
      url: dbUrl,
      shadowDatabaseUrl: ''
    }
  }

  await withMigrate(prismaSchemaPath, async (migrate) => {
    await runMigrateWithDbUrl({ config }, () => migrate.reset())
    await runMigrateWithDbUrl({ config }, () => migrate.push({ force: true }))
  })
}

export async function pushPrismaSchemaToDatabase (
  cwd: string,
  system: System,
  prismaSchema: string, // already exists
  interactive: boolean = false
) {
  const paths = system.getPaths(cwd)

  const created = await createDatabase(system.config.db.url, path.dirname(paths.schema.prisma))
  if (interactive && created) {
    const credentials = uriToCredentials(system.config.db.url)
    console.log(`✨ ${credentials.type} database "${credentials.database}" created at ${getDbLocation(credentials)}`)
  }

  const migration = await withMigrate(paths.schema.prisma, async migrate => {
    // what does force on migrate.engine.schemaPush mean?
    // - true: ignore warnings, but unexecutable steps will block
    // - false: warnings or unexecutable steps will block
    const migration = await runMigrateWithDbUrl(system, () => migrate.engine.schemaPush({ force: false, schema: prismaSchema }))

    // if there are unexecutable steps, we need to reset the database [or the user can use migrations]
    if (migration.unexecutable.length) {
      if (!interactive) throw new ExitError(1)

      logUnexecutableSteps(migration.unexecutable)
      if (migration.warnings.length) logWarnings(migration.warnings)

      console.log('\nTo apply this migration, we need to reset the database')
      if (!(await confirmPrompt(`Do you want to continue? ${chalk.red('All data will be lost')}`, false))) {
        console.log('Reset cancelled')
        throw new ExitError(0)
      }

      await runMigrateWithDbUrl(system, () => migrate.reset())
      return runMigrateWithDbUrl(system, () => migrate.engine.schemaPush({ force: false, schema: prismaSchema }))
    }

    if (migration.warnings.length) {
      if (!interactive) throw new ExitError(1)

      logWarnings(migration.warnings)
      if (!(await confirmPrompt(`Do you want to continue? ${chalk.red('Some data will be lost')}`, false))) {
        console.log('Push cancelled')
        throw new ExitError(0)
      }
      return runMigrateWithDbUrl(system, () => migrate.engine.schemaPush({ force: true, schema: prismaSchema }))
    }

    return migration
  })

  if (!interactive) return
  if (migration.warnings.length === 0 && migration.executedSteps === 0) {
    console.log(`✨ Database unchanged`)
  } else {
    console.log(`✨ Database synchronized with Prisma schema`)
  }
}

function logUnexecutableSteps (unexecutableSteps: string[]) {
  console.log(`${chalk.bold.red('\n⚠️ We found changes that cannot be executed:\n')}`)
  for (const item of unexecutableSteps) {
    console.log(`  • ${item}`)
  }
}

function logWarnings (warnings: string[]) {
  console.warn(chalk.bold(`\n⚠️  Warnings:\n`))
  for (const warning of warnings) {
    console.warn(`  • ${warning}`)
  }
}

function getDbLocation (credentials: DatabaseCredentials): string {
  if (credentials.type === 'sqlite') {
    return credentials.uri!
  }

  return `${credentials.host}${credentials.port === undefined ? '' : `:${credentials.port}`}`
}
