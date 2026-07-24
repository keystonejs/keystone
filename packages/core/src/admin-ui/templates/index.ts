import path from 'node:path'

import type { AdminMetaSource } from '../../lib/admin-meta.ts'
import type { KeystoneConfig } from '../../types/index.ts'
import { appTemplate } from './app.ts'
import { createItemTemplate } from './create-item.ts'
import { documentTemplate } from './document.ts'
import { homeTemplate } from './home.ts'
import { itemTemplate } from './item.ts'
import { listTemplate } from './list.ts'
import { nextConfigTemplate } from './next-config.ts'
import { noAccessTemplate } from './no-access.ts'
import { pkgDir } from '../../pkg-dir.ts'

export function writeAdminFiles(config: KeystoneConfig, adminMeta: AdminMetaSource) {
  return [
    {
      mode: 'write' as const,
      src: nextConfigTemplate(config.ui?.basePath),
      outputPath: 'next.config.js',
    },
    {
      mode: 'copy' as const,
      inputPath: path.join(pkgDir, 'static', 'favicon.ico'),
      outputPath: 'public/favicon.ico',
    },
    {
      mode: 'write' as const,
      src: noAccessTemplate(config.session),
      outputPath: 'pages/no-access.js',
    },
    {
      mode: 'write' as const,
      src: appTemplate(config, adminMeta),
      outputPath: 'pages/_app.js',
    },
    {
      mode: 'write' as const,
      src: documentTemplate,
      outputPath: 'pages/_document.js',
    },
    { mode: 'write' as const, src: homeTemplate, outputPath: 'pages/index.js' },
    ...adminMeta.lists.flatMap(({ path, key }) => [
      { mode: 'write' as const, src: listTemplate(key), outputPath: `pages/${path}/index.js` },
      { mode: 'write' as const, src: itemTemplate(key), outputPath: `pages/${path}/[id].js` },
      {
        mode: 'write' as const,
        src: createItemTemplate(key),
        outputPath: `pages/${path}/create.js`,
      },
    ]),
  ]
}
