import hashString from '@emotion/hash'
import {
  type ExecutionResult,
  type FragmentDefinitionNode,
  type GraphQLSchema,
  type SelectionNode,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLUnionType,
  Kind,
  executeSync,
  parse,
} from 'graphql'
import { staticAdminMetaQuery, type StaticAdminMetaQuery } from '../admin-meta-graphql'
import type { AdminMetaRootVal } from '../../lib/create-admin-meta'

type AppTemplateOptions = { configFileExists: boolean }

export function appTemplate (
  adminMetaRootVal: AdminMetaRootVal,
  graphQLSchema: GraphQLSchema,
  { configFileExists }: AppTemplateOptions,
  apiPath: string
) {
  const result = executeSync({
    document: staticAdminMetaQuery,
    schema: graphQLSchema,
    contextValue: { isAdminUIBuildProcess: true },
  }) as ExecutionResult<StaticAdminMetaQuery>
  if (result.errors) {
    throw result.errors[0]
  }
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
  // -- TEMPLATE START
  return `import { getApp } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/pages/App';

${allViews.map((views, i) => `import * as view${i} from ${views};`).join('\n')}

${
  configFileExists
    ? `import * as adminConfig from "../../../admin/config";`
    : 'var adminConfig = {};'
}

export default getApp({
  lazyMetadataQuery: ${JSON.stringify(getLazyMetadataQuery(graphQLSchema, adminMeta))},
  fieldViews: [${allViews.map((_, i) => `view${i}`)}],
  adminMetaHash: "${adminMetaQueryResultHash}",
  adminConfig: adminConfig,
  apiPath: "${apiPath}",
});
`
  // -- TEMPLATE END
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
          isHidden
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

  const queryType = graphqlSchema.getQueryType()
  if (queryType) {
    const getListByKey = (name: string) => adminMeta.lists.find(({ key }: any) => key === name)
    const fields = queryType.getFields()
    if (fields['authenticatedItem'] !== undefined) {
      const authenticatedItemType = fields['authenticatedItem'].type
      if (
        !(authenticatedItemType instanceof GraphQLUnionType) ||
        authenticatedItemType.name !== 'AuthenticatedItem'
      ) {
        throw new Error(
          `The type of Query.authenticatedItem must be a type named AuthenticatedItem and be a union of types that refer to Keystone lists but it is "${authenticatedItemType.toString()}"`
        )
      }
      for (const type of authenticatedItemType.getTypes()) {
        const fields = type.getFields()
        const list = getListByKey(type.name)
        if (list === undefined) {
          throw new Error(
            `All members of the AuthenticatedItem union must refer to Keystone lists but "${type.name}" is in the AuthenticatedItem union but is not a Keystone list`
          )
        }
        const labelGraphQLField = fields[list.labelField]
        if (labelGraphQLField === undefined) {
          throw new Error(
            `The labelField for the list "${list.key}" is "${list.labelField}" but the GraphQL type does not have a field named "${list.labelField}"`
          )
        }
        let labelGraphQLFieldType = labelGraphQLField.type
        if (labelGraphQLFieldType instanceof GraphQLNonNull) {
          labelGraphQLFieldType = labelGraphQLFieldType.ofType
        }
        if (!(labelGraphQLFieldType instanceof GraphQLScalarType)) {
          throw new Error(
            `Label fields must be scalar GraphQL types but the labelField "${list.labelField}" on the list "${list.key}" is not a scalar type`
          )
        }
        const requiredArgs = labelGraphQLField.args.filter(
          arg => arg.defaultValue === undefined && arg.type instanceof GraphQLNonNull
        )
        if (requiredArgs.length) {
          throw new Error(
            `Label fields must have no required arguments but the labelField "${list.labelField}" on the list "${list.key}" has a required argument "${requiredArgs[0].name}"`
          )
        }
      }

      selections.push({
        kind: Kind.FIELD,
        name: { kind: Kind.NAME, value: 'authenticatedItem' },
        selectionSet: {
          kind: Kind.SELECTION_SET,
          selections: authenticatedItemType.getTypes().map(({ name }) => ({
            kind: Kind.INLINE_FRAGMENT,
            typeCondition: { kind: Kind.NAMED_TYPE, name: { kind: Kind.NAME, value: name } },
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: [
                { kind: Kind.FIELD, name: { kind: Kind.NAME, value: 'id' } },
                {
                  kind: Kind.FIELD,
                  name: { kind: Kind.NAME, value: getListByKey(name)!.labelField },
                },
              ],
            },
          })),
        },
      })
    }
  }

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
