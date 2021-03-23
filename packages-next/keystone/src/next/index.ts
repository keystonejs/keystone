import { spawnSync, spawn } from 'child_process';
import fs from 'fs-extra';
import withPreconstruct from '@preconstruct/next';

let hasAlreadyStarted = false;

export const withKeystone = (internalConfig: any = {}) => (
  phase:
    | 'phase-export'
    | 'phase-production-build'
    | 'phase-production-server'
    | 'phase-development-server',
  thing: any
) => {
  if (phase === 'phase-development-server' || phase === 'phase-production-build') {
    fs.outputFileSync(
      'node_modules/.keystone/graphql.js',
      `import keystoneConfig from '../../keystone';
import { PrismaClient } from '.keystone/prisma'
import { nextGraphQLAPIRoute } from '@keystone-next/keystone/next/graphql';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default nextGraphQLAPIRoute(keystoneConfig, PrismaClient);
`
    );
    fs.outputFileSync(
      'node_modules/.keystone/graphql.d.ts',
      `export const config: any;
export default config;
`
    );
    fs.outputFileSync('node_modules/.keystone/types.js', ``);
    fs.outputFileSync(
      'node_modules/.keystone/types.d.ts',
      `export * from '../../.keystone/schema-types'`
    );
    fs.outputFileSync(
      'node_modules/.keystone/api.js',
      `import { createListsAPI } from '@keystone-next/keystone/next/api';
import keystoneConfig from '../../keystone';
import { PrismaClient } from '.keystone/prisma'

export const lists = createListsAPI(keystoneConfig, PrismaClient);
`
    );
    fs.outputFileSync(
      'node_modules/.keystone/api.d.ts',
      `import { KeystoneListsAPI } from '@keystone-next/types';
import { KeystoneListsTypeInfo } from './types';

export const lists: KeystoneListsAPI<KeystoneListsTypeInfo>;
`
    );

    fs.outputFileSync(
      'node_modules/.keystone/prisma.js',
      `module.exports = require('../../.keystone/prisma/generated-client')`
    );
  }
  if (phase === 'phase-development-server' && !hasAlreadyStarted) {
    hasAlreadyStarted = true;

    spawnSync('node', [require.resolve('@keystone-next/keystone/next/generate-prisma')], {
      stdio: 'inherit',
    });
    // for some reason things blow up with EADDRINUSE if the dev call happens synchronously here
    // so we wait a sec and then do it
    setTimeout(() => {
      spawn('node', [require.resolve('@keystone-next/keystone/bin/cli')], {
        stdio: 'inherit',
        env: { ...process.env, PORT: process.env.PORT || '3001' },
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
        '@keystone-next/keystone',
        '@keystone-next/adapter-prisma-legacy',
        '@keystone-next/keystone/next/graphql',
        '@keystone-next/keystone/next/api',
        '.keystone/prisma',
        /prisma[\/\\]generated-client/,
      ];
    }
    return originalWebpack ? originalWebpack(webpackConfig, options) : webpackConfig;
  };
  return withPreconstruct(internalConfigObj);
};
