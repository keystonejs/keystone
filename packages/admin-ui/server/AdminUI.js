const falsey = require('falsey');
const express = require('express');
const webpack = require('webpack');
const chalk = require('chalk');
const terminalLink = require('terminal-link');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const pkgInfo = require('../package.json');

const getWebpackConfig = require('./getWebpackConfig');
const { createSessionMiddleware } = require('./sessionMiddleware');
const { mode } = require('./env');

module.exports = class AdminUI {
  constructor(keystone, config = {}) {
    this.keystone = keystone;

    if (config.adminPath === '/') {
      throw new Error("Admin path cannot be the root path. Try; '/admin'");
    }

    this.adminPath = config.adminPath || '/admin';
    const { authStrategy } = config;
    if (authStrategy && authStrategy.authType !== 'password') {
      throw new Error('Keystone 5 Admin currently only supports the `PasswordAuthStrategy`');
    }
    this.authStrategy = authStrategy;

    this.config = {
      ...config,
      signinPath: `${this.adminPath}/signin`,
      signoutPath: `${this.adminPath}/signout`,
      sessionPath: `${this.adminPath}/session`,
    };
  }

  getAdminMeta() {
    return {
      withAuth: !!this.authStrategy,
      authList: this.authStrategy ? this.authStrategy.listKey : null,
      adminPath: this.adminPath,
      signinPath: this.config.signinPath,
      signoutPath: this.config.signoutPath,
      sessionPath: this.config.sessionPath,
      sortListsAlphabetically: this.config.sortListsAlphabetically,
    };
  }

  createSessionMiddleware() {
    const { signinPath, signoutPath, sessionPath } = this.config;
    return createSessionMiddleware(
      { signinPath, signoutPath, sessionPath, successPath: this.adminPath },
      this.keystone.sessionManager,
      this.authStrategy
    );
  }

  createDevMiddleware({ apiPath, graphiqlPath, port }) {
    const app = express();
    const { adminPath } = this;

    // ensure any non-resource requests are rewritten for history api fallback
    if (falsey(process.env.DISABLE_LOGGING)) {
      const url = `http://localhost:${port}${adminPath}`;
      const prettyUrl = chalk.blue(`${url}(/.*)?`);
      const clickableUrl = terminalLink(prettyUrl, url, { fallback: () => prettyUrl });

      console.log(`🔗 ${chalk.green('Keystone Admin UI:')} ${clickableUrl} (v${pkgInfo.version})`);
    }
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
