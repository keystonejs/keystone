const express = require('express');
const supertest = require('supertest-light');
const MongoDBMemoryServer = require('mongodb-memory-server-core').default;
const url = require('url');
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { KnexAdapter } = require('@keystonejs/adapter-knex');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const { runCustomQuery } = require('@keystonejs/server-side-graphql-client');

async function setupServer({
  adapterName,
  schemaName = 'public',
  schemaNames = ['public'],
  createLists = () => {},
  keystoneOptions,
  graphqlOptions = {},
}) {
  const Adapter = { mongoose: MongooseAdapter, knex: KnexAdapter }[adapterName];

  const argGenerator = {
    mongoose: getMongoMemoryServerConfig,
    knex: () => ({
      dropDatabase: true,
      knexOptions: {
        connection:
          process.env.DATABASE_URL || process.env.KNEX_URI || 'postgres://localhost/keystone',
      },
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

function graphqlRequest({ keystone, query, variables }) {
  return keystone.executeGraphQL({
    context: keystone.createContext({ skipAccessControl: true }),
    query,
    variables,
  });
}

// This is much like graphqlRequest except we don't skip access control checks!
function authedGraphqlRequest({ keystone, query, variables }) {
  return keystone.executeGraphQL({ query, variables });
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

      try {
        await testFn({
          ...setup,
        });
      } finally {
        await keystone.disconnect();
        await tearDownFunction();
      }
    };
  };
}

function _before(adapterName) {
  return async function(setupKeystone) {
    const { keystone, app } = await setupKeystone(adapterName);
    await keystone.connect();
    return { keystone, app };
  };
}

function _after(tearDownFunction) {
  return async function(keystone) {
    await keystone.disconnect();
    await tearDownFunction();
  };
}

function multiAdapterRunners(only) {
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

const matchFilter = async ({ keystone, queryArgs, fieldSelection, expected, sortKey }) => {
  const data = await runCustomQuery({
    keystone,
    query: `query {
      allTests${queryArgs ? `(${queryArgs})` : ''} { ${fieldSelection} }
    }`,
  });

  const value = sortKey ? sorted(data.allTests || [], i => i[sortKey]) : data.allTests;
  expect(value).toEqual(expected);
};

class MockFieldImplementation {
  constructor() {
    this.access = {
      public: {
        create: false,
        read: true,
        update: false,
        delete: false,
      },
    };
    this.config = {};
    this.hooks = {};
  }
  getAdminMeta() {
    return { path: 'id' };
  }
  gqlOutputFields() {
    return ['id: ID'];
  }
  gqlQueryInputFields() {
    return ['id: ID'];
  }
  get gqlUpdateInputFields() {
    return ['id: ID'];
  }
  get gqlCreateInputFields() {
    return ['id: ID'];
  }
  getGqlAuxTypes() {
    return [];
  }
  getGqlAuxQueries() {
    return [];
  }
  getGqlAuxMutations() {
    return [];
  }
  gqlOutputFieldResolvers() {
    return {};
  }
  gqlAuxQueryResolvers() {
    return {};
  }
  gqlAuxMutationResolvers() {
    return {};
  }
  gqlAuxFieldResolvers() {
    return {};
  }
  extendAdminViews(views) {
    return views;
  }
  getDefaultValue() {
    return;
  }
  async resolveInput({ resolvedData }) {
    return resolvedData.id;
  }
  async validateInput() {}
  async beforeChange() {}
  async afterChange() {}
  async beforeDelete() {}
  async validateDelete() {}
  async afterDelete() {}
}
class MockFieldAdapter {}

const MockIdType = {
  implementation: MockFieldImplementation,
  views: {},
  adapters: { mock: MockFieldAdapter },
};

class MockListAdapter {
  name = 'mock';
  constructor(parentAdapter) {
    this.parentAdapter = parentAdapter;
    this.index = 3;
    this.items = {
      0: { name: 'a', email: 'a@example.com', index: 0 },
      1: { name: 'b', email: 'b@example.com', index: 1 },
      2: { name: 'c', email: 'c@example.com', index: 2 },
    };
  }
  newFieldAdapter = () => new MockFieldAdapter();
  create = async item => {
    this.items[this.index] = {
      ...item,
      index: this.index,
    };
    this.index += 1;
    return this.items[this.index - 1];
  };
  findById = id => this.items[id];
  delete = async id => {
    this.items[id] = undefined;
  };
  itemsQuery = async ({ where: { id_in: ids, id, id_not_in } }, { meta = false } = {}) => {
    if (meta) {
      return {
        count: (id !== undefined
          ? [this.items[id]]
          : ids.filter(i => !id_not_in || !id_not_in.includes(i)).map(i => this.items[i])
        ).length,
      };
    } else {
      return id !== undefined
        ? [this.items[id]]
        : ids.filter(i => !id_not_in || !id_not_in.includes(i)).map(i => this.items[i]);
    }
  };
  itemsQueryMeta = async args => this.itemsQuery(args, { meta: true });
  update = (id, item) => {
    this.items[id] = { ...this.items[id], ...item };
    return this.items[id];
  };
}

class MockAdapter {
  name = 'mock';
  newListAdapter = () => new MockListAdapter(this);
  getDefaultPrimaryKeyConfig = () => ({ type: MockIdType });
}

module.exports = {
  setupServer,
  multiAdapterRunners,
  graphqlRequest,
  authedGraphqlRequest,
  networkedGraphqlRequest,
  matchFilter,
  MockAdapter,
  MockListAdapter,
  MockIdType,
};
