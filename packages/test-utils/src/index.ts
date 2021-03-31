import path from 'path';
import crypto from 'crypto';
import { ServerResponse } from 'http';
import fs from 'fs';
import express from 'express';
// @ts-ignore
import supertest from 'supertest-light';
// @ts-ignore
import { Keystone } from '@keystone-next/keystone-legacy';
import { initConfig, createSystem, createExpressServer } from '@keystone-next/keystone';
import { runPrototypeMigrations } from '@keystone-next/adapter-prisma-legacy';
import {
  getCommittedArtifacts,
  writeCommittedArtifacts,
  requirePrismaClient,
  generateNodeModulesArtifacts,
} from '@keystone-next/keystone/artifacts';
import type { KeystoneConfig, BaseKeystone, KeystoneContext } from '@keystone-next/types';
import memoizeOne from 'memoize-one';

export type AdapterName = 'prisma_postgresql' | 'prisma_sqlite';

const hashPrismaSchema = memoizeOne(prismaSchema =>
  crypto.createHash('md5').update(prismaSchema).digest('hex')
);

const argGenerator = {
  prisma_postgresql: () => ({
    url: process.env.DATABASE_URL!,
    provider: 'postgresql',
    getDbSchemaName: () => null as any,
    // Turn this on if you need verbose debug info
    enableLogging: false,
  }),
  prisma_sqlite: () => ({
    url: process.env.DATABASE_URL!,
    provider: 'sqlite',
    // Turn this on if you need verbose debug info
    enableLogging: false,
  }),
};

// Users should use testConfig({ ... }) in place of config({ ... }) when setting up
// their system for test. We explicitly don't allow them to control the 'db' or 'ui'
// properties as we're going to set that up as part of setupFromConfig.
type TestKeystoneConfig = Omit<KeystoneConfig, 'db' | 'ui'>;
export const testConfig = (config: TestKeystoneConfig) => config;

const alreadyGeneratedProjects = new Set<string>();

async function setupFromConfig({
  adapterName,
  config: _config,
}: {
  adapterName: AdapterName;
  config: TestKeystoneConfig;
}) {
  let db: KeystoneConfig['db'];
  if (adapterName === 'prisma_postgresql') {
    const adapterArgs = await argGenerator[adapterName]();
    db = { adapter: adapterName, ...adapterArgs };
  } else if (adapterName === 'prisma_sqlite') {
    const adapterArgs = await argGenerator[adapterName]();
    db = { adapter: adapterName, ...adapterArgs };
    _config = { ..._config, experimental: { prismaSqlite: true } };
  }

  const config = initConfig({ ..._config, db: db!, ui: { isDisabled: true } });

  const prismaClient = await (async () => {
    const { keystone, graphQLSchema } = createSystem(config);
    const artifacts = await getCommittedArtifacts(graphQLSchema, keystone);
    const hash = hashPrismaSchema(artifacts.prisma);
    if (adapterName === 'prisma_postgresql') {
      config.db.url = `${config.db.url}?schema=${hash.toString()}`;
    }
    const cwd = path.resolve('.api-test-prisma-clients', hash);
    if (!alreadyGeneratedProjects.has(hash)) {
      alreadyGeneratedProjects.add(hash);
      fs.mkdirSync(cwd, { recursive: true });
      await writeCommittedArtifacts(artifacts, cwd);
      await generateNodeModulesArtifacts(graphQLSchema, keystone, config, cwd);
    }
    await runPrototypeMigrations(
      config.db.url,
      artifacts.prisma,
      path.join(cwd, 'schema.prisma'),
      true
    );
    return requirePrismaClient(cwd);
  })();

  const { keystone, createContext, graphQLSchema } = createSystem(config, prismaClient);

  const app = await createExpressServer(config, graphQLSchema, createContext, true, '', false);

  return { keystone, context: createContext().sudo(), app };
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

type Setup = { keystone: BaseKeystone; context: KeystoneContext; app: express.Application };

function _keystoneRunner(adapterName: AdapterName, tearDownFunction: () => Promise<void> | void) {
  return function (
    setupKeystoneFn: (adaptername: AdapterName) => Promise<Setup>,
    testFn?: (setup: Setup) => Promise<void>
  ) {
    return async function () {
      if (!testFn) {
        // If a testFn is not defined then we just need
        // to excute setup and tear down in isolation.
        try {
          await setupKeystoneFn(adapterName);
        } catch (error) {
          await tearDownFunction();
          throw error;
        }
        return;
      }
      const setup = await setupKeystoneFn(adapterName);
      const { keystone } = setup;
      await keystone.connect();

      try {
        await testFn(setup);
      } finally {
        await keystone.disconnect();
        await tearDownFunction();
      }
    };
  };
}

function _before(adapterName: AdapterName) {
  return async function (
    setupKeystone: (
      adapterName: AdapterName
    ) => Promise<{ keystone: Keystone<string>; app: any; context: any }>
  ) {
    const { keystone, context, app } = await setupKeystone(adapterName);
    await keystone.connect();
    return { keystone, context, app };
  };
}

function _after(tearDownFunction: () => Promise<void> | void) {
  return async function (keystone: Keystone<string>) {
    await keystone.disconnect();
    await tearDownFunction();
  };
}

function multiAdapterRunners(only = process.env.TEST_ADAPTER) {
  return [
    {
      runner: _keystoneRunner('prisma_postgresql', () => {}),
      adapterName: 'prisma_postgresql' as const,
      before: _before('prisma_postgresql'),
      after: _after(() => {}),
    },
    {
      runner: _keystoneRunner('prisma_sqlite', () => {}),
      adapterName: 'prisma_sqlite' as const,
      before: _before('prisma_sqlite'),
      after: _after(() => {}),
    },
  ].filter(a => typeof only === 'undefined' || a.adapterName === only);
}

export { setupFromConfig, multiAdapterRunners, networkedGraphqlRequest };
