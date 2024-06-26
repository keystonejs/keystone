import path from 'node:path'
import { createDatabase, } from '@prisma/internals'

import { withMigrate } from './lib/migrations'

export async function resetDatabase (url: string, prismaSchemaPath: string) {
  await createDatabase(url, path.dirname(prismaSchemaPath))
  await withMigrate(prismaSchemaPath, {
    config: {
      db: {
        url,
        shadowDatabaseUrl: ''
      }
    },
  }, async (m) => {
    await m.reset()
    await m.push(true)
  })
}
