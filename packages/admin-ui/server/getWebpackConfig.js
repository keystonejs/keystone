const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const { mode } = require('./env');

module.exports = function({ adminMeta, adminPath, apiPath }) {
  return {
    mode,
    context: path.resolve(__dirname, '../client/'),
    devtool: mode === 'development' ? 'inline-source-map' : undefined,
    entry: './index.js',
    output: {
      filename: 'bundle.js',
      publicPath: adminPath,
    },
    plugins: [
      new webpack.DefinePlugin({
        KEYSTONE_ADMIN_META: JSON.stringify({
          adminPath,
          apiPath,
          ...adminMeta,
        }),
      }),
      new HtmlWebpackPlugin({
        title: 'KeystoneJS',
        template: 'index.html',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: [/node_modules(?!\/@keystone\/)/],
          use: [
            {
              loader: 'babel-loader',
            },
          ],
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: ['file-loader'],
        },
      ],
    },
  };
};
