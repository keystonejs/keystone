const express = require('express');
const supertest = require('supertest-light');
const MongoDBMemoryServer = require('mongodb-memory-server').default;
const pFinally = require('p-finally');
const url = require('url');
const { Keystone } = require('@keystone/keystone');
const { GraphQLApp } = require('@keystone/app-graphql');
const { KnexAdapter } = require('@keystone/adapter-knex');
const { MongooseAdapter } = require('@keystone/adapter-mongoose');

async function setupServer({
  name,
  adapterName,
  schemaName = 'testing',
  schemaNames = ['testing'],
  createLists = () => {},
  keystoneOptions,
  graphqlOptions = {},
}) {
  const Adapter = { mongoose: MongooseAdapter, knex: KnexAdapter }[adapterName];

  const argGenerator = {
    mongoose: getMongoMemoryServerConfig,
    knex: () => ({
      dropDatabase: true,
      knexOptions: { connection: process.env.KNEX_URI || 'postgres://localhost/keystone' },
    }),
  }[adapterName];

  const keystone = new Keystone({
    name,
    adapter: new Adapter(await argGenerator()),
    defaultAccess: { list: true, field: true },
    schemaNames,
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

function graphqlRequest({ keystone, query, variables, operationName }) {
  return keystone.executeQuery(query, {
    variables,
    operationName,
  });
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
  const dbName = url
    .parse(mongoUri)
    .pathname.split('/')
    .pop();

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

function getCreate(keystone) {
  return (list, item) => keystone.getListByKey(list).adapter.create(item);
}

function getFindById(keystone) {
  return (list, item) => keystone.getListByKey(list).adapter.findById(item);
}

function getFindOne(keystone) {
  return (list, item) => keystone.getListByKey(list).adapter.findOne(item);
}

function getUpdate(keystone) {
  return (list, id, data) => keystone.getListByKey(list).adapter.update(id, data);
}

function getDelete(keystone) {
  return (list, id) => keystone.getListByKey(list).adapter.delete(id);
}

function _keystoneRunner(adapterName, tearDownFunction) {
  return function(setupKeystoneFn, testFn) {
    return async function() {
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

      return pFinally(
        testFn({
          ...setup,
          create: getCreate(keystone),
          findById: getFindById(keystone),
          findOne: getFindOne(keystone),
          update: getUpdate(keystone),
          delete: getDelete(keystone),
        }),
        () => keystone.disconnect().then(tearDownFunction)
      );
    };
  };
}

function multiAdapterRunners(only) {
  return [
    { runner: _keystoneRunner('mongoose', teardownMongoMemoryServer), adapterName: 'mongoose' },
    { runner: _keystoneRunner('knex', () => {}), adapterName: 'knex' },
  ].filter(a => typeof only === 'undefined' || a.adapterName === only);
}

const sorted = (arr, keyFn) => {
  arr = [...arr];
  arr.sort((a, b) => {
    a = keyFn(a);
    b = keyFn(b);
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
  return arr;
};

const matchFilter = (keystone, gqlArgs, fields, target, sortkey) => {
  gqlArgs = gqlArgs ? `(${gqlArgs})` : '';
  const snippet = `allTests ${gqlArgs} ${fields}`;
  return graphqlRequest({ keystone, query: `query { ${snippet} }` }).then(({ data }) => {
    const value = sortkey ? sorted(data.allTests || [], i => i[sortkey]) : data.allTests;
    expect(value).toEqual(target);
  });
};

module.exports = {
  setupServer,
  multiAdapterRunners,
  graphqlRequest,
  networkedGraphqlRequest,
  matchFilter,
};
