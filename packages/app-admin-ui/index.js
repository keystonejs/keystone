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
    name = 'Keystone',
    adminPath = '/admin',
    apiPath = '/admin/api',
    graphiqlPath = '/admin/graphiql',
    authStrategy,
    pages,
    enableDefaultRoute = false,
    isAccessAllowed = () => true,
    hooks = path.resolve('./admin-ui/'),
    schemaName = 'public',
    adminMeta = {},
    defaultPageSize = 50,
    maximumPageSize = 1000,
  } = {}) {
    if (adminPath === '/') {
      throw new Error("Admin path cannot be the root path. Try; '/admin'");
    }

    if (authStrategy && authStrategy.authType !== 'password') {
      throw new Error('Keystone 5 Admin currently only supports the `PasswordAuthStrategy`');
    }

    if (schemaName === 'internal') {
      throw new Error(
        "The schemaName 'internal' is a reserved name cannot be used in the AdminUIApp."
      );
    }

    this.name = name;
    this.adminPath = adminPath;
    this.authStrategy = authStrategy;
    this.pages = pages;
    this.apiPath = apiPath;
    this.graphiqlPath = graphiqlPath;
    this.enableDefaultRoute = enableDefaultRoute;
    this.hooks = hooks;
    this.defaultPageSize = defaultPageSize;
    this.maximumPageSize = Math.max(defaultPageSize, maximumPageSize);
    this._isAccessAllowed = isAccessAllowed;
    this._schemaName = schemaName;
    this._adminMeta = adminMeta;
    this.routes = {
      signinPath: `${this.adminPath}/signin`,
      signoutPath: `${this.adminPath}/signout`,
    };
  }

  isAccessAllowed(req) {
    return (
      !this.authStrategy ||
      (req.user &&
        this._isAccessAllowed({ authentication: { item: req.user, listKey: req.authedListKey } }))
    );
  }

  build({ keystone, distDir }) {
    const builtAdminRoot = path.join(distDir, 'admin');
    const adminMeta = this.getAdminUIMeta(keystone);
    const compilers = [];
    const secureCompiler = webpack(
      getWebpackConfig({
        adminMeta,
        adminViews: this.getAdminViews({ keystone, includeLists: true }),
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
          adminViews: this.getAdminViews({ keystone, includeLists: false }),
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
    // This is exposed as the global `KEYSTONE_ADMIN_META` in the client.
    const { name, adminPath, apiPath, graphiqlPath, pages, hooks } = this;
    const { signinPath, signoutPath } = this.routes;
    const { lists } = keystone.getAdminMeta({ schemaName: this._schemaName });
    const authStrategy = this.authStrategy ? this.authStrategy.getAdminMeta() : undefined;

    // Normalize list adminConfig data, falling back to admin-level size defaults if necessary.
    Object.values(lists || {}).forEach(
      ({
        key,
        adminConfig: {
          defaultPageSize = this.defaultPageSize,
          defaultColumns,
          defaultSort,
          maximumPageSize = this.maximumPageSize,
          ...rest
        },
      }) => {
        lists[key].adminConfig = {
          defaultPageSize,
          defaultColumns: defaultColumns.replace(/\s/g, ''), // remove all whitespace
          defaultSort,
          maximumPageSize: Math.max(defaultPageSize, maximumPageSize),
          ...rest,
        };
      }
    );

    return {
      adminPath,
      apiPath,
      graphiqlPath,
      pages,
      hooks,
      signinPath,
      signoutPath,
      authStrategy,
      lists,
      name,
      ...this._adminMeta,
    };
  }

  getAdminViews({ keystone, includeLists }) {
    const { pages, hooks } = this;
    const { listViews } = includeLists
      ? keystone.getAdminViews({ schemaName: this._schemaName })
      : { listViews: {} };

    return { pages, hooks, listViews };
  }

  prepareMiddleware({ keystone, distDir, dev }) {
    const { adminPath } = this;
    const app = express.Router();

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
        // Without this, request with an 'Accept: */*' header get picked up by
        // the 'text/html' handler rather than the default
        '*/*': () => {
          // We need to reset the res 'Content-Type' otherwise it gets replaced by the format we've matched on: '*/*'.
          // Returning a wildcard mimetype causes problems if a 'X-Content-Type-Options: nosniff' header is also set.
          // See.. https://github.com/keystonejs/keystone/issues/2741
          const extension = path.extname(req.url);
          if (extension) res.type(extension);
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
      // ensure any non-resource requests are rewritten for history api fallback
      app.use(adminPath, (req, res, next) => {
        // TODO: make sure that this change is OK. (regex was testing on url, not path)
        // Changed because this was preventing adminui pages loading when a querystrings
        // was appended.

        if (/^[\w\/\-]+$/.test(req.path)) req.url = '/';
        next();
      });
    }

    if (!dev) {
      app.use(compression());
    }

    if (this.authStrategy) {
      // Short-circuit GET requests when the user already signed in (avoids
      // downloading UI bundle, doing a client side redirect, etc)
      app.get(this.routes.signinPath, (req, res, next) =>
        this.isAccessAllowed(req) ? res.redirect(this.adminPath) : next()
      );
    }

    const middlewarePairs = dev
      ? this.createDevMiddleware({ adminMeta: this.getAdminUIMeta(keystone), keystone })
      : this.createProdMiddleware({ distDir });
    for (const pair of middlewarePairs) {
      const middleware = (req, res, next) =>
        !this.authStrategy || this.isAccessAllowed(req)
          ? pair.secure(req, res, next)
          : pair.public(req, res, next);
      app.use(dev ? '/' : adminPath, middleware);
    }

    if (this.enableDefaultRoute) {
      // Attach this last onto the root so the `adminPath` can overwrite it if
      // necessary
      app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, './server/default.html')));
    }

    if (dev) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      app.use(function (err, req, res, next) {
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
    const middlewares = [
      { secure: express.static(secureBuiltRoot) },
      { secure: fallback('index.html', { root: secureBuiltRoot }) },
    ];
    if (this.authStrategy) {
      const publicBuiltRoot = path.join(builtAdminRoot, 'public');
      middlewares[0].public = express.static(publicBuiltRoot);
      middlewares[1].public = fallback('index.html', { root: publicBuiltRoot });
    }
    return middlewares;
  }

  createDevMiddleware({ adminMeta, keystone }) {
    const webpackMiddlewareConfig = {
      publicPath: this.adminPath,
      stats: 'none',
      logLevel: 'error',
    };
    const webpackHotMiddlewareConfig = { log: null };
    const secureCompiler = webpack(
      getWebpackConfig({
        adminMeta,
        adminViews: this.getAdminViews({ keystone, includeLists: true }),
        entry: 'index',
      })
    );

    const middlewares = [
      { secure: webpackDevMiddleware(secureCompiler, webpackMiddlewareConfig) },
      { secure: webpackHotMiddleware(secureCompiler, webpackHotMiddlewareConfig) },
    ];
    if (this.authStrategy) {
      // override lists so that schema and field views are excluded
      const publicCompiler = webpack(
        getWebpackConfig({
          adminMeta: { ...adminMeta, lists: {} },
          adminViews: this.getAdminViews({ keystone, includeLists: false }),
          entry: 'public',
        })
      );
      middlewares[0].public = webpackDevMiddleware(publicCompiler, webpackMiddlewareConfig);
      middlewares[1].public = webpackHotMiddleware(publicCompiler, webpackHotMiddlewareConfig);
    }
    return middlewares;
  }
}

module.exports = { AdminUIApp };
