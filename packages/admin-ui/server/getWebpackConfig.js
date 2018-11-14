const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const { enableDevFeatures, mode } = require('./env');

module.exports = function({ adminMeta, entry }) {
  const faviconPlugin = new HtmlWebpackPlugin({
    favicon: 'assets/favicon.ico',
  });
  const templatePlugin = new HtmlWebpackPlugin({
    title: 'KeystoneJS',
    template: 'index.html',
  });
  const environmentPlugin = new webpack.DefinePlugin({
    ENABLE_DEV_FEATURES: enableDevFeatures,
    IS_PUBLIC_BUNDLE: entry === 'public',
    KEYSTONE_ADMIN_META: JSON.stringify(adminMeta),
  });

  const rules = [
    {
      test: /\.js$/,
      exclude: [/node_modules(?!\/@voussoir\/)/],
      use: [
        {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              ['env', { exclude: ['transform-regenerator', 'transform-async-to-generator'] }],
              'react',
              'flow',
            ],
            plugins: [
              'transform-class-properties',
              'transform-object-rest-spread',
              ['emotion', enableDevFeatures ? { sourceMap: true } : {}],
              ...(enableDevFeatures ? ['transform-react-jsx-source'] : []),
            ],
          },
        },
      ],
    },
    {
      test: /\.(png|svg|jpg|gif)$/,
      use: ['file-loader'],
    },
    // This is a workaround for a problem with graphql@0.13.x. It can be removed
    // once we upgrade to graphql@14.0.2.
    // https://github.com/zeit/next.js/issues/5233#issuecomment-424738510
    {
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    },
  ];
  if (adminMeta.lists) {
    rules.push({
      test: /FIELD_TYPES/,
      use: [
        {
          loader: '@voussoir/field-views-loader',
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
    // TODO: We should pay attention to our bundle size at some point, but
    // right now this is just noise
    performance: { hints: false },
    plugins: [
      faviconPlugin,
      environmentPlugin,
      templatePlugin,
    ],
    module: {
      rules,
    },
  };
};
