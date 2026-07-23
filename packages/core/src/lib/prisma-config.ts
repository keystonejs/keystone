import fs from 'node:fs/promises'
import path from 'node:path'

const configFilename = 'prisma.config.ts'

const initialPrismaConfig = `import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'schema.prisma',
  migrations: {
    path: 'migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
`

async function fileExists(filename: string) {
  try {
    await fs.stat(filename)
    return true
  } catch (error: any) {
    if (error.code === 'ENOENT') return false
    throw error
  }
}

export async function ensurePrismaConfig(cwd: string, frozen: boolean) {
  const configPath = path.join(cwd, configFilename)
  if (await fileExists(configPath)) return configPath
  if (frozen) {
    throw new Error(`Missing ${configFilename}. Run Keystone without --frozen to create it.`)
  }
  await fs.writeFile(configPath, initialPrismaConfig, { flag: 'wx' })
  return configPath
}
