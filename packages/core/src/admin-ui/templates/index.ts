import path from 'path'
import type { KeystoneConfig } from '../../types'
import type { AdminMetaSource } from '../../lib/create-admin-meta'
import { homeTemplate } from './home'
import { listTemplate } from './list'
import { itemTemplate } from './item'
import { noAccessTemplate } from './no-access'
import { createItemTemplate } from './create-item'
import { nextConfigTemplate } from './next-config'
import { layoutTemplate } from './app'

const pkgDir = path.dirname(require.resolve('@keystone-6/core/package.json'))

export function writeAdminFiles(config: KeystoneConfig, adminMeta: AdminMetaSource) {
  const appDirPath = `app${config.ui.basePath}/(admin)`
  return [
    {
      mode: 'write' as const,
      src: nextConfigTemplate,
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
      outputPath: `${appDirPath}/no-access/page.js`,
    },
    {
      mode: 'write' as const,
      src: layoutTemplate(config, adminMeta, appDirPath),
      outputPath: `${appDirPath}/layout.js`,
    },
    { mode: 'write' as const, src: homeTemplate, outputPath: `${appDirPath}/page.js` },
    ...adminMeta.lists.flatMap(({ path, key }) => [
      {
        mode: 'write' as const,
        src: listTemplate(key),
        outputPath: `${appDirPath}/${path}/page.js`,
      },
      {
        mode: 'write' as const,
        src: itemTemplate(key),
        outputPath: `${appDirPath}/${path}/[id]/page.js`,
      },
      {
        mode: 'write' as const,
        src: createItemTemplate(key),
        outputPath: `${appDirPath}/${path}/create/page.js`,
      },
    ]),
  ]
}
