import fs from 'node:fs/promises'
import path from 'node:path'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'
import { readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { type Express } from 'express'
import { type Server } from 'node:http'
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
  type KeystoneConfig,
  type KeystoneContext
} from '@keystone-6/core/types'
import { generatePrismaAndGraphQLSchemas, type PrismaModule } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/artifacts'
import { runMigrateWithDbUrl, withMigrate } from '../../packages/core/src/lib/migrations'
import { dbProvider, dbUrl, type FloatingConfig } from './utils'

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

export function setupTestRunner <TypeInfo extends BaseKeystoneTypeInfo> ({
  config: config_,
  serve = false,
}: {
  config: FloatingConfig<TypeInfo>
  serve?: boolean
}) {
  return (testFn: (args: {
    context: KeystoneContext<TypeInfo>
    config: KeystoneConfig<TypeInfo>
    express: Express | null
    http: Server | null
  }) => Promise<void>) => async () => {
    const tmp = join(tmpdir(), `ks6-tests-${randomBytes(8).toString('base64url')}`)
    await fs.mkdir(tmp)

    const prismaSchemaPath = join(tmp, 'schema.prisma')
    const config = initConfig({
      db: {
        provider: dbProvider,
        url: dbUrl === 'file:./test.db' ? `file:${join(tmp, 'test.db')}` : dbUrl,
        prismaClientPath: join(tmp, '.client'),
        prismaSchemaPath,
      },
      types: {
        path: join(tmp, 'test-types.ts')
      },
      lists: config_.lists,
      graphql: {
        schemaPath: join(tmp, 'schema.graphql'),
      },
      ui: {
        isDisabled: true,
      },
    })
    const { graphQLSchema, getKeystone } = createSystem(config)
    const artifacts = await generatePrismaAndGraphQLSchemas('', config, graphQLSchema)
    await withMigrate(prismaSchemaPath, async migrate => {
      await runMigrateWithDbUrl(config.db.url, undefined, () => migrate.reset())

      return await runMigrateWithDbUrl(config.db.url, undefined, () => {
        return migrate.engine.schemaPush({
          force: true,
          schema: artifacts.prisma,
        })
      })
    })

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

      await connect()
      try {
        return await testFn({ context, config, http, express })
      } finally {
        await disconnect()
      }
    }

    await connect()
    try {
      return await testFn({
        context,
        config,
        http: null,
        express: null,
      })
    } finally {
      await disconnect()
    }
  }
}
