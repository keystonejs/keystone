import { type GraphQLSchema, } from 'graphql'
import type { AdminMetaRootVal } from '../../lib/create-admin-meta'

type AppTemplateOptions = { configFileExists: boolean }

export function appTemplate (
  adminMetaRootVal: AdminMetaRootVal,
  _: GraphQLSchema,
  { configFileExists }: AppTemplateOptions,
  apiPath: string
) {
  const allViews = adminMetaRootVal.views.map(viewRelativeToProject => {
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
  return `import { getApp } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/pages/App';

${allViews.map((views, i) => `import * as view${i} from ${views};`).join('\n')}

${
  configFileExists
    ? `import * as adminConfig from "../../../admin/config";`
    : 'var adminConfig = {};'
}

export default getApp({
  fieldViews: [${allViews.map((_, i) => `view${i}`)}],
  adminConfig: adminConfig,
  apiPath: "${apiPath}",
});
`
  // -- TEMPLATE END
}
