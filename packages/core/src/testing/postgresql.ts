import { Client, escapeIdentifier, type ClientConfig } from 'pg'

import { applyMigrations } from './migrations.ts'

export type PostgresqlDatabaseConfig = ClientConfig & {
  schema?: string
}

function configForDatabase(config: ClientConfig, database: string): ClientConfig {
  if (config.connectionString === undefined) return { ...config, database }

  const url = new URL(config.connectionString)
  url.pathname = `/${encodeURIComponent(database)}`
  return { ...config, connectionString: url.toString(), database: undefined }
}

function errorCode(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : undefined
}

async function createDatabase(config: ClientConfig, database: string) {
  const candidates = ['postgres', 'template1', 'defaultdb']
  let lastError: unknown

  for (const candidate of candidates) {
    const client = new Client(configForDatabase(config, candidate))
    try {
      await client.connect()
      await client.query(`CREATE DATABASE ${escapeIdentifier(database)}`)
      return
    } catch (error) {
      if (errorCode(error) === '42P04') return
      lastError = error
    } finally {
      await client.end().catch(() => {})
    }
  }

  throw new Error(`Could not create PostgreSQL database ${database}`, { cause: lastError })
}

async function connect(config: ClientConfig) {
  const client = new Client(config)
  try {
    await client.connect()
    return client
  } catch (error) {
    await client.end().catch(() => {})
    throw error
  }
}

export async function resetDatabase(
  { schema: configuredSchema, ...config }: PostgresqlDatabaseConfig,
  migrationsDirectory: string
) {
  const connection = new Client(config)
  const database = connection.database
  if (!database) throw new Error('PostgreSQL database name must be provided')

  const schema = configuredSchema ?? 'public'

  let client: Client
  try {
    client = await connect(config)
  } catch (error) {
    if (errorCode(error) !== '3D000') throw error
    await createDatabase(config, database)
    client = await connect(config)
  }

  const quotedSchema = escapeIdentifier(schema)
  try {
    await client.query(`DROP SCHEMA IF EXISTS ${quotedSchema} CASCADE`)
    await client.query(`CREATE SCHEMA ${quotedSchema}`)
    await client.query(`SET search_path TO ${quotedSchema}`)
    await applyMigrations(migrationsDirectory, migration => client.query(migration).then(() => {}))
  } finally {
    await client.end()
  }
}
