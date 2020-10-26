const path = require('path');
const crypto = require('crypto');
const express = require('express');
const supertest = require('supertest-light');
const MongoDBMemoryServer = require('mongodb-memory-server-core').default;
const url = require('url');
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { KnexAdapter } = require('@keystonejs/adapter-knex');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const { PrismaAdapter } = require('@keystonejs/adapter-prisma');

async function setupServer({
  adapterName,
  schemaName = 'public',
  schemaNames = ['public'],
  createLists = () => {},
  keystoneOptions,
  graphqlOptions = {},
}) {
  const Adapter = {
    mongoose: MongooseAdapter,
    knex: KnexAdapter,
    prisma_postgresql: PrismaAdapter,
  }[adapterName];

  const argGenerator = {
    mongoose: getMongoMemoryServerConfig,
    knex: () => ({
      dropDatabase: true,
      knexOptions: {
        connection:
          process.env.DATABASE_URL || process.env.KNEX_URI || 'postgres://localhost/keystone',
      },
    }),
    prisma_postgresql: () => ({
      dropDatabase: true,
      url: process.env.DATABASE_URL,
      provider: 'postgresql',
      // Put the generated client at a unique path
      getPrismaPath: ({ prismaSchema }) =>
        path.join(
          '.api-test-prisma-clients',
          crypto.createHash('sha256').update(prismaSchema).digest('hex')
        ),
      // Slice down to the hash make a valid postgres schema name
      getDbSchemaName: ({ prismaSchema }) =>
        crypto.createHash('sha256').update(prismaSchema).digest('hex').slice(0, 16),
      // Turn this on if you need verbose debug info
      enableLogging: false,
    }),
  }[adapterName];

  const keystone = new Keystone({
    adapter: new Adapter(await argGenerator()),
    defaultAccess: { list: true, field: true },
    schemaNames,
    cookieSecret: 'secretForTesting',
    ...keystoneOptions,
  });

  createLists(keystone);

  const apps = [
    new GraphQLApp({
      schemaName,
      apiPath: '/admin/api',
      graphiqlPath: '/admin/graphiql',
      apollo: {
        tracing: true,
        cacheControl: {
          defaultMaxAge: 3600,
        },
      },
      ...graphqlOptions,
    }),
  ];

  const { middlewares } = await keystone.prepare({ dev: true, apps });

  const app = express();
  app.use(middlewares);

  return { keystone, app };
}

function networkedGraphqlRequest({
  app,
  query,
  variables = undefined,
  headers = {},
  expectedStatusCode = 200,
  operationName,
}) {
  const request = supertest(app).set('Accept', 'application/json');

  Object.entries(headers).forEach(([key, value]) => request.set(key, value));

  return request
    .post('/admin/api', { query, variables, operationName })
    .then(res => {
      expect(res.statusCode).toBe(expectedStatusCode);
      return {
        ...JSON.parse(res.text),
        res,
      };
    })
    .catch(error => ({
      errors: [error],
    }));
}

// One instance per node.js thread which cleans itself up when the main process
// exits
let mongoServer;
let mongoServerReferences = 0;

async function getMongoMemoryServerConfig() {
  mongoServer = mongoServer || new MongoDBMemoryServer();
  mongoServerReferences++;
  // Passing `true` here generates a new, random DB name for us
  const mongoUri = await mongoServer.getConnectionString(true);
  // In theory the dbName can contain query params so lets parse it then extract the db name
  const dbName = url.parse(mongoUri).pathname.split('/').pop();

  return { mongoUri, dbName };
}

function teardownMongoMemoryServer() {
  mongoServerReferences--;
  if (mongoServerReferences < 0) {
    mongoServerReferences = 0;
  }

  if (mongoServerReferences > 0) {
    return Promise.resolve();
  }

  if (!mongoServer) {
    return Promise.resolve();
  }
  const stopping = mongoServer.stop();
  mongoServer = null;
  return stopping;
}

function _keystoneRunner(adapterName, tearDownFunction) {
  return function (setupKeystoneFn, testFn) {
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

function _before(adapterName) {
  return async function (setupKeystone) {
    const { keystone, app } = await setupKeystone(adapterName);
    await keystone.connect();
    return { keystone, app };
  };
}

function _after(tearDownFunction) {
  return async function (keystone) {
    await keystone.disconnect();
    await tearDownFunction();
  };
}

function multiAdapterRunners(only = process.env.TEST_ADAPTER) {
  return [
    {
      runner: _keystoneRunner('mongoose', teardownMongoMemoryServer),
      adapterName: 'mongoose',
      before: _before('mongoose'),
      after: _after(teardownMongoMemoryServer),
    },
    {
      runner: _keystoneRunner('knex', () => {}),
      adapterName: 'knex',
      before: _before('knex'),
      after: _after(() => {}),
    },
    {
      runner: _keystoneRunner('prisma_postgresql', () => {}),
      adapterName: 'prisma_postgresql',
      before: _before('prisma_postgresql'),
      after: _after(() => {}),
    },
  ].filter(a => typeof only === 'undefined' || a.adapterName === only);
}

module.exports = {
  setupServer,
  multiAdapterRunners,
  networkedGraphqlRequest,
};
