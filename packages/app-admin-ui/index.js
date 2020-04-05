const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const { URLSearchParams } = require('url');
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
    hooks = path.resolve('./admin-ui/'),
    schemaName = 'public',
  } = {}) {
    if (adminPath === '/') {
      throw new Error("Admin path cannot be the root path. Try; '/admin'");
    }

    if (authStrategy && authStrategy.authType !== 'password' && !authStrategy.loginPath) {
      throw new Error('Keystone 5 Admin does not support the given auth strategy');
    }

    this.adminPath = adminPath;
    this.authStrategy = authStrategy;
    this.pages = pages;
    this.apiPath = apiPath;
    this.graphiqlPath = graphiqlPath;
    this.enableDefaultRoute = enableDefaultRoute;
    this.hooks = hooks;
    this._isAccessAllowed = isAccessAllowed;
    this._schemaName = schemaName;

    this.routes = {
      signinPath: `${this.adminPath}/signin`,
      signoutPath: `${this.adminPath}/signout`,
    };
    this.publicPaths = [this.routes.signinPath, this.routes.signoutPath];
  }

  getAdminMeta() {
    return {
      adminPath: this.adminPath,
      pages: this.pages,
      hooks: this.hooks,
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
      this._isAccessAllowed({ authentication: { item: req.user, listKey: req.authedListKey } })
    );
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
      ...keystone.getAdminMeta({ schemaName: this._schemaName }),
    };
  }

  prepareMiddleware({ keystone, distDir, dev }) {
    const { adminPath } = this;
    const app = express.Router();

    app.use(this.routes.signinPath, (req, res, next) => {
      if (this.isAccessAllowed(req)) {
        return res.redirect(req.query.redirect || this.adminPath);
      }
      if (req.user) {
        return res.redirect(req.query.redirect || '/');
      }
      if (this.authStrategy && this.authStrategy.loginPath) {
        const query = req.url.split('?')[1] || '';
        return res.redirect(`${this.authStrategy.loginPath}?${query}`);
      }
      next();
    });

    app.use(adminPath, (req, res, next) => {
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
        // For private pages, we want to redirect unauthenticated users back to signin page
        'text/html': () => {
          const isPublicUrl = this.publicPaths.includes(`${adminPath}${req.path}`);
          if (!isPublicUrl && !this.isAccessAllowed(req) && !req.user) {
            return res.redirect(
              `${this.routes.signinPath}?${new URLSearchParams({ redirect: req.originalUrl })}`
            );
          }
          next();
        },
      });
    });

    let middlewarePairs, mountPath;
    if (dev) {
      // ensure any non-resource requests are rewritten for history api fallback
      app.use(adminPath, (req, res, next) => {
        // TODO: make sure that this change is OK. (regex was testing on url, not path)
        // Changed because this was preventing adminui pages loading when a querystrings
        // was appended.

        if (/^[\w\/\-]+$/.test(req.path)) req.url = '/';
        next();
      });
      const adminMeta = this.getAdminUIMeta(keystone);
      middlewarePairs = this.createDevMiddleware({ adminMeta });
      mountPath = '/';
    } else {
      app.use(compression());
      middlewarePairs = this.createProdMiddleware({ distDir });
      mountPath = adminPath;
    }

    if (this.authStrategy) {
      for (const pair of middlewarePairs) {
        app.use(mountPath, (req, res, next) => {
          return this.isAccessAllowed(req)
            ? pair.secure(req, res, next)
            : pair.public(req, res, next);
        });
      }
    } else {
      for (const pair of middlewarePairs) {
        app.use(mountPath, pair.secure);
      }
    }

    if (this.enableDefaultRoute) {
      // Attach this last onto the root so the `adminPath` can overwrite it if
      // necessary
      app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, './server/default.html')));
    }

    if (dev) {
      // eslint-disable-next-line no-unused-vars
      app.use(function(err, req, res, next) {
        console.error(err.stack);
        res.status(500).send('Error');
      });
    }

    return app;
  }

  createProdMiddleware({ distDir }) {
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
      return [
        {
          secure: secureStaticMiddleware,
          public: publicStaticMiddleware,
        },
        {
          secure: secureFallbackMiddleware,
          public: publicFallbackMiddleware,
        },
      ];
    } else {
      return [
        {
          secure: secureStaticMiddleware,
        },
        {
          secure: secureFallbackMiddleware,
        },
      ];
    }
  }

  createDevMiddleware({ adminMeta }) {
    const webpackMiddlewareConfig = {
      publicPath: this.adminPath,
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

      return [
        {
          secure: secureMiddleware,
          public: publicMiddleware,
        },
        {
          secure: secureHotMiddleware,
          public: publicHotMiddleware,
        },
      ];
    } else {
      return [
        {
          secure: secureMiddleware,
        },
        {
          secure: secureHotMiddleware,
        },
      ];
    }
  }
}

module.exports = {
  AdminUIApp,
};
