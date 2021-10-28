import Path from 'path';
import hashString from '@emotion/hash';
import {
  executeSync,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLUnionType,
  parse,
  FragmentDefinitionNode,
  SelectionNode,
} from 'graphql';
import { AdminMetaRootVal } from '../../types';
import { staticAdminMetaQuery, StaticAdminMetaQuery } from '../admin-meta-graphql';
import { serializePathForImport } from '../utils/serializePathForImport';

type AppTemplateOptions = { configFileExists: boolean; projectAdminPath: string };

export const appTemplate = (
  adminMetaRootVal: AdminMetaRootVal,
  graphQLSchema: GraphQLSchema,
  { configFileExists, projectAdminPath }: AppTemplateOptions,
  apiPath: string,
  isLiveReload: boolean
) => {
  const result = executeSync({
    document: staticAdminMetaQuery,
    schema: graphQLSchema,
    contextValue: { isAdminUIBuildProcess: true },
  });
  if (result.errors) {
    throw result.errors[0];
  }
  const { adminMeta } = result.data!.keystone;
  const adminMetaQueryResultHash = hashString(JSON.stringify(adminMeta));

  const allViews = adminMetaRootVal.views.map(views => {
    // during a live reload, we'll have paths from a webpack compilation which will make the paths
    // that __dirname/__filename/require.resolve return relative to the webpack's "context" option
    // which for Next, it's set to the directory of the Next project which is projectAdminPath here.
    // so to get absolute paths, we need to resolve them relative to the projectAdminPath
    // generally though, relative paths are problematic because
    // we don't know where to resolve them from so we disallow them
    // we're assuming that the relative paths we get
    // of course, this isn't necessarily true but it's kinda the best we can do
    // this means that if someone writes a relative path as a view during live reloading
    // they'll get a more confusing error than they would get at startup
    if (isLiveReload) {
      views = Path.resolve(projectAdminPath, views);
    } else if (!Path.isAbsolute(views)) {
      throw new Error(
        `Field views must be absolute paths, but ${JSON.stringify(
          views
        )} was provided. Use path.join(__dirname, './relative/path') or require.resolve('./relative/path') to get an absolute path.`
      );
    }
    const viewPath = Path.relative(Path.join(projectAdminPath, 'pages'), views);
    return serializePathForImport(viewPath);
  });
  // -- TEMPLATE START
  return `import { getApp } from '@keystone-next/keystone/___internal-do-not-use-will-break-in-patch/admin-ui/pages/App';

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
`;
  // -- TEMPLATE END
};

function getLazyMetadataQuery(
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
  ).selectionSet.selections as SelectionNode[];

  const queryType = graphqlSchema.getQueryType();
  if (queryType) {
    const getListByKey = (name: string) => adminMeta.lists.find(({ key }: any) => key === name);
    const fields = queryType.getFields();
    if (fields['authenticatedItem'] !== undefined) {
      const authenticatedItemType = fields['authenticatedItem'].type;
      if (
        !(authenticatedItemType instanceof GraphQLUnionType) ||
        authenticatedItemType.name !== 'AuthenticatedItem'
      ) {
        throw new Error(
          `The type of Query.authenticatedItem must be a type named AuthenticatedItem and be a union of types that refer to Keystone lists but it is "${authenticatedItemType.toString()}"`
        );
      }
      for (const type of authenticatedItemType.getTypes()) {
        const fields = type.getFields();
        const list = getListByKey(type.name);
        if (list === undefined) {
          throw new Error(
            `All members of the AuthenticatedItem union must refer to Keystone lists but "${type.name}" is in the AuthenticatedItem union but is not a Keystone list`
          );
        }
        let labelGraphQLField = fields[list.labelField];
        if (labelGraphQLField === undefined) {
          throw new Error(
            `The labelField for the list "${list.key}" is "${list.labelField}" but the GraphQL type does not have a field named "${list.labelField}"`
          );
        }
        let labelGraphQLFieldType = labelGraphQLField.type;
        if (labelGraphQLFieldType instanceof GraphQLNonNull) {
          labelGraphQLFieldType = labelGraphQLFieldType.ofType;
        }
        if (!(labelGraphQLFieldType instanceof GraphQLScalarType)) {
          throw new Error(
            `Label fields must be scalar GraphQL types but the labelField "${list.labelField}" on the list "${list.key}" is not a scalar type`
          );
        }
        const requiredArgs = labelGraphQLField.args.filter(
          arg => arg.defaultValue === undefined && arg.type instanceof GraphQLNonNull
        );
        if (requiredArgs.length) {
          throw new Error(
            `Label fields must have no required arguments but the labelField "${list.labelField}" on the list "${list.key}" has a required argument "${requiredArgs[0].name}"`
          );
        }
      }

      selections.push({
        kind: 'Field',
        name: { kind: 'Name', value: 'authenticatedItem' },
        selectionSet: {
          kind: 'SelectionSet',
          selections: authenticatedItemType.getTypes().map(({ name }) => ({
            kind: 'InlineFragment',
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: name } },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: getListByKey(name)!.labelField } },
              ],
            },
          })),
        },
      });
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
  };
}
