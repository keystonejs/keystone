const express = require('express');
const cors = require('cors');
const path = require('path');
const falsey = require('falsey');
const { commonSessionMiddleware } = require('@keystone-alpha/session');
const createGraphQLMiddleware = require('./graphql');
const initConfig = require('./initConfig');
const { createApolloServer } = require('./apolloServer');

module.exports = class WebServer {
  constructor(keystone, config) {
    this.keystone = keystone;
    this.config = initConfig(config);
    this.express = express;
    this.app = express();

    const { adminUI, cookieSecret, sessionStore } = this.config;

    if (falsey(process.env.DISABLE_LOGGING)) {
      this.app.use(require('express-pino-logger')(this.config.pinoOptions));
    }

    if (this.config.cors) {
      this.app.use(cors(this.config.cors));
    }

    if (Object.keys(keystone.auth).length > 0) {
      this.app.use(commonSessionMiddleware(keystone, cookieSecret, sessionStore));
    }

    if (adminUI && adminUI.authStrategy) {
      // Inject the Admin specific session routes.
      // ie; this includes the signin/signout UI
      this.app.use(adminUI.createSessionMiddleware());
    }

    const { apollo } = this.config;
    const server = createApolloServer(keystone, apollo, 'admin');

    // GraphQL API always exists independent of any adminUI or Session settings
    const { apiPath, graphiqlPath, port } = this.config;
    this.app.use(createGraphQLMiddleware(server, { apiPath, graphiqlPath, port }));

    if (adminUI) {
      // This must be last as it's the "catch all" which falls into Webpack to
      // serve the Admin UI.
      this.app.use(adminUI.createDevMiddleware({ apiPath, graphiqlPath, port }));
    }
  }

  async start(...args) {
    const {
      app,
      config: { port },
    } = this;

    await this.keystone.connect(...args);
    return new Promise((resolve, reject) => {
      app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, './default.html')));

      app.listen(port, error => {
        if (error) {
          return reject(error);
        }
        return resolve({ port });
      });
    });
  }
};
