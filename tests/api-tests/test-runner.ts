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
import { runMigrateWithDbUrl, withMigrate } from '../../packages/core/src/lib/migrations'
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
}: {
  config: FloatingConfig<TypeInfo>
  serve?: boolean
}) {
  const random = randomBytes(8).toString('base64url')
  const tmp = join(tmpdir(), `ks6-tests-${random}`)
  await fs.mkdir(tmp)

  let dbUrl = process.env.DATABASE_URL ?? ''
  if (dbUrl.startsWith('file:')) dbUrl = `file:${join(tmp, 'test.db')}`
  // if (dbUrl.startsWith('postgres:'))
  // if (dbUrl.startsWith('mysql:'))

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

  async function reset () {
    await withMigrate(prismaSchemaPath, async migrate => {
      await runMigrateWithDbUrl(config.db.url, undefined, () => migrate.reset())

      return await runMigrateWithDbUrl(config.db.url, undefined, () => {
        return migrate.engine.schemaPush({
          force: true,
          schema: artifacts.prisma,
        })
      })
    })
  }

  await reset()
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
      reset
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
    reset
  } as const
}

export function setupTestRunner <TypeInfo extends BaseKeystoneTypeInfo> ({
  config: config_,
  serve = false,
}: {
  config: FloatingConfig<TypeInfo>
  serve?: boolean
}) {
  return (testFn: (args: Awaited<ReturnType<typeof setupTestEnv>>) => Promise<void>) => async () => {
    const result = await setupTestEnv({ config: config_, serve })

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
}: {
  config: FloatingConfig<TypeInfo>
  serve?: boolean
}) {
  const result = setupTestEnv({ config: config_, serve })

  afterAll(async () => {
    await (await result).disconnect()
  })

  return async () => {
    return await result
  }
}
