const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const { enableDevFeatures, mode } = require('./env');

module.exports = function({ adminMeta, entry, outputPath }) {
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
      exclude: [/node_modules(?!(?:\/|\\)@keystone-alpha(?:\/|\\)admin-ui)/],
      use: [
        {
          loader: 'babel-loader',
          options: {
            configFile: false,
            babelrc: false,
            presets: [
              mode === 'production'
                ? require.resolve('babel-preset-react-app/prod')
                : require.resolve('babel-preset-react-app/dev'),
            ],
            plugins: [require.resolve('babel-plugin-emotion')],
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
          loader: '@keystone-alpha/field-views-loader',
          options: {
            adminMeta,
          },
        },
      ],
    });
  }
  const entryPath = `./${entry}.js`;
  return {
    mode,
    context: path.resolve(__dirname, '../client/'),
    devtool: mode === 'development' ? 'inline-source-map' : undefined,
    entry:
      mode === 'production' ? entryPath : [entryPath, 'webpack-hot-middleware/client?reload=true'],
    output: {
      path: outputPath,
      filename: 'js/[name].[hash].bundle.js',
      publicPath: adminMeta.adminPath + '/',
    },
    // TODO: We should pay attention to our bundle size at some point, but
    // right now this is just noise
    performance: { hints: false },
    plugins: [
      environmentPlugin,
      templatePlugin,
      ...(mode === 'development' ? [new webpack.HotModuleReplacementPlugin()] : []),
    ],
    module: {
      rules,
    },
    resolve: {
      alias: {
        // we only want to bundle a single version of react
        // but we don't want to assume a consumer has the same version of react
        // that we use so we alias react the react resolved from the admin ui
        // which depends on the version of react that keystone uses
        react$: require.resolve('react'),
        'react-dom$': require.resolve('react-dom'),
      },
    },
  };
};
