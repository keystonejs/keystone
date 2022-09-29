import path from 'path';
import { createHash } from 'crypto';
import { mkdirSync } from 'fs';
import type { BaseKeystoneTypeInfo, KeystoneConfig, KeystoneContext } from './types';
import {
  getCommittedArtifacts,
  writeCommittedArtifacts,
  requirePrismaClient,
  generateNodeModulesArtifacts,
} from './artifacts';
import { pushPrismaSchemaToDatabase } from './migrations';
import { initConfig, createSystem } from './system';
import { getContext } from './context';

export type TestArgs<TypeInfo extends BaseKeystoneTypeInfo> = {
  context: KeystoneContext<TypeInfo>;
  config: KeystoneConfig<TypeInfo>;
};

export type TestEnv<TypeInfo extends BaseKeystoneTypeInfo> = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  testArgs: TestArgs<TypeInfo>;
};

function sha1(text: string) {
  return createHash('sha1').update(text).digest('hex');
}

const _alreadyGeneratedProjects = new Set<string>();
async function generateSchemas<TypeInfo extends BaseKeystoneTypeInfo>(
  _config: KeystoneConfig<TypeInfo>
) {
  // Force the UI to always be disabled.
  const config = initConfig({ ..._config, ui: { ..._config.ui, isDisabled: true } });
  const { graphQLSchema } = createSystem(config);
  const artifacts = await getCommittedArtifacts(graphQLSchema, config);
  const hash = sha1(artifacts.prisma);
  const artifactPath = path.resolve('.keystone', 'tests', hash);

  if (!_alreadyGeneratedProjects.has(hash)) {
    _alreadyGeneratedProjects.add(hash);
    mkdirSync(artifactPath, { recursive: true });
    await writeCommittedArtifacts(artifacts, artifactPath);
    await generateNodeModulesArtifacts(graphQLSchema, config, artifactPath);
  }

  await pushPrismaSchemaToDatabase(
    config.db.url,
    config.db.shadowDatabaseUrl,
    artifacts.prisma,
    path.join(artifactPath, 'schema.prisma'),
    true // shouldDropDatabase
  );

  return artifactPath;
}

export async function setupTestEnv<TypeInfo extends BaseKeystoneTypeInfo>({
  config,
}: {
  config: KeystoneConfig<TypeInfo>;
}): Promise<TestEnv<TypeInfo>> {
  const artifactPath = await generateSchemas<TypeInfo>(config);
  const { connect, context, disconnect } = getContext(config, requirePrismaClient(artifactPath));

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
