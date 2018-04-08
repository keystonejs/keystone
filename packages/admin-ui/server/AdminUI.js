const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');

const getWebpackConfig = require('./getWebpackConfig');

module.exports = class AdminUI {
  constructor(keystone) {
    this.keystone = keystone;
  }
  createDevMiddleware({ adminPath, cookieSecret }) {
    const app = express();
    const apiPath = `${adminPath}/api`;

    // implement session management
    app.use(
      session({
        secret: cookieSecret,
        resave: false,
        saveUninitialized: false,
        name: 'keystone-admin.sid',
      })
    );

    app.get(`${apiPath}/session`, (req, res) => {
      res.json({ signedIn: !!req.session.signedIn });
    });

    app.get(`${apiPath}/signin`, (req, res) => {
      req.session.signedIn = true;
      res.json({ success: true });
    });

    app.get(`${apiPath}/signout`, (req, res, next) => {
      req.session.regenerate(err => {
        if (err) return next(err);
        res.json({ success: true });
      });
    });

    // add the Admin GraphQL API
    const schema = this.keystone.getAdminSchema();
    const graphiqlPath = `${adminPath}/graphiql`;
    app.use(apiPath, bodyParser.json(), graphqlExpress({ schema }));
    app.use(graphiqlPath, graphiqlExpress({ endpointURL: apiPath }));

    // ensure any non-resource requests are rewritten for history api fallback
    app.use(adminPath, (req, res, next) => {
      if (/^[\w\/]+$/.test(req.url)) req.url = '/';
      next();
    });

    // add the webpack dev middleware
    const adminMeta = this.keystone.getAdminMeta();
    const webpackConfig = getWebpackConfig({ adminMeta, adminPath });
    const compiler = webpack(webpackConfig);
    app.use(
      webpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
        stats: 'minimal',
      })
    );

    // handle errors
    // eslint-disable-next-line no-unused-vars
    app.use(function(err, req, res, next) {
      console.error(err.stack);
      res.status(500).send('Error');
    });

    return app;
  }
};
