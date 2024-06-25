import path from 'node:path'
import { createDatabase, } from '@prisma/internals'

import { withMigrate } from './lib/migrations'

export async function resetDatabase (dbUrl: string, prismaSchemaPath: string) {
  await createDatabase(dbUrl, path.dirname(prismaSchemaPath))
  await withMigrate(prismaSchemaPath, {
    config: {
      db: {
        url: dbUrl,
        shadowDatabaseUrl: ''
      }
    },
  }, async (m) => {
    await m.reset()
    await m.push(true)
  })
}
