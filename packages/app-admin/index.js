const express = require('express');
const webpack = require('webpack');
const chalk = require('chalk');
const terminalLink = require('terminal-link');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const compression = require('compression');
const { createSessionMiddleware } = require('@keystone-alpha/session');
const path = require('path');
const fs = require('fs');
const fallback = require('express-history-api-fallback');

const pkgInfo = require('./package.json');

const getWebpackConfig = require('./server/getWebpackConfig');

module.exports = class AdminUI {
  constructor(
    keystone,
    {
      adminPath = '/admin',
      apiPath = '/admin/api',
      graphiqlPath = '/admin/graphiql',
      authStrategy,
      pages,
      disableDefaultRoute = false,
    } = {}
  ) {
    if (adminPath === '/') {
      throw new Error("Admin path cannot be the root path. Try; '/admin'");
    }

    if (authStrategy && authStrategy.authType !== 'password') {
      throw new Error('Keystone 5 Admin currently only supports the `PasswordAuthStrategy`');
    }

    this.keystone = keystone;
    this.adminPath = adminPath;
    this.authStrategy = authStrategy;
    this.pages = pages;
    this.apiPath = apiPath;
    this.graphiqlPath = graphiqlPath;
    this.disableDefaultRoute = disableDefaultRoute;

    this.routes = {
      signinPath: `${this.adminPath}/signin`,
      signoutPath: `${this.adminPath}/signout`,
      sessionPath: `${this.adminPath}/session`,
    };
  }

  getAdminMeta() {
    return {
      adminPath: this.adminPath,
      authList: this.authStrategy ? this.authStrategy.listKey : null,
      pages: this.pages,
      ...this.routes,
      withAuth: !!this.authStrategy,
    };
  }

  createSessionMiddleware() {
    const { signinPath, signoutPath, sessionPath } = this.routes;
    // This session allows the user to authenticate as part of the 'admin' audience.
    // This isn't used by anything just yet. In the near future we will set up the admin-ui
    // application and api to be non-public.
    const audiences = ['admin'];
    return createSessionMiddleware(
      { signinPath, signoutPath, sessionPath, successPath: this.adminPath },
      this.authStrategy,
      audiences
    );
  }

  build({ distDir }) {
    console.log('Building Admin UI!');

    const builtAdminRoot = path.join(distDir, 'admin');

    const adminMeta = this.getAdminUIMeta(this.keystone);

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

  prepareMiddleware({ port, distDir, dev }) {
    if (dev) {
      return this.createDevMiddleware({ distDir, port });
    } else {
      return this.createProdMiddleware({ distDir });
    }
  }

  createProdMiddleware({ distDir }) {
    const app = express.Router();

    app.use(compression());

    const builtAdminRoot = path.join(distDir, 'admin');
    if (!fs.existsSync(builtAdminRoot)) {
      throw new Error(
        'There are no Admin UI build artifacts. Please run `keystone build` before running `keystone start`'
      );
    }
    const secureBuiltRoot = path.join(builtAdminRoot, 'secure');
    const secureStaticMiddleware = express.static(secureBuiltRoot);
    const secureFallbackMiddleware = fallback('index.html', { root: secureBuiltRoot });

    if (this.authStrategy) {
      const publicBuiltRoot = path.join(builtAdminRoot, 'public');
      const publicStaticMiddleware = express.static(publicBuiltRoot);
      const publicFallbackMiddleware = fallback('index.html', { root: publicBuiltRoot });
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
      _app.use(this.createSessionMiddleware());
    }

    _app.use(this.adminPath, app);

    if (!this.disableDefaultRoute) {
      // Attach this last onto the root so the `this.adminPath` can overwrite it
      // if necessary
      _app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, './default.html')));
    }

    return _app;
  }

  createDevMiddleware({ port }) {
    const app = express();

    const { adminPath } = this;
    if (this.authStrategy) {
      app.use(this.createSessionMiddleware());
    }

    // ensure any non-resource requests are rewritten for history api fallback
    const url = `http://localhost:${port}${adminPath}`;
    const prettyUrl = chalk.blue(`${url}(/.*)?`);
    const clickableUrl = terminalLink(prettyUrl, url, { fallback: () => prettyUrl });

    console.log(`🔗 ${chalk.green('Keystone Admin UI:')} ${clickableUrl} (v${pkgInfo.version})`);

    app.use(adminPath, (req, res, next) => {
      // TODO: make sure that this change is OK. (regex was testing on url, not path)
      // Changed because this was preventing adminui pages loading when a querystrings
      // was appended.
      if (/^[\w\/\-]+$/.test(req.path)) req.url = '/';
      next();
    });

    // add the webpack dev middleware

    let adminMeta = this.getAdminUIMeta(this.keystone);

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

      app.use((req, res, next) => {
        return req.user ? secureHotMiddleware(req, res, next) : publicHotMiddleware(req, res, next);
      });
    } else {
      // No auth required? Everyone can access the "secure" area
      app.use(secureMiddleware);
      app.use(secureHotMiddleware);
    }

    if (!this.disableDefaultRoute) {
      // Attach this last onto the root so the `adminPath` can overwrite it if
      // necessary
      app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, './default.html')));
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
