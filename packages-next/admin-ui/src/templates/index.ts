import { AppTemplate } from './App';
import { HomePageTemplate } from './HomePage';
import { ListPageTemplate } from './ListPage';
import { ItemPageTemplate } from './ItemPage';

import type { Keystone } from '@keystone-spike/types';
import { AdminFileToWrite } from '@keystone-spike/types';
import * as Path from 'path';

const pkgDir = Path.dirname(require.resolve('@keystone-spike/admin-ui/package.json'));

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
      mode: 'copy',
      inputPath: Path.join(pkgDir, 'static', 'no-access.js'),
      outputPath: 'pages/no-access.js',
    },
    {
      mode: 'write',
      outputPath: 'pages/_app.js',
      src: AppTemplate(keystone, { configFile }),
    },
    {
      mode: 'write',
      src: HomePageTemplate(keystone),
      outputPath: 'pages/index.js',
    },
    ...Object.values(keystone.adminMeta.lists)
      .map(list => {
        const { path } = list;
        return [
          {
            mode: 'write',
            src: ListPageTemplate(keystone, { list }),
            outputPath: `pages/${path}/index.js`,
          },
          {
            mode: 'write',
            src: ItemPageTemplate(keystone, { list }),
            outputPath: `pages/${path}/[id].js`,
          },
        ] as const;
      })
      .flat(),
  ];
};
