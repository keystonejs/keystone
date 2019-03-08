const path = require('path');
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');
const withTranspileModules = require('@weco/next-plugin-transpile-modules');

module.exports = (nextConfig = {}) => {
  const { analyze, assetPrefix, adminMeta, webpack } = nextConfig;
  return withBundleAnalyzer(
    withTranspileModules({
      ...nextConfig,
      transpileModules: ['@keystone-alpha', '@arch-ui'],
      // Output bundle analysis
      ...(analyze && {
        analyzeServer: true,
        analyzeBrowser: true,
        bundleAnalyzerConfig: {
          server: {
            analyzerMode: 'static',
            reportFilename: path.resolve(analyze, 'server.html'),
          },
          browser: {
            analyzerMode: 'static',
            reportFilename: path.resolve(analyze, 'client.html'),
          },
        },
      }),
      env: {
        // This will enable/disable the graphiql links, etc.
        ENABLE_DEV_FEATURES: process.env.NODE_ENV !== 'production',
        ADMIN_META: adminMeta,
        // For our router
        assetPrefix,
      },
      publicRuntimeConfig: {
        // For next-prefixed
        // NOTE: Move to .env once https://github.com/hipstersmoothie/next-prefixed/issues/8 is fixed
        assetPrefix,
      },
      webpack(webpackConfig, options) {
        // We need to tell the babel loader where our config is located
        // otherwise it will try to load the one we use for our global project
        // (which doesn't include next-specific config).
        webpackConfig.module.rules.forEach(rule => {
          // There are two different rules we need to target, and they use
          // different config locations, so make sure we hit them both.
          const ruleConfig = rule.use || rule.loader;
          if (ruleConfig && ruleConfig.loader === 'next-babel-loader') {
            ruleConfig.options = ruleConfig.options || {};
            ruleConfig.options.configFile = path.resolve(__dirname, 'next-babel.config.js');
          }
        });

        webpackConfig.module.rules.push({
          test: /\.(png|svg|jpg|gif)$/,
          use: ['file-loader'],
        });

        // Our mini-loader here ensures that all the fields' views are
        // correctly loaded into the bundle without having to load _every_
        // field's view ahead of time.
        webpackConfig.module.rules.push({
          test: /FIELD_TYPES/,
          use: [
            {
              loader: '@keystone-alpha/field-views-loader',
              options: {
                adminMeta,
                // We inject the special `_label_` field for the Admin UI to
                // give a better UX.
                injectViews: {
                  _label_: require('@keystone-alpha/fields/types/Pseudolabel').views,
                },
              },
            },
          ],
        });

        // We're running two different next.js instances, but they share
        // components from a parent directory. By default; next will _never_
        // look in a parent directory for files that need to be transpiled.
        // To work around this, we have setup symlinks in the appropriate
        // places, then we disable symlink resolution so the next babel config
        // thinks the file is within the next directory, and so will transpile
        // it.
        webpackConfig.resolve.symlinks = false;

        webpackConfig.resolve.alias = {
          ...webpackConfig.resolve.alias,
          // we only want to bundle a single version of react
          // but we don't want to assume a consumer has the same version of react
          // that we use so we alias react the react resolved from the admin ui
          // which depends on the version of react that keystone uses
          react$: require.resolve('react'),
          'react-dom$': require.resolve('react-dom'),
        };

        if (options.isServer) {
          if (false /*is target: 'serverless'*/) {
            // serverless needs to rely on `main` first otherwise there are
            // issues when running ncc
            // See: https://github.com/zeit/next.js/issues/6246#issuecomment-462464687
            webpackConfig.resolve.mainFields = ['main', 'module'];
          } else {
            // Otherwise, we want to rely on the `module` field, as we assume it
            // to be a correct ESM module (which can also run on the server)
            webpackConfig.resolve.mainFields = ['module', 'main'];
          }
        }

        if (typeof webpack === 'function') {
          return webpack(webpackConfig, options);
        }

        return webpackConfig;
      },
    })
  );
};
