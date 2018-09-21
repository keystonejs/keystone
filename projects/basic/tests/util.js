const supertest = require('supertest-light');
const extractStack = require('extract-stack');
const { Keystone } = require('@voussoir/core');
const { WebServer } = require('@voussoir/server');
const { MongooseAdapter } = require('@voussoir/adapter-mongoose');

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

module.exports = {
  setupServer,
  graphqlRequest,
};
