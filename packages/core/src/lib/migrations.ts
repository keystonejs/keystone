import { type ChildProcess } from 'node:child_process'
import { toSchemasContainer } from '@prisma/internals'
import { Migrate } from '@prisma/migrate'

import { type System } from './createSystem'

function setOrRemoveEnvVariable (name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name]
  } else {
    process.env[name] = value
  }
}

export async function withMigrate<T> (
  prismaSchemaPath: string,
  system: {
    config: {
      db: Pick<System['config']['db'], 'url' | 'shadowDatabaseUrl'>
    }
  },
  cb: (_: {
    apply: () => Promise<any>
    diagnostic: () => Promise<any>
    push: (force: boolean) => Promise<any>
    reset: () => Promise<any>
    schema: (_: string, force: boolean) => Promise<any>
  }) => Promise<T>
) {
  const migrate = new Migrate(prismaSchemaPath)
  // we don't want to pollute process.env.DATABASE_URL so we're
  // setting the env variable _just_ long enough for Migrate to
  // read it and then we reset it immediately after.
  // Migrate reads the env variables a single time when it starts the child process that it talks to

  // note that we could only run this once per Migrate instance but we're going to do it consistently for all migrate calls
  // so that calls can moved around freely without implictly relying on some other migrate command being called before it

  // We also want to silence messages from Prisma about available updates, since the developer is
  // not in control of their Prisma version.
  // https://www.prisma.io/docs/reference/api-reference/environment-variables-reference#prisma_hide_update_message
  function run <T> (f: () => T): T {
    const prevDBURLFromEnv = process.env.DATABASE_URL
    const prevShadowDBURLFromEnv = process.env.SHADOW_DATABASE_URL
    const prevHiddenUpdateMessage = process.env.PRISMA_HIDE_UPDATE_MESSAGE
    try {
      process.env.DATABASE_URL = system.config.db.url
      setOrRemoveEnvVariable('SHADOW_DATABASE_URL', system.config.db.shadowDatabaseUrl)
      process.env.PRISMA_HIDE_UPDATE_MESSAGE = '1'
      return f()
    } finally {
      setOrRemoveEnvVariable('DATABASE_URL', prevDBURLFromEnv)
      setOrRemoveEnvVariable('SHADOW_DATABASE_URL', prevShadowDBURLFromEnv)
      setOrRemoveEnvVariable('PRISMA_HIDE_UPDATE_MESSAGE', prevHiddenUpdateMessage)
    }
  }

  try {
    return await cb({
      async apply () {
        return run(() => migrate.applyMigrations())
      },
      async diagnostic () {
        return run(() => migrate.devDiagnostic())
      },
      async push (force: boolean) {
        return run(() => migrate.push({ force }))
      },
      async reset () {
        return run(() => migrate.reset())
      },
      async schema (schema, force) {
        const schemaContainer = toSchemasContainer([
          [prismaSchemaPath, schema]
        ])

        return run(() => migrate.engine.schemaPush({ force, schema: schemaContainer }))
      }
    })
  } finally {
    const closePromise = new Promise<void>(resolve => {
      const { child } = migrate.engine as { child: ChildProcess }
      child.once('exit', () => resolve())
    })
    migrate.stop()
    await closePromise
  }
}
