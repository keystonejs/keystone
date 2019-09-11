const assert = require('nanoassert');
const createGraphQLMiddleware = require('./lib/graphql');
const { createApolloServer } = require('./lib/apolloServer');

class GraphQLApp {
  constructor({
    apiPath = '/admin/api',
    graphiqlPath = '/admin/graphiql',
    schemaName = 'public',
    apollo = {},
    // Deprecated options:
    cors,
    pinoOptions,
    cookieSecret,
    sessionStore,
  } = {}) {
    // Remove these assertions after March 1st, 2019 (6 months from when they
    // were added)
    assert(
      typeof cookieSecret === 'undefined',
      'The `cookieSecret` option has moved to the Keystone constructor: `new Keystone({ cookieSecret: "abc" })`'
    );
    assert(
      typeof sessionStore === 'undefined',
      'The `sessionStore` option has moved to the Keystone constructor: `new Keystone({ sessionStore: myStore })`'
    );
    assert(
      typeof pinoOptions === 'undefined',
      'The `pinoOptions` option has moved to the Keystone.pepare() method: `keystone.prepare({ pinoOptions })`'
    );
    assert(
      typeof cors === 'undefined',
      'The `cors` option has moved to the Keystone.pepare() method: `keystone.prepare({ cors })`'
    );
    this._apiPath = apiPath;
    this._graphiqlPath = graphiqlPath;
    this._apollo = apollo;
    this._schemaName = schemaName;
  }

  /**
   * @return Array<middlewares>
   */
  prepareMiddleware({ keystone, dev }) {
    const middlewares = [];

    const server = createApolloServer(keystone, this._apollo, this._schemaName, dev);
    // GraphQL API always exists independent of any adminUI or Session
    // settings We currently make the admin UI public. In the future we want
    // to be able to restrict this to a limited audience, while setting up a
    // separate public API with much stricter access control.
    middlewares.push(
      createGraphQLMiddleware(
        server,
        { apiPath: this._apiPath, graphiqlPath: this._graphiqlPath },
        { isPublic: true }
      )
    );

    return middlewares;
  }

  /**
   * @param Options { distDir }
   */
  build() {}
}

module.exports = {
  GraphQLApp,
};
