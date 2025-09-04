import path from 'node:path'

import type { AdminMetaSource } from '../../lib/admin-meta'
import type { KeystoneConfig } from '../../types'
import { adminConfigTemplate, adminLayoutTemplate, adminRootLayoutTemplate } from './app'
import { createItemTemplate } from './create-item'
import { homeTemplate } from './home'
import { itemTemplate } from './item'
import { listTemplate } from './list'
import { nextConfigTemplate } from './next-config'
import { noAccessTemplate } from './no-access'

const pkgDir = path.dirname(require.resolve('@keystone-6/core/package.json'))

export function writeAdminFiles(
  config: KeystoneConfig,
  adminMeta: AdminMetaSource,
  projectAdminPath: string,
  srcExists: boolean
) {
  const ext = config.ui?.tsx ? 'tsx' : 'js'
  const nextExt = config.ui?.tsx ? 'ts' : 'mjs'
  return [
    {
      mode: 'write' as const,
      src: nextConfigTemplate(config.ui.tsx),
      outputPath: `${srcExists ? '../' : ''}../../next.config.${nextExt}`,
    },
    {
      mode: 'copy' as const,
      inputPath: path.join(pkgDir, 'static', 'favicon.ico'),
      outputPath: `${srcExists ? '../' : ''}../../public/favicon.ico`,
    },
    {
      mode: 'write' as const,
      src: noAccessTemplate(config.session),
      outputPath: `no-access/page.${ext}`,
    },
    { mode: 'write' as const, src: adminLayoutTemplate(), outputPath: `layout.${ext}` },
    { mode: 'write' as const, src: adminRootLayoutTemplate(), outputPath: `../layout.${ext}` },
    {
      mode: 'write' as const,
      src: adminConfigTemplate(config, adminMeta, projectAdminPath),
      outputPath: `.admin/index.${ext}`,
      overwrite: true,
    },
    { mode: 'write' as const, src: homeTemplate, outputPath: `page.${ext}` },
    { mode: 'write' as const, src: listTemplate, outputPath: `[listKey]/page.${ext}` },
    { mode: 'write' as const, src: itemTemplate, outputPath: `[listKey]/[id]/page.${ext}` },
    { mode: 'write' as const, src: createItemTemplate, outputPath: `[listKey]/create/page.${ext}` },
  ]
}
