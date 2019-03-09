const pFinally = require('p-finally');
const supertest = require('supertest-light');
const extractStack = require('extract-stack');
const { Keystone } = require('@keystone-alpha/keystone');
const { WebServer } = require('@keystone-alpha/server');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');
const { KnexAdapter } = require('@keystone-alpha/adapter-knex');
const MongoDBMemoryServer = require('mongodb-memory-server').default;

function setupServer({ name, adapterName, createLists = () => {} }) {
  const Adapter = { mongoose: MongooseAdapter, knex: KnexAdapter }[adapterName];
  const keystone = new Keystone({
    name,
    adapter: new Adapter(),
    defaultAccess: { list: true, field: true },
  });

  createLists(keystone);

  const server = new WebServer(keystone, {
    apiPath: '/admin/api',
    graphiqlPath: '/admin/graphiql',
  });

  return { keystone, server };
}

function graphqlRequest({ server, query }) {
  try {
    const cleanedStack = extractStack(new Error())
      .split('\n')
      // Slice out the stackframe pointing to this function
      .slice(1)
      // Stick the stacktrace back together
      .join('\n');

    if (!server.app) {
      const params = `{ server: { ${Object.keys(server).join(', ')} } }`;
      const error = new Error(`Must provide { server: { app: <express> } }, got: ${params}`);
      error.stack = error.stack.replace(extractStack(error), cleanedStack);
      return Promise.reject(error);
    }

    return supertest(server.app)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .post('/admin/api', { query })
      .then(res => {
        res.body = JSON.parse(res.text);
        return res;
      })
      .then(res => {
        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
          const error = new Error(
            `Expected status "2XX", got ${res.statusCode} with body:` +
              `\n${require('util').inspect(res.body || {}, { depth: null })}`
          );

          // Replace the stacktrace with the clean one we gathered and cleaned
          // before this async process
          error.stack = error.stack.replace(extractStack(error), cleanedStack);

          throw error;
        }
        return res;
      });
  } catch (error) {
    return Promise.reject(error);
  }
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
  // The dbName is the last part of the URI path
  const dbName = mongoUri.split('/').pop();

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

function getCreate(server) {
  return (list, item) => server.keystone.getListByKey(list).adapter.create(item);
}

function getFindById(server) {
  return (list, item) => server.keystone.getListByKey(list).adapter.findById(item);
}

function getFindOne(server) {
  return (list, item) => server.keystone.getListByKey(list).adapter.findOne(item);
}

function getUpdate(server) {
  return (list, id, data) => server.keystone.getListByKey(list).adapter.update(id, data);
}

function keystoneMongoTest(setupKeystoneFn, testFn) {
  return async function() {
    const server = setupKeystoneFn('mongoose');
    const { mongoUri, dbName } = await getMongoMemoryServerConfig();

    await server.keystone.connect(
      mongoUri,
      { dbName }
    );

    return pFinally(
      testFn({
        server,
        create: getCreate(server),
        findById: getFindById(server),
        findOne: getFindOne(server),
        update: getUpdate(server),
      }),
      () => server.keystone.disconnect().then(teardownMongoMemoryServer)
    );
  };
}

function keystoneKnexTest(setupKeystoneFn, testFn) {
  return async function() {
    const server = setupKeystoneFn('knex');

    await server.keystone.connect();

    return pFinally(
      testFn({
        server,
        create: getCreate(server),
        findById: getFindById(server),
        findOne: getFindOne(server),
        update: getUpdate(server),
      }),
      () => server.keystone.disconnect()
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

const runQuery = (server, snippet) => {
  return graphqlRequest({
    server,
    query: `query { ${snippet} }`,
  }).then(res => res.body.data);
};

const matchFilter = (server, gqlArgs, fields, target, sortkey) => {
  gqlArgs = gqlArgs ? `(${gqlArgs})` : '';
  const snippet = `allTests ${gqlArgs} ${fields}`;
  return runQuery(server, snippet).then(data => {
    const value = sortkey ? sorted(data.allTests || [], i => i[sortkey]) : data.allTests;
    expect(value).toEqual(target);
  });
};

module.exports = {
  setupServer,
  multiAdapterRunners,
  graphqlRequest,
  matchFilter,
  runQuery,
};
