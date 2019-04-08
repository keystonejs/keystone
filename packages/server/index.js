const WebServer = require('./lib/index');
const { createApolloServer } = require('./lib/apolloServer');

module.exports = {
  WebServer,
  createApolloServer,
};
