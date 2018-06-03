const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const webpack = require('webpack');
const { apolloUploadExpress } = require('apollo-upload-server');
const webpackDevMiddleware = require('webpack-dev-middleware');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');

const getWebpackConfig = require('./getWebpackConfig');

module.exports = class AdminUI {
  constructor(keystone, { adminPath = '/admin' }) {
    this.keystone = keystone;
    this.adminPath = adminPath;
    this.graphiqlPath = `${adminPath}/graphiql`;
    this.apiPath = `${this.adminPath}/api`;

    this.signin = this.signin.bind(this);
    this.signout = this.signout.bind(this);
    this.session = this.session.bind(this);
  }

  async signin(req, res, next) {
    try {
      const result = await this.keystone.auth.User.password.validate({
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

  createSessionMiddleware({ cookieSecret }) {
    const app = express();

    // implement session management
    app.use(
      this.adminPath,
      session({
        secret: cookieSecret,
        resave: false,
        saveUninitialized: false,
        name: 'keystone-admin.sid',
      })
    );
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
    const { adminPath, apiPath, graphiqlPath } = this;

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
      ...this.keystone.getAdminMeta(),
    };
    const webpackMiddlewareConfig = {
      publicPath: adminPath,
      stats: 'minimal',
    };

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

    const secureMiddleware = webpackDevMiddleware(
      webpack(
        getWebpackConfig({
          adminMeta,
          entry: 'index',
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

    // handle errors
    // eslint-disable-next-line no-unused-vars
    app.use(function(err, req, res, next) {
      console.error(err.stack);
      res.status(500).send('Error');
    });

    return app;
  }
};
