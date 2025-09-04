import Path from 'node:path'
import resolve from 'resolve'

import type { AdminMetaSource } from '../../lib/admin-meta'
import type { KeystoneConfig } from '../../types'

function doesConfigExist(adminPath: string, path: string[]) {
  try {
    const configPath = Path.join(adminPath, ...path)
    resolve.sync(configPath, {
      extensions: ['.ts', '.tsx', '.js'],
      preserveSymlinks: false,
    })
    return true
  } catch (err: any) {
    if (err.code === 'MODULE_NOT_FOUND') return false
    throw err
  }
}

export function adminConfigTemplate(
  config: KeystoneConfig,
  adminMeta: AdminMetaSource,
  adminPath: string
) {
  const allViews = adminMeta.views.map(viewRelativeToProject => {
    const isRelativeToFile =
      viewRelativeToProject.startsWith('./') || viewRelativeToProject.startsWith('../')
    const viewRelativeToAppFile = isRelativeToFile
      ? '../../../' + viewRelativeToProject
      : viewRelativeToProject

    // we're not using serializePathForImport here because we want the thing you write for a view
    // to be exactly what you would put in an import in the project directory.
    // we're still using JSON.stringify to escape anything that might need to be though
    return JSON.stringify(viewRelativeToAppFile)
  })
  // -- TEMPLATE START
  return `/* eslint-disable */\n${allViews
    .map((views, i) => `import * as view${i} from ${views}`)
    .join('\n')}

${
  doesConfigExist(adminPath, ['.admin', 'config'])
    ? `import * as packageAdminConfig from "./config"`
    : 'const packageAdminConfig = {}'
}

${
  doesConfigExist(adminPath, ['config'])
    ? `import * as userAdminConfig from "../config"`
    : 'const userAdminConfig = {}'
}
export const config = {
  adminConfig: {
    ...packageAdminConfig,
    ...userAdminConfig
  },
  apiPath: '${config.graphql.path}',
  adminPath: '${config.ui.basePath}',
  fieldViews: [${allViews.map((_, i) => `view${i}`)}],
};
`
  // -- TEMPLATE END
}

export function adminLayoutTemplate() {
  // -- TEMPLATE START
  return `'use client'
import { Layout } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/pages/App'
import { config } from './.admin'


export default function AdminLayout ({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Layout config={config as any}>
      {children}
    </Layout>
  )
}`
  // -- TEMPLATE END
}

export function adminRootLayoutTemplate() {
  // -- TEMPLATE START
  return `export default function RootLayout ({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`
  // -- TEMPLATE END
}
