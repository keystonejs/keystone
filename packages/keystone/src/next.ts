import execa from 'execa';
// @ts-ignore
import withPreconstruct from '@preconstruct/next';

let hasAlreadyStarted = false;

export const withKeystone =
  (internalConfig: any = {}) =>
  (
    phase:
      | 'phase-export'
      | 'phase-production-build'
      | 'phase-production-server'
      | 'phase-development-server',
    thing: any
  ) => {
    if (phase === 'phase-production-build') {
      execa.sync('node', [require.resolve('@keystone-6/core/bin/cli.js'), 'postinstall'], {
        stdio: 'inherit',
      });
    }
    if (phase === 'phase-development-server' && !hasAlreadyStarted) {
      hasAlreadyStarted = true;

      const cliPath = require.resolve('@keystone-6/core/bin/cli.js');

      execa.sync('node', [cliPath, 'postinstall', '--fix'], {
        stdio: 'inherit',
      });
      // for some reason things blow up with EADDRINUSE if the dev call happens synchronously here
      // so we wait a sec and then do it
      setTimeout(() => {
        execa('node', [cliPath], {
          stdio: 'inherit',
          env: { ...process.env, PORT: process.env.PORT || '8000' },
        });
      }, 100);
    }
    let internalConfigObj =
      typeof internalConfig === 'function' ? internalConfig(phase, thing) : internalConfig;

    let originalWebpack = internalConfigObj.webpack;
    internalConfigObj.webpack = (webpackConfig: any, options: any) => {
      if (options.isServer) {
        webpackConfig.externals = [
          ...webpackConfig.externals,
          '@keystone-6/core/___internal-do-not-use-will-break-in-patch/api',
          '@keystone-6/core/___internal-do-not-use-will-break-in-patch/next-graphql',
          '@keystone-6/core/next',
          '@keystone-6/core/system',
          '.prisma/client',
        ];
      }
      return originalWebpack ? originalWebpack(webpackConfig, options) : webpackConfig;
    };
    return withPreconstruct(internalConfigObj);
  };
