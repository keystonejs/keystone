const qs = require('qs');
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const webpack = require('webpack');
const { apolloUploadExpress } = require('apollo-upload-server');
const webpackDevMiddleware = require('webpack-dev-middleware');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');

const getWebpackConfig = require('./getWebpackConfig');

function injectQueryParams({ url, params, overwrite = true }) {
  const parsedUrl = new URL(url);
  let queryObject = qs.parse(parsedUrl.search.slice(1));
  if (overwrite) {
    queryObject = {
      ...queryObject,
      ...params,
    };
  } else {
    queryObject = {
      ...params,
      ...queryObject,
    };
  }
  parsedUrl.search = qs.stringify(queryObject);
  return parsedUrl.toString();
}

function getAbsoluteUrl(req, path) {
  return `${req.protocol}://${req.get('host')}${path}`;
}

module.exports = class AdminUI {
  constructor(keystone, config) {
    this.keystone = keystone;

    if (config.adminPath === '/') {
      throw new Error("Admin path cannot be the root path. Try; '/admin'");
    }

    this.adminPath = config.adminPath;
    // TODO: Figure out how to have auth & non-auth URLs share the same path
    this.adminAuthPath = `${config.adminPath}_auth`;
    this.graphiqlPath = `${this.adminPath}/graphiql`;
    this.apiPath = `${this.adminPath}/api`;

    this.config = {
      ...config,
      signinUrl: `${this.adminAuthPath}/signin`,
      signoutUrl: `${this.adminAuthPath}/signout`,
      sessionUrl: `${this.adminAuthPath}/session`,
    };

    this.signin = this.signin.bind(this);
    this.signout = this.signout.bind(this);
    this.session = this.session.bind(this);
  }

  async signin(req, res, next) {
    try {
      // TODO: Don't hard code this auth strategy, use the one passed in
      // TODO: How could we support, for example, the twitter auth flow?
      const result = await this.keystone.auth.User.password.validate({
        username: req.body.username,
        password: req.body.password,
      });

      if (!result.success) {
        const htmlResponse = () => {
          const signinUrl = this.config.signinUrl;
          /*
           * This works, but then webpack (or react-router?) is unable to match
           * the URL when there's a query param, which is... odd :/
          const signinUrl = injectQueryParams({
            url: getAbsoluteUrl(req, this.config.signinUrl),
            params: { redirectTo: req.body.redirectTo },
            overwrite: false,
          });
          */

          // TODO - include some sort of error in the page
          res.redirect(signinUrl);
        };
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

    const htmlResponse = () =>
      res.redirect(req.body.redirectTo || admin.adminPath);
    return res.format({
      default: htmlResponse,
      'text/html': htmlResponse,
      'application/json': () => res.json({ success: true }),
    });
  }

  async signout(req, res, next) {
    try {
      await this.keystone.session.destroy(req);
    } catch (e) {
      return next(e);
    }

    return res.format({
      default: () => {
        next();
      },
      'text/html': () => {
        next();
      },
      'application/json': () => {
        res.json({ success: true });
      },
    });
  }

  session(req, res) {
    const result = {
      signedIn: !!req.user,
      user: req.user ? { id: req.user.id, name: req.user.name } : undefined,
    };
    res.json(result);
  }

  getAdminMeta() {
    return {
      withAuth: !!this.config.authStrategy,
      adminAuthPath: this.config.adminAuthPath,
      signinUrl: this.config.signinUrl,
      signoutUrl: this.config.signoutUrl,
      sessionUrl: this.config.sessionUrl,
    };
  }

  createSessionMiddleware({ cookieSecret }) {
    if (!this.config.authStrategy) {
      return (req, res, next) => next();
    }

    const app = express();

    const sessionHandler = session({
      secret: cookieSecret,
      resave: false,
      saveUninitialized: false,
      name: 'keystone-admin.sid',
    });

    // implement session management
    app.use(this.adminPath, sessionHandler);
    app.use(this.adminAuthPath, sessionHandler);

    // NOTE: These are POST only. The GET versions (the UI) are handled by the
    // main server
    app.post(
      this.config.signinUrl,
      bodyParser.json(),
      bodyParser.urlencoded(),
      this.signin
    );
    app.post(this.config.signoutUrl, this.signout);
    app.use(
      this.keystone.session.validate({
        valid: ({ req, item }) => (req.user = item),
      })
    );
    app.get(this.config.sessionUrl, this.session);

    // NOTE: No auth check on this.adminAuthPath, that's because we rely on the
    // UI code to only handle the signin/signout routes.
    // THIS IS NOT SECURE! We need proper server-side handling of this, and
    // split the signin/out pages into their own bundle so we don't leak admin
    // data to the browser.
    const authCheck = (req, res, next) => {
      if (!req.user) {
        const signinUrl = this.config.signinUrl;
        /*
         * This works, but then webpack (or react-router?) is unable to match
         * the URL when there's a query param, which is... odd :/
        const signinUrl = injectQueryParams({
          url: getAbsoluteUrl(req, this.config.signinUrl),
          params: { redirectTo: req.originalUrl },
          overwrite: true,
        });
        */
        return res.status(401).redirect(signinUrl);
      }
      // All logged in, so move on to the next matching route
      next();
    };
    app.use(`${this.adminPath}`, authCheck);
    app.use(`${this.adminPath}/*`, authCheck);
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

    // ensure any non-resource requests are rewritten for history api fallback
    const nonResourceRewrite = (req, res, next) => {
      if (/^[\w\/\-]+$/.test(req.url)) req.url = '/';
      next();
    };
    app.use(this.adminPath, nonResourceRewrite);
    app.use(this.adminAuthPath, nonResourceRewrite);

    // add the webpack dev middleware
    // TODO: Replace with local server so we can add ACL / stop leaking admin
    // data when not logged in
    const webpackConfig = getWebpackConfig({
      adminMeta: {
        ...this.getAdminMeta(),
        ...this.keystone.getAdminMeta(),
      },
      publicPath: this.adminPath,
      adminPath: this.adminPath,
      apiPath: this.apiPath,
      graphiqlPath: this.graphiqlPath,
    });

    const compiler = webpack(webpackConfig);
    this.webpackMiddleware = webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
      stats: 'minimal',
    });
    app.use(this.webpackMiddleware);

    if (this.config.authStrategy) {
      const authWebpackConfig = getWebpackConfig({
        adminMeta: {
          ...this.getAdminMeta(),
          ...this.keystone.getAdminMeta(),
        },
        publicPath: this.adminAuthPath,
        adminPath: this.adminPath,
        apiPath: this.apiPath,
        graphiqlPath: this.graphiqlPath,
      });
      const authCompiler = webpack(authWebpackConfig);
      const authWebpackMiddleware = webpackDevMiddleware(authCompiler, {
        publicPath: this.adminAuthPath,
        stats: 'minimal',
      });
      app.use(authWebpackMiddleware);
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
