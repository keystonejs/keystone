const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const { mode } = require('./env');

module.exports = function({ adminMeta, entry }) {
  const rules = [
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
  ];
  if (adminMeta.lists) {
    rules.push({
      test: /FIELD_TYPES/,
      use: [
        {
          loader: '@keystone/field-views-loader',
          options: {
            adminMeta,
          },
        },
      ],
    });
  }
  return {
    mode,
    context: path.resolve(__dirname, '../client/'),
    devtool: mode === 'development' ? 'inline-source-map' : undefined,
    entry: `./${entry}.js`,
    output: {
      filename: `${entry}.js`,
      publicPath: adminMeta.adminPath,
    },
    plugins: [
      new webpack.DefinePlugin({
        IS_PUBLIC_BUNDLE: entry === 'public',
        KEYSTONE_ADMIN_META: JSON.stringify(adminMeta),
      }),
      new HtmlWebpackPlugin({
        title: 'KeystoneJS',
        template: 'index.html',
      }),
    ],
    module: {
      rules,
    },
  };
};
