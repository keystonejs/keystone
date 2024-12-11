import path from 'node:path'
import { type __ResolvedKeystoneConfig } from '../../types'
import { type AdminMetaRootVal } from '../../lib/create-admin-meta'
import { appTemplate } from './app'
import { homeTemplate } from './home'
import { listTemplate } from './list'
import { itemTemplate } from './item'
import { noAccessTemplate } from './no-access'
import { createItemTemplate } from './create-item'
import { nextConfigTemplate } from './next-config'

const pkgDir = path.dirname(require.resolve('@keystone-6/core/package.json'))

export function writeAdminFiles (
  config: __ResolvedKeystoneConfig,
  adminMeta: AdminMetaRootVal,
) {
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
      outputPath: 'pages/no-access.js'
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
      { mode: 'write' as const, src: createItemTemplate(key), outputPath: `pages/${path}/create.js` },
    ]),
  ]
}
