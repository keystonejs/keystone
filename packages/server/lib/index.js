const express = require('express');
const corsMiddleware = require('cors');
const path = require('path');
const falsey = require('falsey');
const { commonSessionMiddleware } = require('@keystone-alpha/session');
const createGraphQLMiddleware = require('./graphql');
const { createApolloServer } = require('./apolloServer');

module.exports = class WebServer {
  constructor(
    keystone,
    {
      port,
      adminUI,
      cors = { origin: true, credentials: true },
      apollo,
      sessionStore,
      cookieSecret = 'qwerty',
      apiPath = '/admin/api',
      graphiqlPath = '/admin/graphiql',
      pinoOptions,
      distDir,
    }
  ) {
    this.keystone = keystone;
    this.express = express;
    this.port = port || process.env.PORT || 3000;
    this.app = express();

    if (falsey(process.env.DISABLE_LOGGING)) {
      this.app.use(require('express-pino-logger')(pinoOptions));
    }

    if (cors) {
      this.app.use(corsMiddleware(cors));
    }

    if (Object.keys(keystone.auth).length > 0) {
      this.app.use(commonSessionMiddleware(keystone, cookieSecret, sessionStore));
    }

    if (adminUI && adminUI.authStrategy) {
      // Inject the Admin specific session routes.
      // ie; this includes the signin/signout UI
      this.app.use(adminUI.createSessionMiddleware());
    }

    const server = createApolloServer(keystone, apollo, 'admin');

    // GraphQL API always exists independent of any adminUI or Session settings
    // We currently make the admin UI public. In the future we want to be able
    // to restrict this to a limited audience, while setting up a separate
    // public API with much stricter access control.
    this.app.use(
      createGraphQLMiddleware(server, { apiPath, graphiqlPath, port }, { isPublic: true })
    );

    if (adminUI) {
      if (process.env.NODE_ENV === 'production') {
        this.app.use(adminUI.createProdMiddleware({ apiPath, graphiqlPath, port, distDir }));
      } else {
        // This must be last as it's the "catch all" which falls into Webpack to
        // serve the Admin UI.
        this.app.use(adminUI.createDevMiddleware({ apiPath, graphiqlPath, port }));
      }
    }
  }

  async start() {
    const { app, port } = this;

    return new Promise((resolve, reject) => {
      app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, './default.html')));
      app.listen(port, error => (error ? reject(error) : resolve({ port })));
    });
  }
};
