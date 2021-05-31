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
import type { KeystoneConfig, KeystoneContext } from '@keystone-next/types';
import memoizeOne from 'memoize-one';

export type ProviderName = 'postgresql' | 'sqlite';

const hashPrismaSchema = memoizeOne(prismaSchema =>
  crypto.createHash('md5').update(prismaSchema).digest('hex')
);

// Users should use testConfig({ ... }) in place of config({ ... }) when setting up
// their system for test. We explicitly don't allow them to control the 'db' or 'ui'
// properties as we're going to set that up as part of setupFromConfig.
type TestKeystoneConfig = Omit<KeystoneConfig, 'db' | 'ui'>;
export const testConfig = (config: TestKeystoneConfig) => config;

const alreadyGeneratedProjects = new Set<string>();

async function setupFromConfig({
  provider,
  config: _config,
}: {
  provider: ProviderName;
  config: TestKeystoneConfig;
}) {
  const config = initConfig({
    ..._config,
    db: {
      url: process.env.DATABASE_URL!,
      provider,
      enableLogging: false, // Turn this on if you need verbose debug info
    },
    ui: { isDisabled: true },
  });

  const prismaClient = await (async () => {
    const { graphQLSchema } = createSystem(config);
    const artifacts = await getCommittedArtifacts(graphQLSchema, config);
    const hash = hashPrismaSchema(artifacts.prisma);
    if (provider === 'postgresql') {
      config.db.url = `${config.db.url}?schema=${hash.toString()}`;
    }
    const cwd = path.resolve('.api-test-prisma-clients', hash);
    if (!alreadyGeneratedProjects.has(hash)) {
      alreadyGeneratedProjects.add(hash);
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

  const { keystone, createContext, graphQLSchema } = createSystem(config, prismaClient);

  const app = await createExpressServer(config, graphQLSchema, createContext, true, '', false);

  return {
    connect: () => keystone.connect(),
    disconnect: () => keystone.disconnect(),
    context: createContext().sudo(),
    app,
  };
}

function networkedGraphqlRequest({
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
    .catch((error: Error) => ({
      errors: [error],
    }));
}

type Setup = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  context: KeystoneContext;
  app: express.Application;
};

function _keystoneRunner(provider: ProviderName, tearDownFunction: () => Promise<void> | void) {
  return function (
    setupKeystoneFn: (provider: ProviderName) => Promise<Setup>,
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

function _before(provider: ProviderName) {
  return async function (setupKeystone: (provider: ProviderName) => Promise<Setup>) {
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

function multiAdapterRunners(only = process.env.TEST_ADAPTER) {
  return (['postgresql', 'sqlite'] as const)
    .filter(provider => typeof only === 'undefined' || provider === only)
    .map(provider => ({
      provider,
      runner: _keystoneRunner(provider, () => {}),
      before: _before(provider),
      after: _after(() => {}),
    }));
}

export { setupFromConfig, multiAdapterRunners, networkedGraphqlRequest };
