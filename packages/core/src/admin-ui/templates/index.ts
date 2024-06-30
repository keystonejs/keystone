import type { GraphQLSchema } from 'graphql'
import {
  type AdminFileToWrite,
  type __ResolvedKeystoneConfig
} from '../../types'
import type { AdminMetaRootVal } from '../../lib/create-admin-meta'
import { adminConfigTemplate, adminLayoutTemplate, adminRootLayoutTemplate } from './app'
import { homeTemplate } from './home'
import { listTemplate } from './list'
import { itemTemplate } from './item'
import { noAccessTemplate } from './no-access'
import { createItemTemplate } from './create-item'
import { nextConfigTemplate } from './next-config'

export const writeAdminFiles = (
  config: __ResolvedKeystoneConfig,
  graphQLSchema: GraphQLSchema,
  adminMeta: AdminMetaRootVal,
  configFileExists: boolean,
  srcExists: boolean,
): AdminFileToWrite[] => {
  const ext = config.ui?.tsx ? 'tsx' : 'js'
  return [
    {
      mode: 'write',
      src: nextConfigTemplate(),
      outputPath: `${srcExists ? '../' : ''}../../next.config.mjs`,
    },
    { mode: 'write', src: noAccessTemplate(config.session), outputPath: `no-access/page.${ext}` },
    { mode: 'write', src: adminLayoutTemplate(), outputPath: `layout.${ext}` },
    { mode: 'write', src: adminRootLayoutTemplate(), outputPath: `../layout.${ext}` },
    {
      mode: 'write',
      src: adminConfigTemplate(
        adminMeta,
        graphQLSchema,
        { configFileExists },
        config.graphql?.path || '/api/graphql',
        config.ui?.basePath || ''
      ),
      overwrite: true,
      outputPath: `.admin/index.${ext}`,
    },
    { mode: 'write', src: homeTemplate, outputPath: `page.${ext}` },
    { mode: 'write', src: listTemplate, outputPath: `[listKey]/page.${ext}` },
    { mode: 'write', src: itemTemplate, outputPath: `[listKey]/[id]/page.${ext}` },
    { mode: 'write', src: createItemTemplate, outputPath: `[listKey]/create/page.${ext}` },
  ]
}
