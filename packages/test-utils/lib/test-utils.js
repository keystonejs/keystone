const MongoDBMemoryServer = require('mongodb-memory-server').default;
const pFinally = require('p-finally');
const url = require('url');
const { createApolloServer } = require('@keystone-alpha/server');
const { Keystone } = require('@keystone-alpha/keystone');
const { KnexAdapter } = require('@keystone-alpha/adapter-knex');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');

const SCHEMA_NAME = 'testing';

function setupServer({ name, adapterName, createLists = () => {} }) {
  const Adapter = { mongoose: MongooseAdapter, knex: KnexAdapter }[adapterName];
  const keystone = new Keystone({
    name,
    adapter: new Adapter(),
    defaultAccess: { list: true, field: true },
  });

  createLists(keystone);

  createApolloServer(keystone, {}, SCHEMA_NAME);

  return { keystone };
}

function graphqlRequest({ keystone, query }) {
  return keystone._graphQLQuery[SCHEMA_NAME](query, keystone.getAccessContext(SCHEMA_NAME, {}));
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

function keystoneMongoTest(setupKeystoneFn, testFn) {
  return async function() {
    const setup = setupKeystoneFn('mongoose');
    const { keystone } = setup;

    const { mongoUri, dbName } = await getMongoMemoryServerConfig();

    await keystone.connect(mongoUri, { dbName });

    return pFinally(
      testFn({
        ...setup,
        create: getCreate(keystone),
        findById: getFindById(keystone),
        findOne: getFindOne(keystone),
        update: getUpdate(keystone),
      }),
      () => keystone.disconnect().then(teardownMongoMemoryServer)
    );
  };
}

function keystoneKnexTest(setupKeystoneFn, testFn) {
  return async function() {
    const setup = setupKeystoneFn('knex');
    const { keystone } = setup;

    await keystone.connect();

    return pFinally(
      testFn({
        ...setup,
        create: getCreate(keystone),
        findById: getFindById(keystone),
        findOne: getFindOne(keystone),
        update: getUpdate(keystone),
      }),
      () => keystone.disconnect()
    );
  };
}

function multiAdapterRunners() {
  return [
    { runner: keystoneMongoTest, adapterName: 'mongoose' },
    { runner: keystoneKnexTest, adapterName: 'knex' },
  ];
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
  matchFilter,
};
