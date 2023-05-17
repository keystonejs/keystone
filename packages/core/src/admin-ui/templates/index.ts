import * as Path from 'path';
import { GraphQLSchema } from 'graphql';
import type { KeystoneConfig, AdminFileToWrite } from '../../types';
import { AdminMetaRootVal } from '../system/createAdminMeta';
import { appTemplate } from './app';
import { homeTemplate } from './home';
import { listTemplate } from './list';
import { itemTemplate } from './item';
import { noAccessTemplate } from './no-access';
import { createItemTemplate } from './create-item';
import { nextConfigTemplate } from './next-config';

const pkgDir = Path.dirname(require.resolve('@keystone-6/core/package.json'));

export const writeAdminFiles = (
  config: KeystoneConfig,
  graphQLSchema: GraphQLSchema,
  adminMeta: AdminMetaRootVal,
  configFileExists: boolean
): AdminFileToWrite[] => {
  return [
    {
      mode: 'write',
      src: nextConfigTemplate(config.ui?.basePath),
      outputPath: 'next.config.js',
    },
    {
      mode: 'copy',
      inputPath: Path.join(pkgDir, 'static', 'favicon.ico'),
      outputPath: 'public/favicon.ico',
    },
    { mode: 'write', src: noAccessTemplate(config.session), outputPath: 'pages/no-access.js' },
    {
      mode: 'write',
      src: appTemplate(
        adminMeta,
        graphQLSchema,
        { configFileExists },
        config.graphql?.path || '/api/graphql'
      ),
      outputPath: 'pages/_app.js',
    },
    { mode: 'write', src: homeTemplate, outputPath: 'pages/index.js' },
    ...adminMeta.lists.flatMap(({ path, key }): AdminFileToWrite[] => [
      { mode: 'write', src: listTemplate(key), outputPath: `pages/${path}/index.js` },
      { mode: 'write', src: itemTemplate(key), outputPath: `pages/${path}/[id].js` },
      { mode: 'write', src: createItemTemplate(key), outputPath: `pages/${path}/create.js` },
    ]),
  ];
};
