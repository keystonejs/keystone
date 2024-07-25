import { type GraphQLSchema } from 'graphql'
import { type ResolvedKeystoneConfig } from '../../types'
import type { AdminMetaRootVal } from '../../lib/create-admin-meta'
import { adminConfigTemplate, adminLayoutTemplate, adminRootLayoutTemplate } from './app'
import { homeTemplate } from './home'
import { listTemplate } from './list'
import { itemTemplate } from './item'
import { noAccessTemplate } from './no-access'
import { createItemTemplate } from './create-item'
import { nextConfigTemplate } from './next-config'

export function writeAdminFiles (
  config: ResolvedKeystoneConfig,
  graphQLSchema: GraphQLSchema,
  adminMeta: AdminMetaRootVal,
  configFileExists: boolean,
  srcExists: boolean,
) {
  const ext = config.ui?.tsx ? 'tsx' : 'js'
  return [
    {
      mode: 'write' as const,
      src: nextConfigTemplate(),
      outputPath: `${srcExists ? '../' : ''}../../next.config.mjs`,
    },
    { mode: 'write' as const, src: noAccessTemplate(config.session), outputPath: `no-access/page.${ext}` },
    { mode: 'write' as const, src: adminLayoutTemplate(), outputPath: `layout.${ext}` },
    { mode: 'write' as const, src: adminRootLayoutTemplate(), outputPath: `../layout.${ext}` },
    {
      mode: 'write' as const,
      src: adminConfigTemplate(
        adminMeta,
        graphQLSchema,
        { configFileExists },
        config.graphql?.path || '/api/graphql',
        config.ui?.basePath || ''
      ),
      outputPath: `.admin/index.${ext}`,
      overwrite: true,
    },
    { mode: 'write' as const, src: homeTemplate, outputPath: `page.${ext}` },
    { mode: 'write' as const, src: listTemplate, outputPath: `[listKey]/page.${ext}` },
    { mode: 'write' as const, src: itemTemplate, outputPath: `[listKey]/[id]/page.${ext}` },
    { mode: 'write' as const, src: createItemTemplate, outputPath: `[listKey]/create/page.${ext}` },
  ]
}
