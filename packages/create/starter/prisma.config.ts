import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'

if (existsSync('.env')) {
  loadEnvFile()
}

import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'schema.prisma',
  migrations: {
    path: 'migrations',
  },
  datasource: {
    url: 'file:./keystone.db',
  },
})
