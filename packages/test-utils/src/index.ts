import path from 'path';
import crypto from 'crypto';
import { ServerResponse } from 'http';
import fs from 'fs';
import express from 'express';
// @ts-ignore
import supertest from 'supertest-light';
import { initConfig, createSystem, createExpressServer } from '@keystone-next/keystone';
import { pushPrismaSchemaToDatabase } from '@keystone-next/keystone/migrations';
import {
  getCommittedArtifacts,
  writeCommittedArtifacts,
  requirePrismaClient,
  generateNodeModulesArtifacts,
} from '@keystone-next/keystone/artifacts';
import type { DatabaseProvider, KeystoneConfig, KeystoneContext } from '@keystone-next/types';
import memoizeOne from 'memoize-one';

const _hashPrismaSchema = memoizeOne(prismaSchema =>
  crypto.createHash('md5').update(prismaSchema).digest('hex')
);

// Users should use testConfig({ ... }) in place of config({ ... }) when setting up
// their system for test. We explicitly don't allow them to control the 'db' or 'ui'
// properties as we're going to set that up as part of setupFromConfig.
export type TestKeystoneConfig = Omit<KeystoneConfig, 'db' | 'ui'>;
export const testConfig = (config: TestKeystoneConfig) => config;

const _alreadyGeneratedProjects = new Set<string>();

export async function setupFromConfig({
  provider,
  config: _config,
}: {
  provider: DatabaseProvider;
  config: TestKeystoneConfig;
}) {
  const enableLogging = false; // Turn this on if you need verbose debug info
  const config = initConfig({
    ..._config,
    db: { url: process.env.DATABASE_URL!, provider, enableLogging },
    ui: { isDisabled: true },
  });

  const { graphQLSchema, getKeystone } = createSystem(config);

  const prismaClient = await (async () => {
    const artifacts = await getCommittedArtifacts(graphQLSchema, config);
    const hash = _hashPrismaSchema(artifacts.prisma);
    if (provider === 'postgresql') {
      config.db.url = `${config.db.url}?schema=${hash.toString()}`;
    }
    const cwd = path.resolve('.api-test-prisma-clients', hash);
    if (!_alreadyGeneratedProjects.has(hash)) {
      _alreadyGeneratedProjects.add(hash);
      fs.mkdirSync(cwd, { recursive: true });
      await writeCommittedArtifacts(artifacts, cwd);
      await generateNodeModulesArtifacts(graphQLSchema, config, cwd);
    }
    await pushPrismaSchemaToDatabase(
      config.db.url,
      artifacts.prisma,
      path.join(cwd, 'schema.prisma'),
      true // shouldDropDatabase
    );
    return requirePrismaClient(cwd);
  })();

  const { connect, disconnect, createContext } = getKeystone(prismaClient);

  // (config, graphQLSchema, createContext, dev, projectAdminPath, isVerbose)
  const app = await createExpressServer(config, graphQLSchema, createContext, true, '', false);

  return { connect, disconnect, context: createContext().sudo(), app };
}

export function networkedGraphqlRequest({
  app,
  query,
  variables = undefined,
  headers = {},
  expectedStatusCode = 200,
  operationName,
}: {
  app: express.Application;
  query: string;
  variables?: Record<string, any>;
  headers?: Record<string, any>;
  expectedStatusCode?: number;
  operationName?: string;
}) {
  const request = supertest(app).set('Accept', 'application/json');

  Object.entries(headers).forEach(([key, value]) => request.set(key, value));

  return request
    .post('/api/graphql', { query, variables, operationName })
    .then((res: ServerResponse & { text: string }) => {
      expect(res.statusCode).toBe(expectedStatusCode);
      return { ...JSON.parse(res.text), res };
    })
    .catch((error: Error) => ({ errors: [error] }));
}

export type Setup = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  context: KeystoneContext;
  app: express.Application;
};

function _keystoneRunner(provider: DatabaseProvider, tearDownFunction: () => Promise<void> | void) {
  return function (
    setupKeystoneFn: (provider: DatabaseProvider) => Promise<Setup>,
    testFn?: (setup: Setup) => Promise<void>
  ) {
    return async function () {
      if (!testFn) {
        // If a testFn is not defined then we just need
        // to excute setup and tear down in isolation.
        try {
          await setupKeystoneFn(provider);
        } catch (error) {
          await tearDownFunction();
          throw error;
        }
        return;
      }
      const setup = await setupKeystoneFn(provider);
      const { connect, disconnect } = setup;
      await connect();

      try {
        await testFn(setup);
      } finally {
        await disconnect();
        await tearDownFunction();
      }
    };
  };
}

function _before(provider: DatabaseProvider) {
  return async function (setupKeystone: (provider: DatabaseProvider) => Promise<Setup>) {
    const setup = await setupKeystone(provider);
    await setup.connect();
    return setup;
  };
}

function _after(tearDownFunction: () => Promise<void> | void) {
  return async function (disconnect: () => Promise<void>) {
    await disconnect();
    await tearDownFunction();
  };
}

export function multiAdapterRunners(only = process.env.TEST_ADAPTER) {
  return (['postgresql', 'sqlite'] as const)
    .filter(provider => typeof only === 'undefined' || provider === only)
    .map(provider => ({
      provider,
      runner: _keystoneRunner(provider, () => {}),
      before: _before(provider),
      after: _after(() => {}),
    }));
}
