import fs from 'node:fs/promises'
import path from 'node:path'

import Database, { type Options } from 'better-sqlite3'

import { applyMigrations } from './migrations.ts'

export async function resetDatabase(
  { filename, ...options }: Options & { filename: string },
  migrationsDirectory: string
) {
  if (filename !== ':memory:') {
    await fs.mkdir(path.dirname(path.resolve(filename)), { recursive: true })
    await Promise.all(
      [filename, `${filename}-shm`, `${filename}-wal`].map(filename =>
        fs.rm(filename, { force: true })
      )
    )
  }

  const database = new Database(filename, options)
  try {
    await applyMigrations(migrationsDirectory, migration => {
      database.exec(migration)
    })
  } finally {
    database.close()
  }
}
