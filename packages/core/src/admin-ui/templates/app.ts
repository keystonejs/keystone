import Path from 'node:path'
import fs from 'node:fs'

import type { AdminMetaSource } from '../../lib/admin-meta'
import type { KeystoneConfig } from '../../types'

function isFileOrSymlinkToFile(dirent: fs.Dirent) {
  if (dirent.isFile()) return true
  if (dirent.isSymbolicLink() && fs.statSync(Path.join(dirent.parentPath, dirent.name)).isFile())
    return true
  return false
}

function doesConfigExist(dir: string, name: string) {
  try {
    const resolvedDir = Path.join(process.cwd(), dir)
    for (const dirent of fs.readdirSync(resolvedDir, { withFileTypes: true })) {
      if (
        (dirent.name === `${name}.ts` ||
          dirent.name === `${name}.tsx` ||
          dirent.name === `${name}.js`) &&
        isFileOrSymlinkToFile(dirent)
      ) {
        return true
      }
      if (
        dirent.name === name &&
        (dirent.isDirectory() ||
          (dirent.isSymbolicLink() &&
            fs.statSync(Path.join(resolvedDir, dirent.name)).isDirectory()))
      ) {
        const innerDir = Path.join(resolvedDir, name)
        for (const innerDirent of fs.readdirSync(innerDir, { withFileTypes: true })) {
          if (
            (innerDirent.name === 'index.ts' ||
              innerDirent.name === 'index.tsx' ||
              innerDirent.name === 'index.js') &&
            isFileOrSymlinkToFile(innerDirent)
          ) {
            return true
          }
        }
      }
    }
    return false
  } catch (err: any) {
    if (err.code === 'ENOENT') return false
    throw err
  }
}

export function appTemplate(config: KeystoneConfig, adminMeta: AdminMetaSource) {
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
  return `import { getApp } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/pages/App'

${allViews.map((views, i) => `import * as view${i} from ${views}`).join('\n')}

${
  doesConfigExist('.keystone/admin', 'config')
    ? `import * as packageAdminConfig from "../../../.keystone/admin/config"`
    : 'let packageAdminConfig = {}'
}

${
  doesConfigExist('admin', 'config')
    ? `import * as userAdminConfig from "../../../admin/config"`
    : 'let userAdminConfig = {}'
}

export default getApp({
  adminConfig: {
    ...packageAdminConfig,
    ...userAdminConfig
  },
  apiPath: "${config.graphql.path}",
  fieldViews: [${allViews.map((_, i) => `view${i}`)}],
})
`
}
