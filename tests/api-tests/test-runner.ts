import { randomBytes } from 'node:crypto'
import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import supertest from 'supertest'
import type { SqlDriverAdapterFactory } from '@prisma/client/runtime/client'

import { config } from '@keystone-6/core'
import {
  createExpressServer,
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

import { dbProvider, prismaClientOptions } from './utils'

type FloatingConfig<TypeInfo extends BaseKeystoneTypeInfo> = Omit<
  KeystoneConfigPre<TypeInfo>,
  'db'
> & {
  db?: Omit<KeystoneConfigPre<TypeInfo>['db'], 'provider' | 'prismaClientOptions'> & {
    prismaClientOptions?: (url: string) => unknown
  }
}

export async function setupTestEnv<TypeInfo extends BaseKeystoneTypeInfo>(
  config_: FloatingConfig<TypeInfo>,
  serve: boolean = false,
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
  const { prismaClientOptions: createPrismaClientOptions, ...dbConfig } = config_.db ?? {}
  const system = createSystem(
    wrap(
      config({
        ...config_,
        db: {
          provider: dbProvider,
          prismaClientPath: '.prisma',
          prismaSchemaPath: 'test-schema.prisma',
          ...dbConfig,
          prismaClientOptions: () =>
            createPrismaClientOptions?.(dbUrl) ?? prismaClientOptions(dbUrl),
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
  const createDatabaseAdapter = () => prismaClientOptions(dbUrl).adapter as SqlDriverAdapterFactory

  if (dbProvider === 'sqlite') {
    await connect()
    await context.prisma.$queryRaw`PRAGMA journal_mode=WAL;`
    await disconnect()
  }

  if (serve) {
    const { expressServer: express, httpServer: http } = await createExpressServer(
      system.config,
      context
    )

    function gqlSuper(
      args: Parameters<typeof context.graphql.raw>[0] & { operationName?: string }
    ) {
      return supertest(express)
        .post(system.config.graphql?.path ?? '/api/graphql')
        .send(args)
        .set('Accept', 'application/json')
    }

    async function gql(...args: Parameters<typeof gqlSuper>) {
      const { body } = await gqlSuper(...args)
      return body
    }

    return {
      artifacts,
      createDatabaseAdapter,
      connect,
      context,
      config: system.config,
      http,
      gql,
      gqlSuper,
      express,
      disconnect,
    } as const
  }

  async function gql(...args: Parameters<typeof context.graphql.raw>) {
    return await context.graphql.raw(...args)
  }

  return {
    artifacts,
    createDatabaseAdapter,
    connect,
    context,
    config: system.config,
    // the non null assertions are wrong but better than casting as any or similar
    // and it doesn't really matter much since it's in tests so if it fails
    // the test fails and it's fine
    http: null!,
    express: null!,
    gql,
    gqlSuper: null!,
    disconnect,
  } as const
}

export function setupTestRunner<TypeInfo extends BaseKeystoneTypeInfo>({
  config: config_,
  serve = false,
  identifier,
  wrap,
}: {
  config: FloatingConfig<TypeInfo>
  serve?: boolean
  identifier?: string
  wrap?: (config: KeystoneConfig) => KeystoneConfig
}) {
  return (testFn: (args: Awaited<ReturnType<typeof setupTestEnv>>) => Promise<void>) =>
    async () => {
      const result = await setupTestEnv(config_, serve, identifier, wrap)

      await result.connect()
      try {
        return await testFn(result)
      } finally {
        await result.disconnect()
      }
    }
}

function quoteIdentifier(identifier: string, quote: '`' | '"') {
  return quote + identifier.replaceAll(quote, quote + quote) + quote
}

type SqlDriverAdapter = Awaited<ReturnType<SqlDriverAdapterFactory['connect']>>
type SqlQueryable = Pick<SqlDriverAdapter, 'executeRaw' | 'queryRaw'>

const adapterQuery = (sql: string) => ({ sql, args: [], argTypes: [] })

async function adapterRows(adapter: SqlQueryable, sql: string) {
  const result = await adapter.queryRaw(adapterQuery(sql))
  return result.rows.map(row =>
    Object.fromEntries(result.columnNames.map((column, index) => [column, row[index]]))
  ) as Record<string, unknown>[]
}

async function clearDatabase(createAdapter: () => SqlDriverAdapterFactory) {
  const adapter = await createAdapter().connect()
  try {
    if (adapter.provider === 'sqlite') {
      await adapter.executeScript('PRAGMA foreign_keys = OFF')
      try {
        const tables = await adapterRows(
          adapter,
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
        )
        for (const { name } of tables) {
          await adapter.executeScript(`DELETE FROM ${quoteIdentifier(String(name), '"')}`)
        }
        const sequences = await adapterRows(
          adapter,
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sqlite_sequence'"
        )
        if (sequences.length) await adapter.executeScript('DELETE FROM sqlite_sequence')
      } finally {
        await adapter.executeScript('PRAGMA foreign_keys = ON')
      }
      return
    }

    if (adapter.provider === 'postgres') {
      const tables = await adapterRows(
        adapter,
        "SELECT tablename AS name FROM pg_tables WHERE schemaname = current_schema() AND tablename <> '_prisma_migrations'"
      )
      if (tables.length) {
        await adapter.executeScript(
          `TRUNCATE TABLE ${tables.map(({ name }) => quoteIdentifier(String(name), '"')).join(', ')} RESTART IDENTITY CASCADE`
        )
      }
      return
    }

    const transaction = await adapter.startTransaction()
    let autoIncrementTables: string[]
    try {
      await transaction.executeRaw(adapterQuery('SET FOREIGN_KEY_CHECKS = 0'))
      const tables = await adapterRows(
        transaction,
        "SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME <> '_prisma_migrations'"
      )
      autoIncrementTables = (
        await adapterRows(
          transaction,
          "SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' AND AUTO_INCREMENT IS NOT NULL"
        )
      ).map(({ name }) => String(name))
      for (const { name } of tables) {
        await transaction.executeRaw(
          adapterQuery(`DELETE FROM ${quoteIdentifier(String(name), '`')}`)
        )
      }
      await transaction.executeRaw(adapterQuery('SET FOREIGN_KEY_CHECKS = 1'))
    } catch (error) {
      await transaction
        .executeRaw(adapterQuery('SET FOREIGN_KEY_CHECKS = 1'))
        .catch(() => undefined)
      await transaction.rollback()
      throw error
    }
    await transaction.commit()
    for (const name of autoIncrementTables) {
      await adapter.executeRaw(
        adapterQuery(`ALTER TABLE ${quoteIdentifier(name, '`')} AUTO_INCREMENT = 1`)
      )
    }
  } finally {
    await adapter.dispose()
  }
}

/**
 * Like setupTestRunner, but generates the artifacts and Prisma client once for all tests using
 * this runner. The database is emptied before each test to retain setupTestRunner's isolation.
 */
export function setupTestSuiteRunner<TypeInfo extends BaseKeystoneTypeInfo>(
  args: Parameters<typeof setupTestRunner<TypeInfo>>[0]
) {
  let result: ReturnType<typeof setupTestEnv<TypeInfo>> | undefined
  const getResult = () =>
    (result ??= setupTestEnv(args.config, args.serve, args.identifier, args.wrap))

  return (testFn: (args: Awaited<ReturnType<typeof setupTestEnv<TypeInfo>>>) => Promise<void>) =>
    async () => {
      const value = await getResult()
      await value.connect()
      try {
        await clearDatabase(value.createDatabaseAdapter)
        return await testFn(value)
      } finally {
        await value.disconnect()
      }
    }
}

// WARNING: no support for onConnect
export function setupTestSuite<TypeInfo extends BaseKeystoneTypeInfo>({
  config: config_,
  serve = false,
  identifier,
  wrap,
}: {
  config: FloatingConfig<TypeInfo>
  serve?: boolean
  identifier?: string
  wrap?: (config: KeystoneConfig) => KeystoneConfig
}) {
  const result = setupTestEnv(config_, serve, identifier, wrap)

  afterAll(async () => {
    await (await result).disconnect()
  })

  return async () => {
    await (await result).connect()
    return result
  }
}
