import Path from 'node:path'
import resolve from 'resolve'
import hashString from '@emotion/hash'
import {
  type ExecutionResult,
  type FragmentDefinitionNode,
  type GraphQLSchema,
  type SelectionNode,
  executeSync,
  parse,
} from 'graphql'
import { staticAdminMetaQuery, type StaticAdminMetaQuery } from '../admin-meta-graphql'
import type { AdminMetaRootVal } from '../../lib/create-admin-meta'
import type { __ResolvedKeystoneConfig } from '../../types'

function doesConfigExist (path: string[]) {
  try {
    const configPath = Path.join(process.cwd(), ...path)
    resolve.sync(configPath, { extensions: ['.ts', '.tsx', '.js'], preserveSymlinks: false })
    return true
  } catch (err: any) {
    if (err.code === 'MODULE_NOT_FOUND') return false
    throw err
  }
}

export function appTemplate (
  config: __ResolvedKeystoneConfig,
  adminMetaRootVal: AdminMetaRootVal,
  graphQLSchema: GraphQLSchema,
) {
  const result = executeSync({
    document: staticAdminMetaQuery,
    schema: graphQLSchema,
    contextValue: { isAdminUIBuildProcess: true },
  }) as ExecutionResult<StaticAdminMetaQuery>
  if (result.errors) throw result.errors[0]

  const { adminMeta } = result.data!.keystone
  const adminMetaQueryResultHash = hashString(JSON.stringify(adminMeta))

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
      adminMetaHash: "${adminMetaQueryResultHash}",
      apiPath: "${config.graphql.path}",
      fieldViews: [${allViews.map((_, i) => `view${i}`)}],
      lazyMetadataQuery: ${JSON.stringify(getLazyMetadataQuery(graphQLSchema, adminMeta))},
    })
  `
}

function getLazyMetadataQuery (
  graphqlSchema: GraphQLSchema,
  adminMeta: StaticAdminMetaQuery['keystone']['adminMeta']
) {
  const selections = (
    parse(`fragment x on y {
    keystone {
      adminMeta {
        lists {
          key
          fields {
            path
            createView {
              fieldMode
            }
          }
        }
      }
    }
  }`).definitions[0] as FragmentDefinitionNode
  ).selectionSet.selections as SelectionNode[]

  // We're returning the complete query AST here for explicit-ness
  return {
    kind: 'Document',
    definitions: [
      {
        kind: 'OperationDefinition',
        operation: 'query',
        selectionSet: { kind: 'SelectionSet', selections },
      },
    ],
  }
}
