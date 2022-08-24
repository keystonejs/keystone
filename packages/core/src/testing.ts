import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import memoizeOne from 'memoize-one';
import type { BaseKeystoneTypeInfo, CreateContext, KeystoneConfig, KeystoneContext } from './types';
import {
  getCommittedArtifacts,
  writeCommittedArtifacts,
  requirePrismaClient,
  generateNodeModulesArtifacts,
} from './artifacts';
import { pushPrismaSchemaToDatabase } from './migrations';
import { initConfig, createSystem } from './system';

export type TestArgs<TypeInfo extends BaseKeystoneTypeInfo> = {
  context: KeystoneContext<TypeInfo>;
  createContext: CreateContext<KeystoneContext<TypeInfo>>;
  config: KeystoneConfig<TypeInfo>;
};

export type TestEnv<TypeInfo extends BaseKeystoneTypeInfo> = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  testArgs: TestArgs<TypeInfo>;
};

const _hashPrismaSchema = memoizeOne(prismaSchema =>
  crypto.createHash('md5').update(prismaSchema).digest('hex')
);
const _alreadyGeneratedProjects = new Set<string>();

export async function setupTestEnv<TypeInfo extends BaseKeystoneTypeInfo>({
  config: _config,
}: {
  config: KeystoneConfig<TypeInfo>;
}): Promise<TestEnv<TypeInfo>> {
  // Force the UI to always be disabled.
  const config = initConfig({ ..._config, ui: { ..._config.ui, isDisabled: true } });
  const { graphQLSchema, getKeystone } = createSystem(config);

  const artifacts = await getCommittedArtifacts(graphQLSchema, config);
  const hash = _hashPrismaSchema(artifacts.prisma);
  const artifactPath = path.resolve('.keystone', 'tests', hash);

  if (!_alreadyGeneratedProjects.has(hash)) {
    _alreadyGeneratedProjects.add(hash);
    fs.mkdirSync(artifactPath, { recursive: true });
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

  const { connect, disconnect, createContext } = getKeystone(requirePrismaClient(artifactPath));

  return {
    connect,
    disconnect,
    testArgs: {
      context: createContext(),
      createContext,
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
