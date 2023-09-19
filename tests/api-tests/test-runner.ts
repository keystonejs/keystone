import path from 'path';
import fs from 'fs/promises';
import { readdirSync } from 'fs';
import os from 'os';
import {
  createDatabase,
  getConfig,
  getDMMF,
  parseEnvValue,
  printConfigWarnings,
} from '@prisma/internals';
import { getPrismaClient, objectEnumValues } from '@prisma/client/runtime/library';
// @ts-ignore
import { externalToInternalDmmf } from '@prisma/client/generator-build';
import { initConfig, createSystem } from '@keystone-6/core/system';
import type { BaseKeystoneTypeInfo, KeystoneConfig, KeystoneContext } from '@keystone-6/core/types';
import {
  getCommittedArtifacts,
  PrismaModule,
} from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/artifacts';
import prismaClientPackageJson from '@prisma/client/package.json';
import { runMigrateWithDbUrl, withMigrate } from '../../packages/core/src/lib/migrations';
import { dbProvider, dbUrl, SQLITE_DATABASE_FILENAME } from './utils';

export type TestArgs<TypeInfo extends BaseKeystoneTypeInfo> = {
  context: KeystoneContext<TypeInfo>;
  config: KeystoneConfig<TypeInfo>;
};

export type TestEnv<TypeInfo extends BaseKeystoneTypeInfo> = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  testArgs: TestArgs<TypeInfo>;
};

// you could call this a memory leak but it ends up being fine
// because we're only going to run this on a reasonably small number of schemas and then exit
const generatedPrismaModules = new Map<string, PrismaModule>();

// a modified version of https://github.com/prisma/prisma/blob/bbdf1c23653a77b0b5bf7d62efd243dcebea018b/packages/client/src/utils/getTestClient.ts
// yes, it's totally relying on implementation details
// we're okay with that because otherwise the performance of our tests is very bad
// TODO: we should find a better way to do this
function buildMapForRuntime<T extends { name: string }>(
  list: T[]
): Record<string, Omit<T, 'name'>> {
  const result: Record<string, Omit<T, 'name'>> = {};
  for (const { name, ...rest } of list) {
    result[name] = rest;
  }
  return result;
}

async function schemaToRuntimeDataModel(schema: string): Promise<any> {
  const { datamodel } = externalToInternalDmmf(
    await getDMMF({ datamodel: schema, previewFeatures: [] })
  );
  return {
    models: buildMapForRuntime(datamodel.models),
    enums: buildMapForRuntime(datamodel.enums),
    types: buildMapForRuntime(datamodel.types),
  };
}

const tmpdir = os.tmpdir();

const prismaSchemaDirectory = path.join(tmpdir, Math.random().toString(36).slice(2));

const prismaSchemaPath = path.join(prismaSchemaDirectory, 'schema.prisma');

const prismaEnginesDir = path.dirname(require.resolve('@prisma/engines/package.json'));

const prismaEnginesDirEntries = readdirSync(prismaEnginesDir);

const queryEngineFilename = prismaEnginesDirEntries.find(dir => dir.startsWith('libquery_engine'));

if (!queryEngineFilename) {
  throw new Error('Could not find query engine');
}

process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(prismaEnginesDir, queryEngineFilename);

async function getTestPrismaModule(schema: string): Promise<PrismaModule> {
  if (generatedPrismaModules.has(schema)) {
    return generatedPrismaModules.get(schema)!;
  }
  const config = await getConfig({ datamodel: schema, ignoreEnvVarErrors: true });
  printConfigWarnings(config.warnings);

  const generator = config.generators.find(g => parseEnvValue(g.provider) === 'prisma-client-js');

  const activeProvider = config.datasources[0].activeProvider;
  const options: Parameters<typeof getPrismaClient>[0] = {
    runtimeDataModel: await schemaToRuntimeDataModel(schema),
    generator,
    dirname: prismaSchemaDirectory,
    relativePath: '',
    clientVersion: prismaClientPackageJson.version,
    engineVersion: 'engine-test-version',
    relativeEnvPaths: {},
    datasourceNames: config.datasources.map(d => d.name),
    activeProvider,
    dataProxy: false,
  };
  const prismaModule: PrismaModule = {
    PrismaClient: getPrismaClient(options) as any,
    Prisma: {
      DbNull: objectEnumValues.instances.DbNull,
      JsonNull: objectEnumValues.instances.JsonNull,
    },
  };
  generatedPrismaModules.set(schema, prismaModule);
  return prismaModule;
}

afterAll(async () => {
  await fs.rm(prismaSchemaDirectory, { recursive: true, force: true });
});

let hasCreatedDatabase = false;

async function pushSchemaToDatabase(schema: string) {
  if (dbProvider === 'sqlite') {
    // touch the file (or truncate it), easiest way to start from scratch
    await fs.writeFile(path.join(prismaSchemaDirectory, SQLITE_DATABASE_FILENAME), '');
    await withMigrate(prismaSchemaPath, migrate =>
      runMigrateWithDbUrl(dbUrl, undefined, () =>
        migrate.engine.schemaPush({
          force: true,
          schema,
        })
      )
    );
    return;
  }
  let justCreatedDatabase = hasCreatedDatabase
    ? false
    : await createDatabase(dbUrl, prismaSchemaDirectory);
  await withMigrate(prismaSchemaPath, async migrate => {
    if (!justCreatedDatabase) {
      await runMigrateWithDbUrl(dbUrl, undefined, () => migrate.reset());
    }
    await runMigrateWithDbUrl(dbUrl, undefined, () =>
      migrate.engine.schemaPush({
        force: true,
        schema,
      })
    );
  });
  hasCreatedDatabase = true;
}

let lastWrittenSchema = '';

export async function setupTestEnv<TypeInfo extends BaseKeystoneTypeInfo>({
  config: _config,
}: {
  config: KeystoneConfig<TypeInfo>;
}): Promise<TestEnv<TypeInfo>> {
  // Force the UI to always be disabled.
  const config = initConfig({
    ..._config,
    ui: { ..._config.ui, isDisabled: true },
  });

  const { graphQLSchema, getKeystone } = createSystem(config);
  const artifacts = await getCommittedArtifacts(config, graphQLSchema);

  if (lastWrittenSchema !== artifacts.prisma) {
    if (!lastWrittenSchema) {
      await fs.mkdir(prismaSchemaDirectory, { recursive: true });
    }
    await fs.writeFile(prismaSchemaPath, artifacts.prisma);
  }
  await pushSchemaToDatabase(artifacts.prisma);

  const { connect, disconnect, context } = getKeystone(await getTestPrismaModule(artifacts.prisma));
  return {
    connect,
    disconnect,
    testArgs: {
      context,
      config,
    },
  };
}

export function setupTestRunner<TypeInfo extends BaseKeystoneTypeInfo>({
  config,
}: {
  config: KeystoneConfig<TypeInfo>;
}) {
  return (testFn: (testArgs: TestArgs<TypeInfo>) => Promise<void>) => async () => {
    // Reset the database to be empty for every test.
    const { connect, disconnect, testArgs } = await setupTestEnv({ config });
    await connect();

    try {
      return await testFn(testArgs);
    } finally {
      await disconnect();
    }
  };
}
