import * as Path from 'path'
import type { GraphQLSchema } from 'graphql'
import {
  type AdminFileToWrite,
  type __ResolvedKeystoneConfig
} from '../../types'
import type { AdminMetaRootVal } from '../../lib/create-admin-meta'
import { adminConfigTemplate, adminLayoutTemplate } from './app'
import { homeTemplate } from './home'
import { listTemplate } from './list'
import { itemTemplate } from './item'
import { noAccessTemplate } from './no-access'
import { createItemTemplate } from './create-item'

export const writeAdminFiles = (
  config: __ResolvedKeystoneConfig,
  graphQLSchema: GraphQLSchema,
  adminMeta: AdminMetaRootVal,
  configFileExists: boolean
): AdminFileToWrite[] => {
  const ext = config.ui?.tsx ? 'tsx' : 'js'
  return [
    { mode: 'write', src: noAccessTemplate(config.session), outputPath: `no-access/page.${ext}` },
    { mode: 'write', src: adminLayoutTemplate(), overwrite: true, outputPath: `layout.${ext}` },
    {
      mode: 'write',
      src: adminConfigTemplate(
        adminMeta,
        graphQLSchema,
        { configFileExists },
        config.graphql?.path || '/api/graphql'
      ),
      overwrite: true,
      outputPath: `.admin/index.${ext}`,
    },
    { mode: 'write', src: homeTemplate, overwrite: true, outputPath: `page.${ext}` },
    { mode: 'write', src: listTemplate, outputPath: `[listKey]/page.${ext}` },
    { mode: 'write', src: itemTemplate, outputPath: `[listKey]/[id]/page.${ext}` },
    { mode: 'write', src: createItemTemplate, outputPath: `[listKey]/create/page.${ext}` },
  ]
}
