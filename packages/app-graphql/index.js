const createCorsMiddleware = require('cors');
const falsey = require('falsey');
const { commonSessionMiddleware } = require('@keystone-alpha/session');
const createGraphQLMiddleware = require('./lib/graphql');
const { createApolloServer } = require('./lib/apolloServer');

module.exports = class KeystoneGraphQLServer {
  constructor({
    cors = { origin: true, credentials: true },
    cookieSecret = 'qwerty',
    apiPath = '/admin/api',
    graphiqlPath = '/admin/graphiql',
    schemaName = 'admin',
    apollo = {},
    sessionStore,
    pinoOptions,
  } = {}) {
    this._apiPath = apiPath;
    this._graphiqlPath = graphiqlPath;
    this._pinoOptions = pinoOptions;
    this._cors = cors;
    this._cookieSecret = cookieSecret;
    this._sessionStore = sessionStore;
    this._apollo = apollo;
    this._schemaName = schemaName;
  }

  /**
   * @return Array<middlewares>
   */
  prepareMiddleware({ keystone, port, dev }) {
    const middlewares = [];

    if (falsey(process.env.DISABLE_LOGGING)) {
      middlewares.push(require('express-pino-logger')(this._pinoOptions));
    }

    if (this._cors) {
      middlewares.push(createCorsMiddleware(this._cors));
    }

    if (keystone.auth && Object.keys(keystone.auth).length > 0) {
      middlewares.push(commonSessionMiddleware(keystone, this._cookieSecret, this._sessionStore));
    }

    const server = createApolloServer(keystone, this._apollo, this._schemaName, dev);
    // GraphQL API always exists independent of any adminUI or Session
    // settings We currently make the admin UI public. In the future we want
    // to be able to restrict this to a limited audience, while setting up a
    // separate public API with much stricter access control.
    middlewares.push(
      createGraphQLMiddleware(
        server,
        { apiPath: this._apiPath, graphiqlPath: this._graphiqlPath, port },
        { isPublic: true }
      )
    );

    return middlewares;
  }

  /**
   * @param Options { distDir }
   */
  build() {}
};
