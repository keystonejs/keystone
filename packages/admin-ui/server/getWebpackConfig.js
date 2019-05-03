const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const { enableDevFeatures, mode } = require('./env');

const isHerokuEnv = process.env.HEROKU === 'true';

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
      exclude: [
        /node_modules(?!\/@keystone-alpha\/admin-ui)/,
        // this only affects things while developing in the monorepo
        // we do this so we can use less memory on heroku, this uses less memory
        // since it doesn't have to compile these things with babel
        // note that the preconstruct aliases are also disabled on heroku to enable this
        // when we have static builds for the admin ui, we can remove this
        ...(isHerokuEnv ? [/@keystone-alpha\/field/, /@arch-ui/] : []),
      ],
      use: [
        {
          loader: 'babel-loader',
          options: {
            configFile: false,
            babelrc: false,
            presets: [
              [
                '@babel/env',
                { exclude: ['transform-regenerator', 'transform-async-to-generator'] },
              ],
              ['@babel/react', { development: enableDevFeatures }],
              '@babel/flow',
            ],
            plugins: [
              '@babel/plugin-syntax-dynamic-import',
              '@babel/proposal-class-properties',
              '@babel/proposal-object-rest-spread',
              'emotion',
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
      filename: `${entry}.js`,
      publicPath: adminMeta.adminPath,
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
