import * as Path from 'path';
import { GraphQLSchema } from 'graphql';
import type { AdminMetaRootVal, KeystoneConfig, AdminFileToWrite } from '../../types';
import { appTemplate } from './app';
import { homeTemplate } from './home';
import { listTemplate } from './list';
import { itemTemplate } from './item';
import { apiTemplate } from './api';
import { noAccessTemplate } from './no-access';

const pkgDir = Path.dirname(require.resolve('@keystone-next/keystone/package.json'));

export const writeAdminFiles = (
  config: KeystoneConfig,
  graphQLSchema: GraphQLSchema,
  adminMeta: AdminMetaRootVal,
  configFileExists: boolean,
  projectAdminPath: string,
  isLiveReload: boolean
): AdminFileToWrite[] => {
  if (
    config.experimental?.enableNextJsGraphqlApiEndpoint &&
    config.graphql?.path &&
    !config.graphql.path.startsWith('/api/')
  ) {
    throw new Error(
      'config.graphql.path must start with "/api/" when using config.experimental.enableNextJsGraphqlApiEndpoint'
    );
  }
  return [
    ...['next.config.js', 'tsconfig.json'].map(
      outputPath =>
        ({ mode: 'copy', inputPath: Path.join(pkgDir, 'static', outputPath), outputPath } as const)
    ),
    { mode: 'write', src: noAccessTemplate(config.session), outputPath: 'pages/no-access.js' },
    {
      mode: 'write',
      src: appTemplate(
        adminMeta,
        graphQLSchema,
        { configFileExists, projectAdminPath },
        config.graphql?.path || '/api/graphql',
        isLiveReload
      ),
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
            outputPath: `pages/${config.graphql?.path || '/api/graphql'}.js`,
          },
        ]
      : []),
  ];
};
