const bodyParser = require('body-parser');
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');

const getWebpackConfig = require('./getWebpackConfig');

module.exports = class AdminUI {
  constructor(keystone) {
    this.keystone = keystone;
  }
  createDevMiddleware({ adminPath }) {
    const app = express();
    const webpackConfig = getWebpackConfig({ adminPath });
    const compiler = webpack(webpackConfig);

    // add the Admin GraphQL API
    const schema = this.keystone.getAdminSchema();
    const apiPath = `${adminPath}/api`;
    const graphiqlPath = `${adminPath}/graphiql`;
    app.use(apiPath, bodyParser.json(), graphqlExpress({ schema }));
    app.use(graphiqlPath, graphiqlExpress({ endpointURL: `${adminPath}/api` }));

    // ensure any non-resource requests are rewritten for history api fallback
    app.use(adminPath, (req, res, next) => {
      if (/^[\w\/]+$/.test(req.url)) req.url = '/';
      next();
    });

    // add the webpack dev middleware
    app.use(
      webpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
        stats: 'minimal',
      })
    );

    return app;
  }
};
