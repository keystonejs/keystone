import path from 'path';
import fs from 'fs';
import { initConfig, createSystem, createExpressServer } from '@keystone-next/keystone';
import { pushPrismaSchemaToDatabase } from '@keystone-next/keystone/migrations';
import {
  getCommittedArtifacts,
  writeCommittedArtifacts,
  requirePrismaClient,
  generateNodeModulesArtifacts,
} from '@keystone-next/keystone/artifacts';
import type { KeystoneConfig, KeystoneContext } from '@keystone-next/types';
import { generateAdminUI } from '../../keystone/src/admin-ui/system';

export type TestArgs = {
  context: KeystoneContext;
};

export type TestEnv = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  expressServer: any;
  testArgs: TestArgs;
};

export async function setupAdminUITestEnv({
  config: _config,
}: {
  config: KeystoneConfig;
}): Promise<TestEnv> {
  // Force the UI to always be disabled.
  const config = initConfig({ ..._config });
  const { graphQLSchema, getKeystone, adminMeta } = createSystem(config);

  const artifacts = await getCommittedArtifacts(graphQLSchema, config);

  const artifactPath = path.resolve('.keystone/admin-ui');

  fs.mkdirSync(artifactPath, { recursive: true });

  await writeCommittedArtifacts(artifacts, artifactPath);
  await generateNodeModulesArtifacts(graphQLSchema, config, artifactPath);
  await pushPrismaSchemaToDatabase(
    config.db.url,
    artifacts.prisma,
    path.join(artifactPath, 'schema.prisma'),
    true // shouldDropDatabase
  );

  const { connect, disconnect, createContext } = getKeystone(requirePrismaClient(artifactPath));
  await generateAdminUI(
    config,
    graphQLSchema,
    adminMeta,
    path.join(artifactPath, `.keystone/admin`)
  );

  //   config, graphQLSchema, createContext, dev, projectAdminPath, isVerbose;
  const expressServer = await createExpressServer(
    config,
    graphQLSchema,
    createContext,
    true,
    path.join(artifactPath, '.keystone/admin'),
    true
  );

  return {
    connect,
    disconnect,
    expressServer,
    testArgs: { context: createContext() },
  };
}

// export function setupTestRunner({ config }: { config: KeystoneConfig }) {
//   return (testFn: (testArgs: TestArgs) => Promise<void>) => async () => {
//     // Reset the database to be empty for every test.
//     const { connect, disconnect, testArgs } = await setupTestEnv({ config });
//     await connect();
//     try {
//       return await testFn(testArgs);
//     } finally {
//       await disconnect();
//     }
//   };
// }
