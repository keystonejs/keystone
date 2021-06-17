import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import supertest, { Test } from 'supertest';
import memoizeOne from 'memoize-one';
import { initConfig, createSystem, createExpressServer } from '@keystone-next/keystone';
import { pushPrismaSchemaToDatabase } from '@keystone-next/keystone/migrations';
import {
  getCommittedArtifacts,
  writeCommittedArtifacts,
  requirePrismaClient,
  generateNodeModulesArtifacts,
} from '@keystone-next/keystone/artifacts';
import type { KeystoneConfig, KeystoneContext } from '@keystone-next/types';

export type GraphQLRequest = (arg: {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}) => Test;

export type TestArgs = {
  context: KeystoneContext;
  config: KeystoneConfig;
  graphQLRequest: GraphQLRequest;
};

export type TestEnv = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  testArgs: TestArgs;
};

const _hashPrismaSchema = memoizeOne(prismaSchema =>
  crypto.createHash('md5').update(prismaSchema).digest('hex')
);
const _alreadyGeneratedProjects = new Set<string>();
export async function setupTestEnv({
  config: _config,
}: {
  config: KeystoneConfig;
}): Promise<TestEnv> {
  // Force the UI to always be disabled, re-spread the db option as we're going to
  // modify it below.
  const config = initConfig({ ..._config, db: { ..._config.db }, ui: { isDisabled: true } });
  const { graphQLSchema, getKeystone } = createSystem(config);

  const isolateRuns = config.testing?.isolateRuns || false;
  let artifactPath = path.resolve(config.testing?.artifactPath || '.keystone/tests');

  const artifacts = await getCommittedArtifacts(graphQLSchema, config);
  const hash = _hashPrismaSchema(artifacts.prisma);

  if (isolateRuns) {
    if (config.db.provider === 'postgresql') {
      config.db.url = `${config.db.url}?schema=keystone-test-${hash.toString()}`;
    }
    artifactPath = path.resolve(artifactPath, hash);
  }

  if (!_alreadyGeneratedProjects.has(hash)) {
    _alreadyGeneratedProjects.add(hash);
    fs.mkdirSync(artifactPath, { recursive: true });
    await writeCommittedArtifacts(artifacts, artifactPath);
    await generateNodeModulesArtifacts(graphQLSchema, config, artifactPath);
  }
  await pushPrismaSchemaToDatabase(
    config.db.url,
    artifacts.prisma,
    path.join(artifactPath, 'schema.prisma'),
    true // shouldDropDatabase
  );

  const { connect, disconnect, createContext } = getKeystone(requirePrismaClient(artifactPath));

  // (config, graphQLSchema, createContext, dev, projectAdminPath, isVerbose)
  const app = await createExpressServer(config, graphQLSchema, createContext, true, '', false);

  const graphQLRequest: GraphQLRequest = ({ query, variables = undefined, operationName }) =>
    supertest(app)
      .post('/api/graphql')
      .send({ query, variables, operationName })
      .set('Accept', 'application/json');

  const testArgs = { context: createContext(), config, graphQLRequest };
  return { connect, disconnect, testArgs };
}

export function setupTestRunner({ config }: { config: KeystoneConfig }) {
  return (testFn: (testArgs: TestArgs) => Promise<void>) => async () => {
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
