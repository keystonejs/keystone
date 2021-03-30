import path from 'path';
import crypto from 'crypto';
import { ServerResponse } from 'http';
import express from 'express';
// @ts-ignore
import supertest from 'supertest-light';
// @ts-ignore
import { Keystone } from '@keystone-next/keystone-legacy';
import { initConfig, createSystem, createExpressServer } from '@keystone-next/keystone';
import type { KeystoneConfig, BaseKeystone, KeystoneContext } from '@keystone-next/types';
import memoizeOne from 'memoize-one';

export type AdapterName = 'prisma_postgresql' | 'prisma_sqlite';

const hashPrismaSchema = memoizeOne(prismaSchema =>
  crypto.createHash('md5').update(prismaSchema).digest('hex')
);

const argGenerator = {
  prisma_postgresql: () => ({
    migrationMode: 'prototype',
    dropDatabase: true,
    url: process.env.DATABASE_URL || '',
    provider: 'postgresql',
    // Put the generated client at a unique path
    getPrismaPath: ({ prismaSchema }: { prismaSchema: string }) =>
      path.join('.api-test-prisma-clients', hashPrismaSchema(prismaSchema)),
    // Slice down to the hash make a valid postgres schema name
    getDbSchemaName: ({ prismaSchema }: { prismaSchema: string }) =>
      hashPrismaSchema(prismaSchema).slice(0, 16),
    // Turn this on if you need verbose debug info
    enableLogging: false,
  }),
  prisma_sqlite: () => ({
    migrationMode: 'prototype',
    dropDatabase: true,
    url: process.env.DATABASE_URL || '',
    provider: 'sqlite',
    // Put the generated client at a unique path
    getPrismaPath: ({ prismaSchema }: { prismaSchema: string }) =>
      path.join('.api-test-prisma-clients', hashPrismaSchema(prismaSchema)),
    // Turn this on if you need verbose debug info
    enableLogging: false,
  }),
};

// Users should use testConfig({ ... }) in place of config({ ... }) when setting up
// their system for test. We explicitly don't allow them to control the 'db' or 'ui'
// properties as we're going to set that up as part of setupFromConfig.
type TestKeystoneConfig = Omit<KeystoneConfig, 'db' | 'ui'>;
export const testConfig = (config: TestKeystoneConfig) => config;

async function setupFromConfig({
  adapterName,
  config,
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
    config.experimental = { prismaSqlite: true };
  }
  const _config = initConfig({ ...config, db: db!, ui: { isDisabled: true } });

  const { keystone, createContext, graphQLSchema } = createSystem(_config, 'dev');

  const app = await createExpressServer(_config, graphQLSchema, createContext, true, '', false);

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
