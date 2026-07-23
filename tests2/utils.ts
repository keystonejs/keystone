import { randomBytes } from 'node:crypto'
import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { after } from 'node:test'

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaPg } from '@prisma/adapter-pg'

import { config } from '@keystone-6/core'
import {
  createSystem,
  generateArtifacts,
  generatePrismaClient,
  pushPrismaSchema,
} from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/artifacts'

import type {
  BaseKeystoneTypeInfo,
  KeystoneConfig,
  KeystoneConfigPre,
} from '@keystone-6/core/types'
import { createRequire } from 'node:module'

export const dbProvider = (function () {
  const dbUrl = process.env.DATABASE_URL ?? ''
  if (dbUrl.startsWith('file:')) return 'sqlite' as const
  if (dbUrl.startsWith('postgres:')) return 'postgresql' as const
  if (dbUrl.startsWith('mysql:')) return 'mysql' as const
  throw new Error(`Unsupported environment DATABASE_URL="${dbUrl}"`)
})()

function prismaClientOptions(url: string) {
  if (dbProvider === 'sqlite') return { adapter: new PrismaBetterSqlite3({ url }) }
  if (dbProvider === 'postgresql') {
    const parsed = new URL(url)
    return {
      adapter: new PrismaPg(
        { connectionString: url },
        { schema: parsed.searchParams.get('schema') ?? undefined }
      ),
    }
  }
  return { adapter: new PrismaMariaDb(url) }
}

type FloatingConfig<TypeInfo extends BaseKeystoneTypeInfo> = Omit<
  KeystoneConfigPre<TypeInfo>,
  'db'
> & {
  db?: Omit<KeystoneConfigPre<TypeInfo>['db'], 'provider' | 'prismaClientOptions'>
}

export async function setupTestEnv<TypeInfo extends BaseKeystoneTypeInfo>(
  config_: FloatingConfig<TypeInfo>,
  identifier?: string,
  wrap: (config: KeystoneConfig) => KeystoneConfig = x => x
) {
  const random = identifier ?? randomBytes(10).toString('base64url').toLowerCase()
  const cwd = join(tmpdir(), `ks6-tests-${random}`)
  try {
    await fs.mkdir(cwd)
  } catch (err) {
    if ((err as any).code !== 'EEXIST') throw err
    await fs.rm(cwd, { recursive: true })
    await fs.mkdir(cwd)
  }
  await fs.mkdir(join(cwd, 'node_modules/@prisma'), { recursive: true })
  const require = createRequire(import.meta.url)
  await fs.symlink(
    join(require.resolve('prisma/package.json'), '..'),
    join(cwd, 'node_modules/prisma'),
    'dir'
  )
  await fs.symlink(
    join(require.resolve('@prisma/client/package.json'), '..'),
    join(cwd, 'node_modules/@prisma/client'),
    'dir'
  )

  let dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new TypeError('Missing DATABASE_URL')

  if (dbUrl.startsWith('file:')) {
    const dbPath = join(cwd, 'test.db')
    await fs.writeFile(dbPath, '')
    dbUrl = `file:${dbPath}` // unique database files
  }

  if (dbUrl.startsWith('postgres:')) {
    const parsed = new URL(dbUrl)
    parsed.searchParams.set('schema', random.replace(/^pg_/g, 'p__')) // unique schema names, ^pg_ is reserved by postgres
    dbUrl = parsed.toString()
  }

  if (dbUrl.startsWith('mysql:')) {
    const parsed = new URL(dbUrl)
    parsed.pathname = random // unique database names
    dbUrl = parsed.toString()
  }

  const schemaPath = join(cwd, 'test-schema.prisma')
  await fs.writeFile(
    join(cwd, 'prisma.config.ts'),
    `import { defineConfig } from 'prisma/config'\nexport default defineConfig({ schema: 'test-schema.prisma', datasource: { url: ${JSON.stringify(dbUrl)} } })\n`
  )
  const system = createSystem(
    wrap(
      config({
        ...config_,
        db: {
          provider: dbProvider,
          prismaClientOptions: () => prismaClientOptions(dbUrl),
          prismaClientPath: '.prisma',
          prismaSchemaPath: 'test-schema.prisma',
          ...config_.db,
        },
        types: {
          path: 'test-types.ts',
        },
        lists: config_.lists,
        graphql: {
          schemaPath: 'test-schema.graphql',
          ...config_.graphql,
        },
        ui: {
          isDisabled: true,
          ...config_.ui,
        },
      })
    )
  )

  const artifacts = await generateArtifacts(cwd, system)
  await generatePrismaClient(cwd, system, 'capture')
  await pushPrismaSchema(cwd, schemaPath, 'capture')
  const prismaModule = await import(
    `${pathToFileURL(join(cwd, '.prisma/client.ts')).href}?${random}`
  )
  const { context, connect, disconnect } = system.getKeystone(prismaModule)

  if (dbProvider === 'sqlite') {
    await connect()
    await context.prisma.$queryRaw`PRAGMA journal_mode=WAL;`
    await disconnect()
  }

  return {
    artifacts,
    connect,
    context,
    config: system.config,
    disconnect,
  } as const
}

export function setupTestSuite<TypeInfo extends BaseKeystoneTypeInfo>({
  config: config_,
  identifier,
  wrap,
}: {
  config: FloatingConfig<TypeInfo>
  serve?: boolean
  identifier?: string
  wrap?: (config: KeystoneConfig) => KeystoneConfig
}) {
  const result = setupTestEnv(config_, identifier, wrap)

  after(async () => {
    await (await result).disconnect()
  })

  return async () => {
    await (await result).connect()
    return result
  }
}
