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
    isAccessAllowed = () => true,
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
    this._isAccessAllowed = isAccessAllowed;

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

  isAccessAllowed(req) {
    if (!this.authStrategy) {
      return true;
    }

    return (
      req.user &&
      this._isAccessAllowed({ authentication: { item: req.user, listKey: req.authedListKey } }) &&
      req.session.audiences &&
      req.session.audiences.includes('admin')
    );
  }

  createSessionMiddleware() {
    const { signinPath } = this.routes;

    const app = express();

    // Short-circuit GET requests when the user already signed in (avoids
    // downloading UI bundle, doing a client side redirect, etc)
    app.get(signinPath, (req, res, next) =>
      // This session is currently authenticated as part of the 'admin'
      // audience.
      this.isAccessAllowed(req) ? res.redirect(this.adminPath) : next()
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
    const app = express.Router();

    app.use(this.adminPath, (req, res, next) => {
      // Depending on what was requested, we might redirect the user based on
      // their access
      res.format({
        // For everything other than html requests, we have middleware to handle
        // it later down the line.
        // From the docs: "If the header is not specified, the first callback is
        // invoked."
        default: () => {
          next();
        },
        '*/*': () => {
          next();
        },
        // For page loads, we want to redirect back to signin page
        'text/html': () => {
          if (req.originalUrl !== this.routes.signinPath && !this.isAccessAllowed(req)) {
            return res.redirect(this.routes.signinPath);
          }
          next();
        },
      });
    });

    if (dev) {
      return this.createDevMiddleware({ keystone, app });
    } else {
      return this.createProdMiddleware({ keystone, distDir, app });
    }
  }

  createProdMiddleware({ distDir, app }) {
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
        return this.isAccessAllowed(req)
          ? secureStaticMiddleware(req, res, next)
          : publicStaticMiddleware(req, res, next);
      });

      app.use((req, res, next) => {
        // TODO: Better security, should check some property of the user
        return this.isAccessAllowed(req)
          ? secureFallbackMiddleware(req, res, next)
          : publicFallbackMiddleware(req, res, next);
      });
    } else {
      app.use(secureStaticMiddleware);
      app.use(secureFallbackMiddleware);
    }

    const _app = express.Router();

    if (this.authStrategy) {
      _app.use(this.createSessionMiddleware());
    }

    _app.use(this.adminPath, app);

    if (this.enableDefaultRoute) {
      // Attach this last onto the root so the `this.adminPath` can overwrite it
      // if necessary
      _app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, './server/default.html')));
    }

    return _app;
  }

  createDevMiddleware({ keystone, app }) {
    const { adminPath } = this;
    if (this.authStrategy) {
      app.use(this.createSessionMiddleware());
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

      app.use((req, res, next) => {
        // TODO: Better security, should check some property of the user
        return this.isAccessAllowed(req)
          ? secureMiddleware(req, res, next)
          : publicMiddleware(req, res, next);
      });

      app.use((req, res, next) => {
        return this.isAccessAllowed(req)
          ? secureHotMiddleware(req, res, next)
          : publicHotMiddleware(req, res, next);
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
