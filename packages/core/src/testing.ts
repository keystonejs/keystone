import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import memoizeOne from 'memoize-one';
import type { CreateContext, KeystoneConfig, KeystoneContext } from './types';
import {
  getCommittedArtifacts,
  writeCommittedArtifacts,
  requirePrismaClient,
  generateNodeModulesArtifacts,
} from './artifacts';
import { pushPrismaSchemaToDatabase } from './migrations';
import { initConfig, createSystem } from './system';

export type TestArgs<Context extends KeystoneContext = KeystoneContext> = {
  context: Context;
  createContext: CreateContext;
  config: KeystoneConfig;
};

export type TestEnv<Context extends KeystoneContext = KeystoneContext> = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  testArgs: TestArgs<Context>;
};

const _hashPrismaSchema = memoizeOne(prismaSchema =>
  crypto.createHash('md5').update(prismaSchema).digest('hex')
);
const _alreadyGeneratedProjects = new Set<string>();
export async function setupTestEnv<Context extends KeystoneContext>({
  config: _config,
}: {
  config: KeystoneConfig;
}): Promise<TestEnv<Context>> {
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
      context: createContext() as Context,
      createContext,
      config,
    },
  };
}

export function setupTestRunner<Context extends KeystoneContext>({
  config,
}: {
  config: KeystoneConfig;
}) {
  return (testFn: (testArgs: TestArgs<Context>) => Promise<void>) => async () => {
    // Reset the database to be empty for every test.
    const { connect, disconnect, testArgs } = await setupTestEnv<Context>({ config });
    await connect();

    try {
      return await testFn(testArgs);
    } finally {
      await disconnect();
    }
  };
}
