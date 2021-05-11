import * as Path from 'path';
import type { AdminMetaRootVal, KeystoneConfig } from '@keystone-next/types';
import { AdminFileToWrite } from '@keystone-next/types';
import { GraphQLSchema } from 'graphql';
import { InitialisedList } from '@keystone-next/keystone/src/lib/core/types-for-lists';
import { appTemplate } from './app';
import { homeTemplate } from './home';
import { listTemplate } from './list';
import { itemTemplate } from './item';
import { apiTemplate } from './api';
import { noAccessTemplate } from './no-access';

const pkgDir = Path.dirname(require.resolve('@keystone-next/admin-ui/package.json'));

export const writeAdminFiles = (
  config: KeystoneConfig,
  lists: Record<string, InitialisedList>,
  graphQLSchema: GraphQLSchema,
  adminMeta: AdminMetaRootVal,
  configFileExists: boolean,
  projectAdminPath: string
): AdminFileToWrite[] => [
  ...['next.config.js', 'tsconfig.json'].map(
    outputPath =>
      ({ mode: 'copy', inputPath: Path.join(pkgDir, 'static', outputPath), outputPath } as const)
  ),
  { mode: 'write', src: noAccessTemplate(config.session), outputPath: 'pages/no-access.js' },
  {
    mode: 'write',
    src: appTemplate(lists, graphQLSchema, { configFileExists, projectAdminPath }),
    outputPath: 'pages/_app.js',
  },
  { mode: 'write', src: homeTemplate, outputPath: 'pages/index.js' },
  ...adminMeta.lists.map(
    ({ path, key }) =>
      ({ mode: 'write', src: listTemplate(key), outputPath: `pages/${path}/index.js` } as const)
  ),
  ...adminMeta.lists.map(
    ({ path, key }) =>
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
