import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

import Database from 'better-sqlite3'
import { createConnection } from 'mariadb'
import { Client } from 'pg'

import { resetDatabase as resetMysqlDatabase } from '../packages/core/src/testing/mysql.ts'
import { resetDatabase as resetPostgresqlDatabase } from '../packages/core/src/testing/postgresql.ts'
import { resetDatabase as resetSqliteDatabase } from '../packages/core/src/testing/sqlite.ts'
import { dbProvider } from './utils.ts'

type TestDatabase = {
  reset(migrationsDirectory: string): Promise<void>
  execute(sql: string): Promise<void>
  personCount(): Promise<number>
  cleanup(): Promise<void>
}

function forMariadb(databaseUrl: string, database?: string) {
  const url = new URL(databaseUrl)
  if (url.protocol === 'mysql:') url.protocol = 'mariadb:'
  if (database !== undefined) url.pathname = `/${encodeURIComponent(database)}`
  return url.toString()
}

async function createTestDatabase(cwd: string): Promise<TestDatabase> {
  const databaseUrl = process.env.DATABASE_URL
  assert.ok(databaseUrl, 'DATABASE_URL must be set')

  const identifier = `reset_database_${randomBytes(8).toString('hex')}`

  if (dbProvider === 'sqlite') {
    const filename = path.join(cwd, `${identifier}.db`)
    return {
      reset: migrationsDirectory => resetSqliteDatabase({ filename }, migrationsDirectory),
      async execute(sql) {
        new Database(filename).exec(sql).close()
      },
      async personCount() {
        const database = new Database(filename, { readonly: true })
        try {
          const row = database.prepare('SELECT COUNT(*) AS count FROM Person').get() as {
            count: number
          }
          return row.count
        } finally {
          database.close()
        }
      },
      async cleanup() {
        await fs.rm(filename, { force: true })
      },
    }
  }

  if (dbProvider === 'postgresql') {
    const targetUrl = new URL(databaseUrl)
    targetUrl.pathname = `/${identifier}`
    targetUrl.searchParams.delete('schema')
    const config = { connectionString: targetUrl.toString(), schema: 'app' }

    return {
      reset: migrationsDirectory => resetPostgresqlDatabase(config, migrationsDirectory),
      async execute(sql) {
        const client = new Client({ connectionString: targetUrl.toString() })
        await client.connect()
        try {
          await client.query('SET search_path TO app')
          await client.query(sql)
        } finally {
          await client.end()
        }
      },
      async personCount() {
        const client = new Client({ connectionString: targetUrl.toString() })
        await client.connect()
        try {
          const result = await client.query('SELECT COUNT(*) AS count FROM app.Person')
          return Number(result.rows[0].count)
        } finally {
          await client.end()
        }
      },
      async cleanup() {
        const client = new Client({ connectionString: databaseUrl })
        await client.connect()
        try {
          await client.query(`DROP DATABASE IF EXISTS "${identifier}"`)
        } finally {
          await client.end()
        }
      },
    }
  }

  const targetUrl = new URL(databaseUrl)
  targetUrl.pathname = `/${identifier}`
  const config = targetUrl.toString()
  const mariadbConfig = forMariadb(config)

  return {
    reset: migrationsDirectory => resetMysqlDatabase(config, migrationsDirectory),
    async execute(sql) {
      const connection = await createConnection(mariadbConfig)
      try {
        await connection.query(sql)
      } finally {
        await connection.end()
      }
    },
    async personCount() {
      const connection = await createConnection(mariadbConfig)
      try {
        const rows = await connection.query('SELECT COUNT(*) AS count FROM Person')
        return Number(rows[0].count)
      } finally {
        await connection.end()
      }
    },
    async cleanup() {
      const connection = await createConnection(forMariadb(databaseUrl, 'mysql'))
      try {
        await connection.query(`DROP DATABASE IF EXISTS \`${identifier}\``)
      } finally {
        await connection.end()
      }
    },
  }
}

function initialMigration() {
  const tables = `
    CREATE TABLE Person (id INTEGER PRIMARY KEY);
    CREATE TABLE Post (
      id INTEGER PRIMARY KEY,
      personId INTEGER NOT NULL,
      FOREIGN KEY (personId) REFERENCES Person(id)
    );
  `

  if (dbProvider === 'sqlite') return tables
  if (dbProvider === 'mysql') {
    return `${tables}\nCREATE VIEW PersonIds AS SELECT id FROM Person;`
  }
  return `
    CREATE TYPE Role AS ENUM ('user');
    ${tables}
    CREATE VIEW PersonIds AS SELECT id FROM Person;
    CREATE MATERIALIZED VIEW PersonCount AS SELECT COUNT(*) FROM Person;
    CREATE SEQUENCE TestSequence;
  `
}

async function createMigrations(cwd: string) {
  const migrationsPath = path.join(cwd, 'migrations')
  await fs.mkdir(path.join(migrationsPath, '20260101000000_init'), { recursive: true })
  await fs.mkdir(path.join(migrationsPath, '20260102000000_add_name'), { recursive: true })
  await fs.writeFile(path.join(migrationsPath, 'migration_lock.toml'), `provider = "${dbProvider}"`)
  await fs.writeFile(
    path.join(migrationsPath, '20260101000000_init/migration.sql'),
    initialMigration()
  )
  await fs.writeFile(
    path.join(migrationsPath, '20260102000000_add_name/migration.sql'),
    'ALTER TABLE Person ADD COLUMN name TEXT;'
  )
  return migrationsPath
}

test(`creates, resets, and migrates a ${dbProvider} database`, async () => {
  const scratchRoot = path.join(process.cwd(), '.keystone')
  await fs.mkdir(scratchRoot, { recursive: true })
  const cwd = await fs.mkdtemp(path.join(scratchRoot, 'migration-test-'))
  const migrationsPath = await createMigrations(cwd)
  const database = await createTestDatabase(cwd)

  try {
    await database.reset(migrationsPath)
    await database.execute("INSERT INTO Person (id, name) VALUES (1, 'Ada')")
    await database.execute('INSERT INTO Post (id, personId) VALUES (1, 1)')

    await database.reset(migrationsPath)

    assert.equal(await database.personCount(), 0)
  } finally {
    await database.cleanup()
    await fs.rm(cwd, { recursive: true })
  }
})

test(`skips ${dbProvider} migration directories without migration.sql`, async () => {
  const scratchRoot = path.join(process.cwd(), '.keystone')
  await fs.mkdir(scratchRoot, { recursive: true })
  const cwd = await fs.mkdtemp(path.join(scratchRoot, 'migration-layout-test-'))
  const migrationsPath = path.join(cwd, 'migrations')
  await fs.mkdir(path.join(migrationsPath, '20260101000000_empty'), { recursive: true })
  await fs.mkdir(path.join(migrationsPath, '20260102000000_init'), { recursive: true })
  await fs.writeFile(
    path.join(migrationsPath, '20260102000000_init/migration.sql'),
    'CREATE TABLE Person (id INTEGER PRIMARY KEY);'
  )
  const database = await createTestDatabase(cwd)

  try {
    await database.reset(migrationsPath)
    assert.equal(await database.personCount(), 0)
  } finally {
    await database.cleanup()
    await fs.rm(cwd, { recursive: true })
  }
})
