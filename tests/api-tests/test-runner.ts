import fs from 'node:fs/promises'
import path from 'node:path'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'
import { readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import supertest from 'supertest'
import {
  getConfig,
  getDMMF,
  parseEnvValue,
} from '@prisma/internals'
import { getPrismaClient, objectEnumValues } from '@prisma/client/runtime/library'
import {
  externalToInternalDmmf
// @ts-expect-error
} from '@prisma/client/generator-build'

import {
  createSystem,
  createExpressServer,
  initConfig,
} from '@keystone-6/core/system'
import {
  type BaseKeystoneTypeInfo,
} from '@keystone-6/core/types'
import { generatePrismaAndGraphQLSchemas, type PrismaModule } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/artifacts'
import { pushPrismaSchemaToDatabase } from '../../packages/core/src/lib/migrations'
import { dbProvider, type FloatingConfig } from './utils'

// prisma checks
{
  const prismaEnginesDir = path.dirname(require.resolve('@prisma/engines/package.json'))
  const prismaEnginesDirEntries = readdirSync(prismaEnginesDir)
  const queryEngineFilename = prismaEnginesDirEntries.find(dir => dir.startsWith('libquery_engine'))
  if (!queryEngineFilename) throw new Error('Could not find query engine')
  process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(prismaEnginesDir, queryEngineFilename)
}

// conceptually similar to https://github.com/prisma/prisma/blob/main/packages/client/src/utils/getTestClient.ts
async function getTestPrismaModuleInner (prismaSchemaPath: string, datamodel: string) {
  const config = await getConfig({ datamodel, ignoreEnvVarErrors: true })
  const document = await getDMMF({ datamodel, previewFeatures: [] })
  return {
    PrismaClient: getPrismaClient({
      document: externalToInternalDmmf(document),
      generator: config.generators.find(g => parseEnvValue(g.provider) === 'prisma-client-js'),
      dirname: path.dirname(prismaSchemaPath),
      relativePath: '',

      clientVersion: '0.0.0',
      engineVersion: '0000000000000000000000000000000000000000',
      relativeEnvPaths: {},

      datasourceNames: config.datasources.map(d => d.name),
      activeProvider: config.datasources[0].activeProvider,
      dataProxy: false,
    }) as any,
    Prisma: {
      DbNull: objectEnumValues.instances.DbNull,
      JsonNull: objectEnumValues.instances.JsonNull,
    },
  }
}

const prismaModuleCache = new Map<string, PrismaModule>()
async function getTestPrismaModule (prismaSchemaPath: string, schema: string) {
  if (prismaModuleCache.has(schema)) return prismaModuleCache.get(schema)!
  return prismaModuleCache.set(schema, await getTestPrismaModuleInner(prismaSchemaPath, schema)).get(schema)!
}

const deferred: (() => Promise<void>)[] = []
afterAll(async () => {
  for (const f of deferred) {
    await f()
  }
})

export async function setupTestEnv <TypeInfo extends BaseKeystoneTypeInfo> ({
  config: config_,
  serve = false,
  identifier,
}: {
  config: FloatingConfig<TypeInfo>
  serve?: boolean
  identifier?: string
}) {
  const random = identifier ?? randomBytes(8).toString('base64url').toLowerCase()
  const tmp = join(tmpdir(), `ks6-tests-${random}`)
  await fs.mkdir(tmp)

  let dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new TypeError('Missing DATABASE_URL')

  if (dbUrl.startsWith('file:')) {
    dbUrl = `file:${join(tmp, 'test.db')}` // unique database files
  }

  if (dbUrl.startsWith('postgres:')) {
    const parsed = new URL(dbUrl)
    parsed.searchParams.set('schema', random) // unique schema names
    dbUrl = parsed.toString()
  }

  if (dbUrl.startsWith('mysql:')) {
    const parsed = new URL(dbUrl)
    parsed.pathname = random // unique database names
    dbUrl = parsed.toString()
  }

  const prismaSchemaPath = join(tmp, 'schema.prisma')
  const config = initConfig({
    ...config_,
    db: {
      provider: dbProvider,
      url: dbUrl,
      prismaClientPath: join(tmp, '.client'),
      prismaSchemaPath,
      ...config_.db,
    },
    types: {
      path: join(tmp, 'test-types.ts')
    },
    lists: config_.lists,
    graphql: {
      schemaPath: join(tmp, 'schema.graphql'),
      ...config_.graphql,
    },
    ui: {
      isDisabled: true,
      ...config_.ui,
    },
  })
  const { graphQLSchema, getKeystone } = createSystem(config)
  const artifacts = await generatePrismaAndGraphQLSchemas('', config, graphQLSchema)
  await pushPrismaSchemaToDatabase(dbUrl, undefined, artifacts.prisma, prismaSchemaPath, false, false)

  const {
    context,
    connect,
    disconnect
  } = getKeystone(await getTestPrismaModule(prismaSchemaPath, artifacts.prisma))

  if (serve) {
    const {
      expressServer: express,
      httpServer: http
    } = await createExpressServer(config, context.graphql.schema, context)

    function gqlSuper (...args: Parameters<typeof context.graphql.raw>) {
      return supertest(express)
        .post(config.graphql?.path ?? '/api/graphql')
        .send(...args)
        .set('Accept', 'application/json')
    }

    async function gql (...args: Parameters<typeof context.graphql.raw>) {
      const { body } = await gqlSuper(...args)
      return body
    }

    return {
      artifacts,
      connect,
      context,
      config,
      http,
      gql,
      gqlSuper,
      express,
      disconnect,
    } as const
  }

  async function gql (...args: Parameters<typeof context.graphql.raw>) {
    return await context.graphql.raw(...args)
  }

  return {
    artifacts,
    connect,
    context,
    config,
    http: null as any, // TODO: FIXME
    express: null as any, // TODO: FIXME
    gql,
    gqlSuper: null as any, // TODO: FIXME
    disconnect,
  } as const
}

export function setupTestRunner <TypeInfo extends BaseKeystoneTypeInfo> ({
  config: config_,
  serve = false,
  identifier,
}: {
  config: FloatingConfig<TypeInfo>
  serve?: boolean
  identifier?: string
}) {
  return (testFn: (args: Awaited<ReturnType<typeof setupTestEnv>>) => Promise<void>) => async () => {
    const result = await setupTestEnv({ config: config_, serve, identifier })

    await result.connect()
    try {
      return await testFn(result)
    } finally {
      await result.disconnect()
    }
  }
}

// WARNING: no support for onConnect
export function setupTestSuite <TypeInfo extends BaseKeystoneTypeInfo> ({
  config: config_,
  serve = false,
  identifier,
}: {
  config: FloatingConfig<TypeInfo>
  serve?: boolean
  identifier?: string
}) {
  const result = setupTestEnv({ config: config_, serve, identifier })
  const connectPromise = result.then((x) => {
    x.connect()
    return x
  })

  afterAll(async () => {
    await (await result).disconnect()
  })

  return async () => {
    return await connectPromise
  }
}
