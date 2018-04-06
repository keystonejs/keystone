const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const getWebpackConfig = require('./getWebpackConfig');

module.exports = class AdminUI {
  constructor(keystone) {
    this.keystone = keystone;
  }
  createDevMiddleware({ adminPath }) {
    const app = express();
    const webpackConfig = getWebpackConfig({ adminPath });
    const compiler = webpack(webpackConfig);

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
