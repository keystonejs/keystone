import { appTemplate } from './app';
import { homeTemplate } from './home';
import { listTemplate } from './list';
import { itemTemplate } from './item';
import { noAccessTemplate } from './no-access';

import type { KeystoneSystem, KeystoneConfig } from '@keystone-next/types';
import { AdminFileToWrite } from '@keystone-next/types';
import * as Path from 'path';

const pkgDir = Path.dirname(require.resolve('@keystone-next/admin-ui/package.json'));

export { getAdminMetaSchema } from './adminMetaSchemaExtension';

export const writeAdminFiles = (
  session: KeystoneConfig['session'],
  system: KeystoneSystem,
  configFileExists: boolean,
  projectAdminPath: string
): AdminFileToWrite[] => [
  ...['next.config.js', 'tsconfig.json'].map(
    outputPath =>
      ({ mode: 'copy', inputPath: Path.join(pkgDir, 'static', outputPath), outputPath } as const)
  ),
  { mode: 'write', outputPath: 'pages/no-access.js', src: noAccessTemplate(session) },
  {
    mode: 'write',
    outputPath: 'pages/_app.js',
    src: appTemplate(system, { configFileExists, projectAdminPath }),
  },
  { mode: 'write', src: homeTemplate(system.adminMeta.lists), outputPath: 'pages/index.js' },
  ...Object.values(system.adminMeta.lists).map(
    ({ path, key }) =>
      ({ mode: 'write', src: listTemplate(key), outputPath: `pages/${path}/index.js` } as const)
  ),
  ...Object.values(system.adminMeta.lists).map(
    ({ path, key }) =>
      ({ mode: 'write', src: itemTemplate(key), outputPath: `pages/${path}/[id].js` } as const)
  ),
];
