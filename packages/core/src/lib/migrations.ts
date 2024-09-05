import { toSchemasContainer } from '@prisma/internals'

// @ts-expect-error
import { Migrate } from '@prisma/migrate'

import { type System } from './createSystem'

function setOrRemoveEnvVariable (name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name]
    return
  }
  process.env[name] = value
}

export async function withMigrate<T> (
  prismaSchemaPath: string,
  system: {
    config: {
      db: Pick<System['config']['db'], 'url' | 'shadowDatabaseUrl'>
    }
  },
  cb: (operations: {
    apply: () => Promise<any>
    diagnostic: () => Promise<any>
    push: (force: boolean) => Promise<any>
    reset: () => Promise<any>
    schema: (_: string, force: boolean) => Promise<any>
  }) => Promise<T>
) {
  const migrate = new Migrate(prismaSchemaPath)
  async function run <T> (f: () => T) {
    // only required once - on child process start - but easiest to do this always
    const prevDBURLFromEnv = process.env.DATABASE_URL
    const prevShadowDBURLFromEnv = process.env.SHADOW_DATABASE_URL
    const prevHiddenUpdateMessage = process.env.PRISMA_HIDE_UPDATE_MESSAGE
    try {
      process.env.DATABASE_URL = system.config.db.url
      setOrRemoveEnvVariable('SHADOW_DATABASE_URL', system.config.db.shadowDatabaseUrl)
      process.env.PRISMA_HIDE_UPDATE_MESSAGE = '1' // temporarily silence
      return await f()
    } finally {
      setOrRemoveEnvVariable('DATABASE_URL', prevDBURLFromEnv)
      setOrRemoveEnvVariable('SHADOW_DATABASE_URL', prevShadowDBURLFromEnv)
      setOrRemoveEnvVariable('PRISMA_HIDE_UPDATE_MESSAGE', prevHiddenUpdateMessage)
    }
  }

  try {
    return await cb({
      async apply () { return run(() => migrate.applyMigrations()) },
      async diagnostic () { return run(() => migrate.devDiagnostic()) },
      async push (force) { return run(() => migrate.push({ force })) },
      async reset () { return run(() => migrate.reset()) },
      async schema (schema, force) {
        const schemaContainer = toSchemasContainer([
          [prismaSchemaPath, schema]
        ])

        return run(() => migrate.engine.schemaPush({ force, schema: schemaContainer }))
      }
    })
  } finally {
    await migrate.engine.initPromise
    const closePromise = new Promise<void>(resolve => {
      migrate.engine.child.once('exit', resolve)
    })
    migrate.stop()
    await closePromise
  }
}
