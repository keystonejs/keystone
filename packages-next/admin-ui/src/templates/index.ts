import { appTemplate } from './app';
import { homeTemplate } from './home';
import { listTemplate } from './list';
import { itemTemplate } from './item';
import { noAccessTemplate } from './no-access';

import type { Keystone } from '@keystone-next/types';
import { AdminFileToWrite } from '@keystone-next/types';
import * as Path from 'path';

const pkgDir = Path.dirname(require.resolve('@keystone-next/admin-ui/package.json'));

export { adminMetaSchemaExtension } from './adminMetaSchemaExtension';

export const writeAdminFiles = (keystone: Keystone, configFile: boolean): AdminFileToWrite[] => {
  return [
    {
      mode: 'copy',
      inputPath: Path.join(pkgDir, 'static', 'next.config.js'),
      outputPath: 'next.config.js',
    },
    {
      mode: 'copy',
      inputPath: Path.join(pkgDir, 'static', 'tsconfig.json'),
      outputPath: 'tsconfig.json',
    },
    {
      mode: 'write',
      outputPath: 'pages/no-access.js',
      src: noAccessTemplate(keystone),
    },
    {
      mode: 'write',
      outputPath: 'pages/_app.js',
      src: appTemplate(keystone, { configFile }),
    },
    {
      mode: 'write',
      src: homeTemplate(keystone),
      outputPath: 'pages/index.js',
    },
    ...Object.values(keystone.adminMeta.lists)
      .map(list => {
        const { path } = list;
        return [
          {
            mode: 'write',
            src: listTemplate(keystone, { list }),
            outputPath: `pages/${path}/index.js`,
          },
          {
            mode: 'write',
            src: itemTemplate(keystone, { list }),
            outputPath: `pages/${path}/[id].js`,
          },
        ] as const;
      })
      .flat(),
  ];
};
