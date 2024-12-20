import Path from 'path'
import resolve from 'resolve'

import type { AdminMetaRootVal } from '../../lib/create-admin-meta'
import type { __ResolvedKeystoneConfig } from '../../types'

function doesConfigExist (path: string[]) {
  try {
    const configPath = Path.join(process.cwd(), ...path)
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

export function appTemplate (
  config: __ResolvedKeystoneConfig,
  adminMetaRootVal: AdminMetaRootVal,
) {
  const allViews = adminMetaRootVal.views.map(viewRelativeToProject => {
    const isRelativeToFile = viewRelativeToProject.startsWith('./') || viewRelativeToProject.startsWith('../')
    const viewRelativeToAppFile = isRelativeToFile ? '../../../' + viewRelativeToProject : viewRelativeToProject

    // we're not using serializePathForImport here because we want the thing you write for a view
    // to be exactly what you would put in an import in the project directory.
    // we're still using JSON.stringify to escape anything that might need to be though
    return JSON.stringify(viewRelativeToAppFile)
  })
  // -- TEMPLATE START
  return `import { getApp } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/pages/App'

${allViews.map((views, i) => `import * as view${i} from ${views}`).join('\n')}

${doesConfigExist(['.keystone', 'admin', 'config'])
  ? `import * as packageAdminConfig from "../../../.keystone/admin/config"`
  : 'let packageAdminConfig = {}'
}

${doesConfigExist(['admin', 'config'])
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
