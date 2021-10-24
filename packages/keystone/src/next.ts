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
    const cliPath = require.resolve('@keystone-next/keystone/bin/cli.js');

    if (phase === 'phase-production-build') {
      execa.sync('node', [cliPath, 'postinstall'], {
        stdio: 'inherit',
      });
    }

    if (phase === 'phase-development-server' && !hasAlreadyStarted) {
      hasAlreadyStarted = true;

      execa.sync('node', [cliPath, 'postinstall', '--fix'], {
        stdio: 'inherit',
      });

      execa('node', [cliPath], {
        stdio: 'inherit',
        env: { ...process.env, PORT: process.env.PORT || '8000' },
      });
    }
    let internalConfigObj =
      typeof internalConfig === 'function' ? internalConfig(phase, thing) : internalConfig;

    let originalWebpack = internalConfigObj.webpack;
    internalConfigObj.webpack = (webpackConfig: any, options: any) => {
      if (options.isServer) {
        webpackConfig.externals = [
          ...webpackConfig.externals,
          '@keystone-next/keystone/___internal-do-not-use-will-break-in-patch/api',
          '@keystone-next/keystone/___internal-do-not-use-will-break-in-patch/next-graphql',
          '@keystone-next/keystone/next',
          '@keystone-next/keystone/system',
          '.prisma/client',
        ];
      }
      return originalWebpack ? originalWebpack(webpackConfig, options) : webpackConfig;
    };
    return withPreconstruct(internalConfigObj);
  };
