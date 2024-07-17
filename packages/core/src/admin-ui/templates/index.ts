import * as Path from 'path'
import { type GraphQLSchema } from 'graphql'
import {
  type __ResolvedKeystoneConfig
} from '../../types'
import { type AdminMetaRootVal } from '../../lib/create-admin-meta'
import { appTemplate } from './app'
import { homeTemplate } from './home'
import { listTemplate } from './list'
import { itemTemplate } from './item'
import { noAccessTemplate } from './no-access'
import { createItemTemplate } from './create-item'
import { nextConfigTemplate } from './next-config'

const pkgDir = Path.dirname(require.resolve('@keystone-6/core/package.json'))

export function writeAdminFiles (config: __ResolvedKeystoneConfig,
  graphQLSchema: GraphQLSchema,
  adminMeta: AdminMetaRootVal,
  configFileExists: boolean
) {
  return [
    {
      mode: 'write' as const,
      src: nextConfigTemplate(config.ui?.basePath),
      outputPath: 'next.config.js',
    },
    {
      mode: 'copy' as const,
      inputPath: Path.join(pkgDir, 'static', 'favicon.ico'),
      outputPath: 'public/favicon.ico',
    },
    { mode: 'write' as const, src: noAccessTemplate(config.session), outputPath: 'pages/no-access.js' },
    {
      mode: 'write' as const,
      src: appTemplate(
        adminMeta,
        graphQLSchema,
        { configFileExists },
        config.graphql?.path || '/api/graphql'
      ),
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
