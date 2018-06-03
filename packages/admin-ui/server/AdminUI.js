const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const webpack = require('webpack');
const { apolloUploadExpress } = require('apollo-upload-server');
const webpackDevMiddleware = require('webpack-dev-middleware');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');

const getWebpackConfig = require('./getWebpackConfig');

module.exports = class AdminUI {
  constructor(keystone, config) {
    this.keystone = keystone;

    if (config.adminPath === '/') {
      throw new Error("Admin path cannot be the root path. Try; '/admin'");
    }

    this.adminPath = config.adminPath || '/admin';
    this.graphiqlPath = `${this.adminPath}/graphiql`;
    this.apiPath = `${this.adminPath}/api`;

    this.config = {
      ...config,
      signinPath: `${this.adminPath}/signin`,
      signoutPath: `${this.adminPath}/signout`,
      sessionPath: `${this.adminPath}/session`,
    };

    this.signin = this.signin.bind(this);
    this.signout = this.signout.bind(this);
    this.session = this.session.bind(this);
  }

  getAdminMeta() {
    return {
      withAuth: !!this.config.authStrategy,
      adminPath: this.config.adminPath,
      signinPath: this.config.signinPath,
      signoutPath: this.config.signoutPath,
      sessionPath: this.config.sessionPath,
    };
  }

  async signin(req, res, next) {
    try {
      // TODO: How could we support, for example, the twitter auth flow?
      const result = await this.config.authStrategy.validate({
        username: req.body.username,
        password: req.body.password,
      });
      if (!result.success) {
        return res.json({
          success: false,
        });
      }
      await this.keystone.session.create(req, result);
      res.json({
        success: true,
      });
    } catch (e) {
      next(e);
    }
  }

  async signout(req, res, next) {
    try {
      await this.keystone.session.destroy(req);
      res.json({
        success: true,
      });
    } catch (e) {
      next(e);
    }
  }

  session(req, res) {
    res.json({
      signedIn: !!req.user,
      user: req.user ? { id: req.user.id, name: req.user.name } : undefined,
    });
  }

  createSessionMiddleware({ cookieSecret, sessionMiddleware }) {
    if (!this.config.authStrategy) {
      return (req, res, next) => next();
    }

    const app = express();

    const sessionHandler = sessionMiddleware || session({
      secret: cookieSecret,
      resave: false,
      saveUninitialized: false,
      name: 'keystone-admin.sid',
    });

    // implement session management
    app.use(this.adminPath, sessionHandler);
    app.post(`${this.apiPath}/signin`, bodyParser.json(), this.signin);
    app.post(`${this.apiPath}/signout`, this.signout);
    app.use(
      this.keystone.session.validate({
        valid: ({ req, item }) => (req.user = item),
      })
    );
    app.get(`${this.apiPath}/session`, this.session);
    return app;
  }

  createGraphQLMiddleware() {
    const app = express();

    // add the Admin GraphQL API
    const schema = this.keystone.getAdminSchema();
    app.use(
      this.apiPath,
      bodyParser.json(),
      // TODO: Make configurable
      apolloUploadExpress({ maxFileSize: 200 * 1024 * 1024, maxFiles: 5 }),
      graphqlExpress({ schema })
    );
    app.use(this.graphiqlPath, graphiqlExpress({ endpointURL: this.apiPath }));
    return app;
  }

  createDevMiddleware() {
    const app = express();
    const { adminPath, apiPath, graphiqlPath, config } = this;

    // ensure any non-resource requests are rewritten for history api fallback
    app.use(adminPath, (req, res, next) => {
      if (/^[\w\/\-]+$/.test(req.url)) req.url = '/';
      next();
    });

    // add the webpack dev middleware
    const adminMeta = {
      adminPath,
      apiPath,
      graphiqlPath,
      ...this.getAdminMeta(),
      ...this.keystone.getAdminMeta(),
    };
    const webpackMiddlewareConfig = {
      publicPath: adminPath,
      stats: 'minimal',
    };

    const secureMiddleware = webpackDevMiddleware(
      webpack(
        getWebpackConfig({
          adminMeta,
          entry: 'index',
        })
      ),
      webpackMiddlewareConfig
    );

    if (config.authStrategy) {
      const publicMiddleware = webpackDevMiddleware(
        webpack(
          getWebpackConfig({
            // override lists so that schema and field views are excluded
            adminMeta: { ...adminMeta, lists: {} },
            entry: 'public',
          })
        ),
        webpackMiddlewareConfig
      );

      // app.use(adminMiddleware);
      app.use((req, res, next) => {
        // TODO: Better security, should check some property of the user
        return req.user
          ? secureMiddleware(req, res, next)
          : publicMiddleware(req, res, next);
      });
    } else {
      // No auth required? Everyone can access the "secure" area
      app.use(secureMiddleware);
    }

    // handle errors
    // eslint-disable-next-line no-unused-vars
    app.use(function(err, req, res, next) {
      console.error(err.stack);
      res.status(500).send('Error');
    });

    return app;
  }
};
