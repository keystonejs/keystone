const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const fallback = require('express-history-api-fallback');

const getWebpackConfig = require('./server/getWebpackConfig');

class AdminUIApp {
  constructor({
    adminPath = '/admin',
    apiPath = '/admin/api',
    graphiqlPath = '/admin/graphiql',
    authStrategy,
    pages,
    enableDefaultRoute = false,
    filterAdminAccess = () => true,
  } = {}) {
    if (adminPath === '/') {
      throw new Error("Admin path cannot be the root path. Try; '/admin'");
    }

    if (authStrategy && authStrategy.authType !== 'password') {
      throw new Error('Keystone 5 Admin currently only supports the `PasswordAuthStrategy`');
    }

    this.adminPath = adminPath;
    this.authStrategy = authStrategy;
    this.pages = pages;
    this.apiPath = apiPath;
    this.graphiqlPath = graphiqlPath;
    this.enableDefaultRoute = enableDefaultRoute;
    this.filterAdminAccess = filterAdminAccess;

    this.routes = {
      signinPath: `${this.adminPath}/signin`,
      signoutPath: `${this.adminPath}/signout`,
    };
  }

  getAdminMeta() {
    return {
      adminPath: this.adminPath,
      pages: this.pages,
      ...this.routes,
      ...(this.authStrategy
        ? {
            authStrategy: this.authStrategy.getAdminMeta(),
          }
        : {}),
    };
  }

  createSessionMiddleware() {
    const { signinPath } = this.routes;

    const app = express();

    // Short-circuit GET requests when the user already signed in (avoids
    // downloading UI bundle, doing a client side redirect, etc)
    app.get(signinPath, (req, res, next) =>
      // This session is currently authenticated as part of the 'admin'
      // audience.
      req.user && req.session.audiences && req.session.audiences.includes('admin')
        ? res.redirect(this.adminPath)
        : next()
    );

    // TODO: Attach a server-side signout to signoutPath

    return app;
  }

  build({ keystone, distDir }) {
    const builtAdminRoot = path.join(distDir, 'admin');

    const adminMeta = this.getAdminUIMeta(keystone);

    const compilers = [];

    const secureCompiler = webpack(
      getWebpackConfig({
        adminMeta,
        entry: 'index',
        outputPath: path.join(builtAdminRoot, 'secure'),
      })
    );
    compilers.push(secureCompiler);

    if (this.authStrategy) {
      const publicCompiler = webpack(
        getWebpackConfig({
          // override lists so that schema and field views are excluded
          adminMeta: { ...adminMeta, lists: {} },
          entry: 'public',
          outputPath: path.join(builtAdminRoot, 'public'),
        })
      );
      compilers.push(publicCompiler);
    }

    return Promise.all(
      compilers.map(
        compiler =>
          new Promise((resolve, reject) => {
            compiler.run(err => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          })
      )
    );
  }

  getAdminUIMeta(keystone) {
    const { adminPath } = this;

    return {
      adminPath,
      apiPath: this.apiPath,
      graphiqlPath: this.graphiqlPath,
      ...this.getAdminMeta(),
      ...keystone.getAdminMeta(),
    };
  }

  prepareMiddleware({ keystone, distDir, dev }) {
    if (dev) {
      return this.createDevMiddleware({ keystone });
    } else {
      return this.createProdMiddleware({ keystone, distDir });
    }
  }

  createProdMiddleware({ keystone, distDir }) {
    const app = express.Router();

    app.use(this.adminPath, (req, res, next) => {
      if (req.user && !this.filterAdminAccess(req.user)) {
        res.redirect('/');
      } else {
        next();
      }
    });

    app.use(compression());

    const builtAdminRoot = path.join(distDir, 'admin');
    if (!fs.existsSync(builtAdminRoot)) {
      throw new Error(
        'There are no Admin UI build artifacts. Please run `keystone build` before running `keystone start`'
      );
    }
    const secureBuiltRoot = path.join(builtAdminRoot, 'secure');
    const secureStaticMiddleware = express.static(secureBuiltRoot);
    const secureFallbackMiddleware = fallback('index.html', {
      root: secureBuiltRoot,
    });

    if (this.authStrategy) {
      const publicBuiltRoot = path.join(builtAdminRoot, 'public');
      const publicStaticMiddleware = express.static(publicBuiltRoot);
      const publicFallbackMiddleware = fallback('index.html', {
        root: publicBuiltRoot,
      });
      app.use((req, res, next) => {
        // TODO: Better security, should check some property of the user
        return req.user
          ? secureStaticMiddleware(req, res, next)
          : publicStaticMiddleware(req, res, next);
      });

      app.use((req, res, next) => {
        // TODO: Better security, should check some property of the user
        return req.user
          ? secureFallbackMiddleware(req, res, next)
          : publicFallbackMiddleware(req, res, next);
      });
    } else {
      app.use(secureStaticMiddleware);
      app.use(secureFallbackMiddleware);
    }

    const _app = express.Router();

    if (this.authStrategy) {
      _app.use(this.createSessionMiddleware(keystone));
    }

    _app.use(this.adminPath, app);

    if (this.enableDefaultRoute) {
      // Attach this last onto the root so the `this.adminPath` can overwrite it
      // if necessary
      _app.get('/', (req, res) => {
        if (!req.user) {
          res.sendFile(path.resolve(__dirname, './server/default.html'));
        }
      });
    }

    return _app;
  }

  createDevMiddleware({ keystone }) {
    const app = express();

    app.use(this.adminPath, (req, res, next) => {
      if (req.user && !this.filterAdminAccess(req.user)) {
        res.redirect('/');
      } else {
        next();
      }
    });

    const { adminPath } = this;
    if (this.authStrategy) {
      app.use(this.createSessionMiddleware(keystone));
    }

    // ensure any non-resource requests are rewritten for history api fallback
    app.use(adminPath, (req, res, next) => {
      // TODO: make sure that this change is OK. (regex was testing on url, not path)
      // Changed because this was preventing adminui pages loading when a querystrings
      // was appended.

      if (/^[\w\/\-]+$/.test(req.path)) req.url = '/';
      next();
    });

    // add the webpack dev middleware

    let adminMeta = this.getAdminUIMeta(keystone);

    const webpackMiddlewareConfig = {
      publicPath: adminPath,
      stats: 'none',
      logLevel: 'error',
    };

    const webpackHotMiddlewareConfig = {
      log: null,
    };

    const secureCompiler = webpack(
      getWebpackConfig({
        adminMeta,
        entry: 'index',
      })
    );

    const secureMiddleware = webpackDevMiddleware(secureCompiler, webpackMiddlewareConfig);
    const secureHotMiddleware = webpackHotMiddleware(secureCompiler, webpackHotMiddlewareConfig);

    if (this.authStrategy) {
      const publicCompiler = webpack(
        getWebpackConfig({
          // override lists so that schema and field views are excluded
          adminMeta: { ...adminMeta, lists: {} },
          entry: 'public',
        })
      );

      const publicMiddleware = webpackDevMiddleware(publicCompiler, webpackMiddlewareConfig);
      const publicHotMiddleware = webpackHotMiddleware(publicCompiler, webpackHotMiddlewareConfig);

      // app.use(adminMiddleware);

      app.use((req, res, next) => {
        // TODO: Better security, should check some property of the user
        return req.user ? secureMiddleware(req, res, next) : publicMiddleware(req, res, next);
      });

      app.use((req, res, next) => {
        return req.user ? secureHotMiddleware(req, res, next) : publicHotMiddleware(req, res, next);
      });
    } else {
      // No auth required? Everyone can access the "secure" area
      app.use(secureMiddleware);
      app.use(secureHotMiddleware);
    }

    if (this.enableDefaultRoute) {
      // Attach this last onto the root so the `adminPath` can overwrite it if
      // necessary
      app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, './server/default.html')));
    }

    // handle errors
    // eslint-disable-next-line no-unused-vars
    app.use(function(err, req, res, next) {
      console.error(err.stack);
      res.status(500).send('Error');
    });

    return app;
  }
}

module.exports = {
  AdminUIApp,
};
