import fs from 'node:fs/promises'
import path from 'node:path'

import type { SqlDriverAdapterFactory } from '@prisma/client/runtime/client'

type SqlDriverAdapter = Awaited<ReturnType<SqlDriverAdapterFactory['connect']>>

const query = (sql: string) => ({ sql, args: [], argTypes: [] })

function quoteIdentifier(identifier: string, quote: '`' | '"') {
  return quote + identifier.replaceAll(quote, quote + quote) + quote
}

async function rows(adapter: SqlDriverAdapter, sql: string) {
  const result = await adapter.queryRaw(query(sql))
  return result.rows.map(row =>
    Object.fromEntries(result.columnNames.map((column, index) => [column, row[index]]))
  ) as Record<string, unknown>[]
}

async function resetSqlite(adapter: SqlDriverAdapter) {
  await adapter.executeScript('PRAGMA foreign_keys = OFF')
  try {
    const objects = await rows(
      adapter,
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
    )
    for (const { name } of objects) {
      await adapter.executeScript(`DROP TABLE IF EXISTS ${quoteIdentifier(String(name), '"')}`)
    }
  } finally {
    await adapter.executeScript('PRAGMA foreign_keys = ON')
  }
}

async function resetPostgresql(adapter: SqlDriverAdapter) {
  const schemaName =
    adapter.getConnectionInfo?.().schemaName ??
    String((await rows(adapter, 'SELECT current_schema() AS schema_name'))[0].schema_name)
  const schema = schemaName.replaceAll("'", "''")
  const objects = await rows(
    adapter,
    `SELECT c.relname AS name, c.relkind AS kind FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = '${schema}' AND c.relkind IN ('r', 'p', 'v', 'm', 'S', 'f') ORDER BY CASE c.relkind WHEN 'v' THEN 0 WHEN 'm' THEN 0 ELSE 1 END`
  )
  for (const { name, kind } of objects) {
    const type =
      kind === 'v'
        ? 'VIEW'
        : kind === 'm'
          ? 'MATERIALIZED VIEW'
          : kind === 'S'
            ? 'SEQUENCE'
            : 'TABLE'
    await adapter.executeScript(
      `DROP ${type} IF EXISTS ${quoteIdentifier(schemaName, '"')}.${quoteIdentifier(String(name), '"')} CASCADE`
    )
  }
  const types = await rows(
    adapter,
    `SELECT t.typname AS name FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = '${schema}' AND t.typtype = 'e'`
  )
  for (const { name } of types) {
    await adapter.executeScript(
      `DROP TYPE IF EXISTS ${quoteIdentifier(schemaName, '"')}.${quoteIdentifier(String(name), '"')} CASCADE`
    )
  }
}

async function resetMysql(adapter: SqlDriverAdapter) {
  await adapter.executeScript('SET FOREIGN_KEY_CHECKS = 0')
  try {
    const objects = await rows(
      adapter,
      "SELECT TABLE_NAME AS name, TABLE_TYPE AS type FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_TYPE = 'VIEW' DESC"
    )
    for (const { name, type } of objects) {
      const objectType = type === 'VIEW' ? 'VIEW' : 'TABLE'
      await adapter.executeScript(
        `DROP ${objectType} IF EXISTS ${quoteIdentifier(String(name), '`')}`
      )
    }
  } finally {
    await adapter.executeScript('SET FOREIGN_KEY_CHECKS = 1')
  }
}

async function applyMigrations(adapter: SqlDriverAdapter, migrationsDirectory: string) {
  const entries = await fs.readdir(migrationsDirectory, { withFileTypes: true })
  const directories = entries
    .filter(entry => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))
  for (const directory of directories) {
    const migrationPath = path.join(migrationsDirectory, directory.name, 'migration.sql')
    let migration: string
    try {
      migration = await fs.readFile(migrationPath, 'utf8')
    } catch (error) {
      throw new Error(`Could not read migration ${migrationPath}`, { cause: error })
    }
    try {
      await adapter.executeScript(migration)
    } catch (error) {
      throw new Error(`Failed to apply migration ${migrationPath}`, { cause: error })
    }
  }
}

export async function resetDatabase(adapter: SqlDriverAdapter, migrationsDirectory: string) {
  switch (adapter.provider) {
    case 'sqlite':
      await resetSqlite(adapter)
      break
    case 'postgres':
      await resetPostgresql(adapter)
      break
    case 'mysql':
      await resetMysql(adapter)
      break
    default:
      throw new Error(`Unsupported database provider: ${adapter.provider}`)
  }
  await applyMigrations(adapter, migrationsDirectory)
}
