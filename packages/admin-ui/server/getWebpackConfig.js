const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const { mode } = require('./env');

module.exports = function({ adminPath }) {
  return {
    mode,
    context: path.resolve(__dirname, '../src/'),
    entry: './index.js',
    output: {
      filename: 'bundle.js',
      publicPath: adminPath,
    },
    plugins: [
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
      ],
    },
  };
};
