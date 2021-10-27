import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import express from 'express';
import supertest, { Test } from 'supertest';
import memoizeOne from 'memoize-one';
import type { KeystoneConfig, KeystoneContext } from './types';
import {
  getCommittedArtifacts,
  writeCommittedArtifacts,
  requirePrismaClient,
  generateNodeModulesArtifacts,
} from './artifacts';
import { pushPrismaSchemaToDatabase } from './migrations';
import { initConfig, createSystem, createExpressServer } from './system';

export type GraphQLRequest = (arg: {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}) => Test;

export type TestArgs = {
  context: KeystoneContext;
  graphQLRequest: GraphQLRequest;
  app: express.Express;
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
    artifacts.prisma,
    path.join(artifactPath, 'schema.prisma'),
    true // shouldDropDatabase
  );

  const { connect, disconnect, createContext } = getKeystone(requirePrismaClient(artifactPath));

  // (config, graphQLSchema, createContext, dev, projectAdminPath, isVerbose)
  const app = await createExpressServer(config, graphQLSchema, createContext);

  const graphQLRequest: GraphQLRequest = ({ query, variables = undefined, operationName }) =>
    supertest(app)
      .post(config.graphql?.path || '/api/graphql')
      .send({ query, variables, operationName })
      .set('Accept', 'application/json');

  return { connect, disconnect, testArgs: { context: createContext(), graphQLRequest, app } };
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
