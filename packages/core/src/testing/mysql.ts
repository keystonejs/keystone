import { createConnection, type Connection, type PoolConfig } from 'mariadb'

import { applyMigrations } from './migrations.ts'

export type MysqlDatabaseConfig = PoolConfig | string

function databaseName(config: MysqlDatabaseConfig) {
  const database =
    typeof config === 'string'
      ? decodeURIComponent(new URL(config).pathname.slice(1))
      : config.database
  if (!database) throw new Error('MySQL database name must be provided')
  return database
}

function configForDatabase(config: MysqlDatabaseConfig, database: string): MysqlDatabaseConfig {
  if (typeof config !== 'string') return { ...config, database, multipleStatements: true }

  const url = new URL(config)
  if (url.protocol === 'mysql:') url.protocol = 'mariadb:'
  url.pathname = `/${encodeURIComponent(database)}`
  url.searchParams.set('multipleStatements', 'true')
  return url.toString()
}

function quoteIdentifier(identifier: string) {
  return `\`${identifier.replaceAll('`', '``')}\``
}

function isMissingDatabase(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    (('errno' in error && error.errno === 1049) ||
      ('code' in error && error.code === 'ER_BAD_DB_ERROR'))
  )
}

async function connect(config: MysqlDatabaseConfig) {
  return createConnection(config)
}

async function createDatabase(config: MysqlDatabaseConfig, database: string) {
  const connection = await connect(configForDatabase(config, 'mysql'))
  try {
    await connection.query(
      `CREATE DATABASE ${quoteIdentifier(database)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
  } catch (error) {
    if (
      !(typeof error === 'object' && error !== null && 'errno' in error && error.errno === 1007)
    ) {
      throw error
    }
  } finally {
    await connection.end()
  }
}

export async function resetDatabase(config: MysqlDatabaseConfig, migrationsDirectory: string) {
  const database = databaseName(config)
  const targetConfig = configForDatabase(config, database)
  let connection: Connection

  try {
    connection = await connect(targetConfig)
  } catch (error) {
    if (!isMissingDatabase(error)) throw error
    await createDatabase(config, database)
    connection = await connect(targetConfig)
  }

  const quotedDatabase = quoteIdentifier(database)
  try {
    await connection.query(`DROP DATABASE ${quotedDatabase}`)
    await connection.query(
      `CREATE DATABASE ${quotedDatabase} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    await connection.query(`USE ${quotedDatabase}`)
    await applyMigrations(migrationsDirectory, migration =>
      connection.query(migration).then(() => {})
    )
  } finally {
    await connection.end()
  }
}
