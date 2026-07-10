import { randomBytes } from 'node:crypto'
import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import supertest from 'supertest'

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
