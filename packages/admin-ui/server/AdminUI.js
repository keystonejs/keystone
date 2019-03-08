const memoizeOne = require('memoize-one');
const falsey = require('falsey');
const express = require('express');
const path = require('path');
const next = require('next');
const nextBuild = require('next/dist/build').default;
const mkdirp = require('mkdirp');
const chalk = require('chalk');
const terminalLink = require('terminal-link');
const { isInternalUrl } = require('next-server/dist/server/utils');
const compression = require('compression');

const withKeystone = require('./next-plugin-keystone');
const router = require('../client/router');
const pkgInfo = require('../package.json');

const { createSessionMiddleware } = require('./sessionMiddleware');
function isNextUrl(prefix, url) {
  const unprefixedUrl = url.replace(new RegExp(`^${prefix}/+`), '/');
  return /^\/__webpack_hmr\//.test(unprefixedUrl) || isInternalUrl(unprefixedUrl);
}

const stripSlashes = (str = '') => str.replace(/^\/*(.*?)\/*$/, '$1');

const BUILD_DIR = 'admin';

module.exports = class AdminUI {
  constructor(keystone, config = {}) {
    this.keystone = keystone;

    if (config.adminPath && stripSlashes(config.adminPath) === '') {
      throw new Error("Admin path cannot be the root path. Try; '/admin'");
    }

    const adminPath = `/${stripSlashes(config.adminPath) || 'admin'}`;
    const { authStrategy } = config;
    if (authStrategy && authStrategy.authType !== 'password') {
      throw new Error('Keystone 5 Admin currently only supports the `PasswordAuthStrategy`');
    }
    this.authStrategy = authStrategy;

    this.config = {
      ...config,
      adminPath,
      signinPath: `${adminPath}/signin`,
      signoutPath: `${adminPath}/signout`,
      sessionPath: `${adminPath}/session`,
    };
  }

  getAdminMeta() {
    return {
      adminPath: this.config.adminPath,
      authList: this.authStrategy ? this.authStrategy.listKey : null,
      pages: this.config.pages,
      sessionPath: this.config.sessionPath,
      signinPath: this.config.signinPath,
      signoutPath: this.config.signoutPath,
      withAuth: !!this.authStrategy,
    };
  }

  createSessionMiddleware() {
    const { signinPath, signoutPath, sessionPath } = this.config;
    return createSessionMiddleware(
      { signinPath, signoutPath, sessionPath, successPath: this.config.adminPath },
      this.keystone.sessionManager,
      this.authStrategy
    );
  }

  getNextConfig({ apiPath, graphiqlPath, analyze = '' }) {
    const { adminPath } = this.config;

    const adminMeta = {
      adminPath,
      apiPath,
      graphiqlPath,
      ...this.getAdminMeta(),
      ...this.keystone.getAdminMeta(),
    };

    return withKeystone({
      analyze,
      // Tell next where our app is located, so it can correctly request all
      // of its internal scripts, bundles, etc.
      assetPrefix: adminPath,
      adminMeta,
    });
  }

  createServer({
    apiPath,
    graphiqlPath,
    // The directory where the next.js admin/pages/ dir lives
    nextDir = __dirname,
    // The directory where previously built output files exist
    // When set, nextDir is ignored
    distDir: outDir,
    port,
  }) {
    const { adminPath } = this.config;

    if (process.env.NODE_ENV !== 'production') {
      const url = `http://localhost:${port}${adminPath}`;
      const prettyUrl = chalk.blue(`${url}(/.*)?`);
      const clickableUrl = terminalLink(prettyUrl, url, { fallback: () => prettyUrl });

      console.log(`🔗 ${chalk.green('Keystone Admin UI:')} ${clickableUrl} (v${pkgInfo.version})`);
    }

    const routes = router(adminPath);

    // Make sure we're dealing absolute paths
    const absNextDir = path.resolve(nextDir);

    const preparations = [];

    const createNextApp = type => {
      return next({
        // When the output dir is set, it's assumed to be a production build
        dev: !outDir,
        dir: outDir ? path.resolve(outDir, BUILD_DIR, type) : path.join(absNextDir, type),
        conf: {
          ...this.getNextConfig({ apiPath, graphiqlPath }),
          ...(outDir && { distDir: '.' }),
        },
      });
    };

    // Why 2 next.js apps? We want to ensure that the entire contents of the
    // admin UI (including static assets, compiled files, js, css, etc), are
    // innacessible when the user is required to log in. This is particularly
    // important as we include a lot of information about the lists and fields
    // in the admin UI client bundles which we do not want to leak.
    // With a single next.js app, we can set authentication requirements on the
    // routes, but not on any of the assets.
    // So instead, we build two completely separate apps which will have their
    // own bundles, and route the request depending on if they're authenticated
    // or not (below).
    const adminApp = createNextApp('admin');
    preparations.push(() => adminApp.prepare());

    let loginApp;
    if (this.authStrategy) {
      loginApp = createNextApp('login');
      preparations.push(() => loginApp.prepare());
    }

    const handleAdmin = adminApp.getRequestHandler();

    // Only trigger the promises once, no matter how many times they're
    // requested below.
    // On first request, next will prepare its bundles, etc. All subsequent
    // requests will be fast, skipping the preparation step as the promises will
    // resolve in the next turn of the micro-task queue.
    const prepare = memoizeOne(() => Promise.all(preparations.map(prep => prep())));

    const server = express();

    server.use(compression());

    // Before any other routes, we might want to force the user to the login
    // page.
    server.use(adminPath, (req, res, passToLaterRoute) => {
      if (this.authStrategy) {
        if (!req.user) {
          // Force render the login page as a catch-all when not logged in
          return prepare().then(() => loginApp.render(req, res, routes.login.page, req.query));
        }

        if (new RegExp(`^${this.config.signinPath}`).test(req.originalUrl)) {
          // They're already logged in, redirect them to the admin UI URL
          return res.redirect(303, this.config.adminPath);
        } else if (/^\/signout/.test(req.path)) {
          // Render the signout page
          return prepare().then(() => loginApp.render(req, res, routes.signout.page, req.query));
        }
      }

      // When no auth is setup, or the user is logged in, fall through to the
      // following routes
      return passToLaterRoute();
    });

    Object.values(routes).forEach(route => {
      server.use(route.route, (req, res, passToLaterRoute) => {
        // Our root-level handler might accidentally intercept some necessary routes
        // for next, so we let them fall through
        if (isNextUrl(adminPath, req.originalUrl)) {
          return passToLaterRoute();
        }

        prepare().then(() =>
          adminApp.render(req, res, route.page, { ...req.query, ...req.params })
        );
      });
    });

    // Let next.js handle all its special file requests (_next, hmr, etc)
    server.use(adminPath, (req, res, passToLaterRoute) => {
      prepare().then(() => handleAdmin(req, res, passToLaterRoute));
    });

    return server;
  }

  async createBuild({
    apiPath,
    graphiqlPath,
    authStrategy,
    // A directory to dump webpack bundle analyzer output
    analyze,
    // The directory where the next.js admin/pages/ dir lives
    nextDir = __dirname,
    // The directory to output the built files
    outDir = path.join(process.cwd(), 'dist'),
  }) {
    if (authStrategy) {
      this.setAuthStrategy(authStrategy);
    }

    const nextConfig = this.getNextConfig({ apiPath, graphiqlPath, analyze });

    // Make sure we're dealing absolute paths
    const absOutDir = path.resolve(outDir, BUILD_DIR);
    const absNextDir = path.resolve(nextDir);

    if (falsey(process.env.DISABLE_LOGGING)) {
      console.log(`Building KeystoneJS Admin UI to ${path.relative(process.cwd(), outDir)}`);
    }

    const build = type => {
      // The directory containing the pages/ directory
      const inputDir = path.join(absNextDir, type);

      // The final resting place for our built code
      const finalOutDir = path.join(absOutDir, type);

      // Next.js requires the `distDir` to be relative to the input directory
      // containing the next.js pages/ directory.
      const distDir = path.relative(inputDir, finalOutDir);

      // Create the directory tree ready for next
      mkdirp.sync(finalOutDir);

      // Run next
      return nextBuild(inputDir, {
        ...nextConfig,
        distDir,
      });
    };

    await build('admin');

    if (this.authStrategy) {
      await build('login');
    }
  }
};
