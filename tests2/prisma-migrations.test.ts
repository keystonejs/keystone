import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

import { resetDatabase } from '../packages/core/src/testing'

test('resets the database and applies ordered Prisma migration directories', async () => {
  const scratchRoot = path.join(process.cwd(), '.keystone')
  await fs.mkdir(scratchRoot, { recursive: true })
  const cwd = await fs.mkdtemp(path.join(scratchRoot, 'migration-test-'))
  const migrationsPath = path.join(cwd, 'migrations')
  await fs.mkdir(path.join(migrationsPath, '20260101000000_init'), { recursive: true })
  await fs.mkdir(path.join(migrationsPath, '20260102000000_add_name'), { recursive: true })
  await fs.writeFile(path.join(migrationsPath, 'migration_lock.toml'), 'provider = "sqlite"')
  await fs.writeFile(
    path.join(migrationsPath, '20260101000000_init/migration.sql'),
    'CREATE TABLE User (id INTEGER PRIMARY KEY);'
  )
  await fs.writeFile(
    path.join(migrationsPath, '20260102000000_add_name/migration.sql'),
    'ALTER TABLE User ADD COLUMN name TEXT;'
  )

  const adapter = await new PrismaBetterSqlite3({
    url: `file:${path.join(cwd, 'test.db')}`,
  }).connect()
  try {
    await resetDatabase(adapter, migrationsPath)
    await adapter.executeScript("INSERT INTO User (name) VALUES ('Ada')")
    await resetDatabase(adapter, migrationsPath)
    const result = await adapter.queryRaw({
      sql: 'SELECT COUNT(*) AS count FROM User',
      args: [],
      argTypes: [],
    })
    assert.equal(Number(result.rows[0][0]), 0)
  } finally {
    await adapter.dispose()
  }
})

test('reports an invalid migration path', async () => {
  const cwd = await fs.mkdtemp(path.join(process.cwd(), '.keystone/migration-layout-test-'))
  const migrationsPath = path.join(cwd, 'migrations')
  await fs.mkdir(path.join(migrationsPath, 'broken'), { recursive: true })
  const adapter = await new PrismaBetterSqlite3({
    url: `file:${path.join(cwd, 'test.db')}`,
  }).connect()
  try {
    await assert.rejects(resetDatabase(adapter, migrationsPath), /broken.*migration\.sql/)
  } finally {
    await adapter.dispose()
  }
})
