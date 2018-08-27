const supertest = require('supertest');
const { Keystone } = require('@keystonejs/core');
const { WebServer } = require('@keystonejs/server');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');

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
  return supertest(server.server.app)
    .post('/admin/api')
    .set('Accept', 'application/json')
    .send({ query })
    .set('Accept', 'application/json')
    .expect(200);
}

module.exports = {
  setupServer,
  graphqlRequest,
};
