import { type ChildProcess } from 'node:child_process'
import path from 'node:path'

import chalk from 'chalk'
import { createDatabase, uriToCredentials, type DatabaseCredentials } from '@prisma/internals'
import { Migrate } from '@prisma/migrate'

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
export function runMigrateWithDbUrl<T> (
  dbUrl: string,
  shadowDbUrl: string | undefined,
  cb: () => T
): T {
  const prevDBURLFromEnv = process.env.DATABASE_URL
  const prevShadowDBURLFromEnv = process.env.SHADOW_DATABASE_URL
  const prevHiddenUpdateMessage = process.env.PRISMA_HIDE_UPDATE_MESSAGE
  try {
    process.env.DATABASE_URL = dbUrl
    setOrRemoveEnvVariable('SHADOW_DATABASE_URL', shadowDbUrl)
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

export async function withMigrate<T> (schemaPath: string, cb: (migrate: Migrate) => Promise<T>) {
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

export async function pushPrismaSchemaToDatabase (
  dbUrl: string,
  shadowDbUrl: string | undefined,
  schema: string,
  schemaPath: string,
  interactive: boolean = false
) {
  const created = await createDatabase(dbUrl, path.dirname(schemaPath))
  if (interactive && created) {
    const credentials = uriToCredentials(dbUrl)
    console.log(`✨ ${credentials.type} database "${credentials.database}" created at ${getDbLocation(credentials)}`)
  }

  const migration = await withMigrate(schemaPath, async migrate => {
    // what does force on migrate.engine.schemaPush mean?
    // - true: ignore warnings, but unexecutable steps will block
    // - false: warnings or unexecutable steps will block
    const migration = await runMigrateWithDbUrl(dbUrl, shadowDbUrl, () => migrate.engine.schemaPush({ force: false, schema, }))

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

      await runMigrateWithDbUrl(dbUrl, shadowDbUrl, () => migrate.reset())
      return runMigrateWithDbUrl(dbUrl, shadowDbUrl, () => migrate.engine.schemaPush({ force: false, schema, }))
    }

    if (migration.warnings.length) {
      if (!interactive) throw new ExitError(1)

      logWarnings(migration.warnings)
      if (!(await confirmPrompt(`Do you want to continue? ${chalk.red('Some data will be lost')}`, false))) {
        console.log('Push cancelled')
        throw new ExitError(0)
      }
      return runMigrateWithDbUrl(dbUrl, shadowDbUrl, () => migrate.engine.schemaPush({ force: true, schema, }))
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
