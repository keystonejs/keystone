const supertest = require('supertest-light');
const extractStack = require('extract-stack');
const { Keystone } = require('@voussoir/core');
const { WebServer } = require('@voussoir/server');
const { MongooseAdapter } = require('@voussoir/adapter-mongoose');
const MongoDBMemoryServer = require('mongodb-memory-server').default;
const { resolveAllKeys, mapKeys } = require('@voussoir/utils');

function setupServer({ name, createLists = () => {} }) {
  const keystone = new Keystone({
    name,
    adapter: new MongooseAdapter(),
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
  const cleanedStack = extractStack(new Error())
    .split('\n')
    // Slice out the stackframe pointing to this function
    .slice(1)
    // Stick the stacktrace back together
    .join('\n');

  return supertest(server.server.app)
    .set('Accept', 'application/json')
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
}

async function withMongoMemoryServer(adapters, callback) {
  const mongoServer = new MongoDBMemoryServer();
  const mongoUri = await mongoServer.getConnectionString();
  const dbName = await mongoServer.getDbName();

  const cleanup = () =>
    resolveAllKeys(mapKeys(adapters, adapter => adapter.close())).then(() => mongoServer.stop());

  return Promise.resolve(callback({ mongoUri, dbName }))
    .then(result => cleanup().then(() => result))
    .catch(error =>
      cleanup().then(() => {
        throw error;
      })
    );
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
  return (list, id, data) =>
    server.keystone.getListByKey(list).adapter.update(id, data, { new: true });
}

function keystoneMongoTest(setupKeystoneFn, testFn) {
  return () => {
    const server = setupKeystoneFn();
    return withMongoMemoryServer(server.keystone.adapters, async ({ mongoUri, dbName }) => {
      await server.keystone.connect(
        mongoUri,
        { dbName }
      );
      return testFn({
        server,
        create: getCreate(server),
        findById: getFindById(server),
        findOne: getFindOne(server),
        update: getUpdate(server),
      });
    });
  };
}

module.exports = {
  setupServer,
  graphqlRequest,
  keystoneMongoTest,
};
