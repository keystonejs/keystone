import fs from 'node:fs/promises'
import path from 'node:path'

export async function applyMigrations(
  migrationsDirectory: string,
  execute: (migration: string) => Promise<void> | void
) {
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
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        continue
      }
      throw new Error(`Could not read migration ${migrationPath}`, { cause: error })
    }
    try {
      await execute(migration)
    } catch (error) {
      throw new Error(`Failed to apply migration ${migrationPath}`, { cause: error })
    }
  }
}
