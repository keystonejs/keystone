import path from 'node:path'

import type { AdminMetaSource } from '../../lib/admin-meta'
import type { KeystoneConfig } from '../../types'
import { appTemplate } from './app'
import { createItemTemplate } from './create-item'
import { homeTemplate } from './home'
import { itemTemplate } from './item'
import { listTemplate } from './list'
import { nextConfigTemplate } from './next-config'
import { noAccessTemplate } from './no-access'

const pkgDir = path.dirname(require.resolve('@keystone-6/core/package.json'))

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
