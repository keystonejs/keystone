const MongoDBMemoryServer = require('mongodb-memory-server').default;
const pFinally = require('p-finally');
const url = require('url');
const { Keystone } = require('@keystone-alpha/keystone');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const { KnexAdapter } = require('@keystone-alpha/adapter-knex');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');

const SCHEMA_NAME = 'testing';

function setupServer({ name, adapterName, createLists = () => {} }) {
  const Adapter = { mongoose: MongooseAdapter, knex: KnexAdapter }[adapterName];
  const args = { mongoose: {}, knex: { dropDatabase: true } }[adapterName];
  const keystone = new Keystone({
    name,
    adapter: new Adapter(args),
    defaultAccess: { list: true, field: true },
  });

  createLists(keystone);

  // Has the side-effect of registering the schema with the keystone object
  new GraphQLApp({ schemaName: SCHEMA_NAME }).prepareMiddleware({ keystone, dev: true });

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

function keystoneMongoRunner(setupKeystoneFn, testFn) {
  return async function() {
    const setup = await setupKeystoneFn('mongoose');
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
        delete: getDelete(keystone),
      }),
      () => keystone.disconnect().then(teardownMongoMemoryServer)
    );
  };
}

function keystoneKnexRunner(setupKeystoneFn, testFn) {
  return async function() {
    const setup = await setupKeystoneFn('knex');
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
      () => keystone.disconnect()
    );
  };
}

function keystoneJSONRunner(setupKeystoneFn, testFn) {
  return async function() {
    const setup = await setupKeystoneFn('json');
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


function multiAdapterRunners(only) {
  return [
    { runner: keystoneMongoRunner, adapterName: 'mongoose' },
    { runner: keystoneKnexRunner, adapterName: 'knex' },
    { runner: keystoneJSONRunner, adapterName: 'json' },
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
  matchFilter,
};
