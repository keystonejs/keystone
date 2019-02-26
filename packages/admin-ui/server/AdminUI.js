const bodyParser = require('body-parser');
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const getWebpackConfig = require('./getWebpackConfig');
const { mode } = require('./env');

module.exports = class AdminUI {
  constructor(keystone, config) {
    this.keystone = keystone;

    if (config.adminPath === '/') {
      throw new Error("Admin path cannot be the root path. Try; '/admin'");
    }

    this.adminPath = config.adminPath || '/admin';

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
      withAuth: !!this.authStrategy,
      authList: this.authStrategy ? this.authStrategy.listKey : null,
      adminPath: this.config.adminPath,
      signinPath: this.config.signinPath,
      signoutPath: this.config.signoutPath,
      sessionPath: this.config.sessionPath,
      sortListsAlphabetically: this.config.sortListsAlphabetically,
    };
  }

  async signin(req, res, next) {
    try {
      // TODO: How could we support, for example, the twitter auth flow?
      const result = await this.authStrategy.validate({
        identity: req.body.username,
        secret: req.body.password,
      });

      if (!result.success) {
        // TODO - include some sort of error in the page
        const htmlResponse = () => res.redirect(this.config.signinPath);
        return res.format({
          default: htmlResponse,
          'text/html': htmlResponse,
          'application/json': () => res.json({ success: false, message: result.message }),
        });
      }

      await this.keystone.sessionManager.startAuthedSession(req, result);
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
      await this.keystone.sessionManager.endAuthedSession(req);
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

  setAuthStrategy(authStrategy) {
    if (authStrategy.authType !== 'password') {
      throw new Error('Keystone 5 Admin currently only supports the `PasswordAuthStrategy`');
    }

    this.authStrategy = authStrategy;
  }

  createSessionMiddleware() {
    const app = express();

    // Listen to POST events for form signin form submission (GET falls through
    // to the webpack server(s))
    app.post(
      this.config.signinPath,
      bodyParser.json(),
      bodyParser.urlencoded({ extended: true }),
      this.signin
    );

    // Listen to both POST and GET events, and always sign the user out.
    app.use(this.config.signoutPath, this.signout);

    // Allow clients to AJAX for user info
    app.get(this.config.sessionPath, this.session);

    // Short-circuit GET requests when the user already signed in (avoids
    // downloading UI bundle, doing a client side redirect, etc)
    app.get(this.config.signinPath, (req, res, next) => {
      return req.user ? this.redirectSuccessfulSignin(req, res) : next();
    });

    return app;
  }

  createDevMiddleware({ apiPath, graphiqlPath }) {
    const app = express();
    const { adminPath } = this;

    // ensure any non-resource requests are rewritten for history api fallback
    app.use(adminPath, (req, res, next) => {
      // TODO: make sure that this change is OK. (regex was testing on url, not path)
      // Changed because this was preventing adminui pages loading when a querystrings
      // was appended.
      if (/^[\w\/\-]+$/.test(req.path)) req.url = '/';
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

    const secureCompiler = webpack(
      getWebpackConfig({
        adminMeta,
        entry: 'index',
      })
    );

    const secureMiddleware = webpackDevMiddleware(secureCompiler, webpackMiddlewareConfig);
    const secureHotMiddleware = webpackHotMiddleware(secureCompiler);

    if (this.authStrategy) {
      const publicCompiler = webpack(
        getWebpackConfig({
          // override lists so that schema and field views are excluded
          adminMeta: { ...adminMeta, lists: {} },
          entry: 'public',
        })
      );

      const publicMiddleware = webpackDevMiddleware(publicCompiler, webpackMiddlewareConfig);
      const publicHotMiddleware = webpackHotMiddleware(publicCompiler);

      // app.use(adminMiddleware);
      app.use((req, res, next) => {
        // TODO: Better security, should check some property of the user
        return req.user ? secureMiddleware(req, res, next) : publicMiddleware(req, res, next);
      });

      if (mode === 'development') {
        app.use((req, res, next) => {
          return req.user
            ? secureHotMiddleware(req, res, next)
            : publicHotMiddleware(req, res, next);
        });
      }

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
      if (mode === 'development') {
        app.use(secureHotMiddleware);
      }
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
