const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

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
        // TODO - include some sort of error in the page
        const htmlResponse = () => res.redirect(this.config.signinPath);
        return res.format({
          default: htmlResponse,
          'text/html': htmlResponse,
          'application/json': () => res.json({ success: false }),
        });
      }

      await this.keystone.session.create(req, result);
    } catch (e) {
      return next(e);
    }

    return this.redirectSuccessfulSignin(req, res);
  }

  redirectSuccessfulSignin(req, res) {
    const htmlResponse = () => res.redirect(this.config.adminPath);
    return res.format({
      default: htmlResponse,
      'text/html': htmlResponse,
      'application/json': () => res.json({ success: true }),
    });
  }

  async signout(req, res, next) {
    let success;
    try {
      await this.keystone.session.destroy(req);
      success = true;
    } catch (e) {
      success = false;
      // TODO: Better error logging?
      console.error(e);
    }

    // NOTE: Because session is destroyed here, before webpack can handle the
    // request, the "public" bundle will load the "signed out" page
    const htmlResponse = () => next();
    return res.format({
      default: htmlResponse,
      'text/html': htmlResponse,
      'application/json': () => res.json({ success }),
    });
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

    const sessionHandler =
      sessionMiddleware ||
      session({
        secret: cookieSecret,
        resave: false,
        saveUninitialized: false,
        name: 'keystone-admin.sid',
      });

    // Add session tracking
    app.use(this.adminPath, sessionHandler);

    // Listen to POST events for form signin form submission (GET falls through
    // to the webpack server(s))
    app.post(
      this.config.signinPath,
      bodyParser.json(),
      bodyParser.urlencoded(),
      this.signin
    );

    // Listen to both POST and GET events, and always sign the user out.
    app.use(this.config.signoutPath, this.signout);

    // Attach the user to the request for all following route handlers
    app.use(
      this.keystone.session.validate({
        valid: ({ req, list, item }) => {
          req.user = item;
          req.authedListKey = list.key;
        },
      })
    );

    // Allow clients to AJAX for user info
    app.get(this.config.sessionPath, this.session);

    // Short-circuit GET requests when the user already signed in (avoids
    // downloading UI bundle, doing a client side redirect, etc)
    app.get(this.config.signinPath, (req, res, next) => {
      return req.user ? this.redirectSuccessfulSignin(req, res) : next();
    });

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

      this.stopDevServer = () => {
        return new Promise(resolve => {
          publicMiddleware.close(() => {
            secureMiddleware.close(resolve);
          });
        });
      };
    } else {
      // No auth required? Everyone can access the "secure" area
      app.use(secureMiddleware);

      this.stopDevServer = () => {
        return new Promise(resolve => {
          secureMiddleware.close(resolve);
        });
      };
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
