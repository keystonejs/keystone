import * as Path from 'path';
import type { BaseKeystone, KeystoneConfig } from '@keystone-next/types';
import { AdminFileToWrite } from '@keystone-next/types';
import { GraphQLSchema } from 'graphql';
import { appTemplate } from './app';
import { homeTemplate } from './home';
import { listTemplate } from './list';
import { itemTemplate } from './item';
import { apiTemplate } from './api';
import { noAccessTemplate } from './no-access';

const pkgDir = Path.dirname(require.resolve('@keystone-next/admin-ui/package.json'));

export const writeAdminFiles = (
  config: KeystoneConfig,
  graphQLSchema: GraphQLSchema,
  keystone: BaseKeystone,
  configFileExists: boolean,
  projectAdminPath: string
): AdminFileToWrite[] => [
  ...['next.config.js', 'tsconfig.json'].map(
    outputPath =>
      ({ mode: 'copy', inputPath: Path.join(pkgDir, 'static', outputPath), outputPath } as const)
  ),
  { mode: 'write', outputPath: 'pages/no-access.js', src: noAccessTemplate(config.session) },
  {
    mode: 'write',
    outputPath: 'pages/_app.js',
    src: appTemplate(config, graphQLSchema, { configFileExists, projectAdminPath }),
  },
  { mode: 'write', src: homeTemplate, outputPath: 'pages/index.js' },
  ...Object.values(keystone.lists).map(
    ({ adminUILabels: { path }, key }) =>
      ({ mode: 'write', src: listTemplate(key), outputPath: `pages/${path}/index.js` } as const)
  ),
  ...Object.values(keystone.lists).map(
    ({ adminUILabels: { path }, key }) =>
      ({ mode: 'write', src: itemTemplate(key), outputPath: `pages/${path}/[id].js` } as const)
  ),
  ...(config.experimental?.enableNextJsGraphqlApiEndpoint
    ? [
        {
          mode: 'write' as const,
          src: apiTemplate,
          outputPath: 'pages/api/graphql.js',
        },
      ]
    : []),
];
