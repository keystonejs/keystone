import type { Keystone } from '@keystone-spike/types';
import hashString from '@emotion/hash';
import {
  executeSync,
  DocumentNode,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLUnionType,
  InlineFragmentNode,
} from 'graphql';
import { staticAdminMetaQuery } from '../admin-meta-graphql';

type AppTemplateOptions = {
  configFile: boolean;
};

export const appTemplate = (keystone: Keystone, { configFile }: AppTemplateOptions) => {
  const authenticatedItemQuery = getAuthenticatedItemQuery(keystone.graphQLSchema);

  const result = executeSync({
    document: staticAdminMetaQuery,
    schema: keystone.graphQLSchema,
    contextValue: {
      isAdminUIBuildProcess: true,
    },
  });
  if (result.errors) {
    throw result.errors[0];
  }
  const adminMetaQueryResultHash = hashString(JSON.stringify(result.data!.keystone.adminMeta));
  // -- TEMPLATE START
  return `
import React from 'react';

import { KeystoneProvider, initAdminMeta } from '@keystone-spike/admin-ui';
import { Core } from '@keystone-ui/core';

${keystone.views.map((view, i) => `import * as view${i} from ${JSON.stringify(view)}`).join('\n')}

${configFile ? `import * as adminConfig from "../../../admin/config";` : 'const adminConfig = {};'}

const fieldViews = [${keystone.views.map((x, i) => `view${i}`)}];
const customFieldViews = {};

const authenticatedItemQuery = ${
    authenticatedItemQuery ? JSON.stringify(authenticatedItemQuery) : 'undefined'
  };

export default function App({ Component, pageProps }) {
  return (
    <KeystoneProvider
      adminConfig={adminConfig}
      adminMetaHash="${adminMetaQueryResultHash}"
      fieldViews={fieldViews}
      customFieldViews={customFieldViews}
      authenticatedItemQuery={authenticatedItemQuery}
    >
      <Core>
        <Component {...pageProps} />
      </Core>
    </KeystoneProvider>
  );
}
  `;
  // -- TEMPLATE END
};

function getAuthenticatedItemQuery(graphqlSchema: GraphQLSchema): DocumentNode | undefined {
  const queryType = graphqlSchema.getQueryType();
  if (queryType) {
    const fields = queryType.getFields();
    // TODO: there should be a interface (as in GraphQL interface) which has id and _label_ on it
    // in Keystone... with that, the query below could be simplified to:
    // query {
    //   authenticatedItem {
    //     ... on ListItem {
    //       id
    //       _label_
    //     }
    //   }
    // }

    if (fields['authenticatedItem'] !== undefined) {
      const authenticatedItemType = fields['authenticatedItem'].type;
      if (
        !(authenticatedItemType instanceof GraphQLUnionType) ||
        authenticatedItemType.name !== 'AuthenticatedItem'
      ) {
        throw new Error(
          `The type of Query.authenticatedItem must be a type named AuthenticatedItem and be a union of types that have _label_ and id fields but it is "${authenticatedItemType.toString()}"`
        );
      }
      for (const type of authenticatedItemType.getTypes()) {
        const fields = type.getFields();
        const types = {
          _label_: 'String',
          id: 'ID',
        };
        for (const field of ['id', '_label_'] as const) {
          const graphqlField = fields[field];
          if (graphqlField === undefined) {
            throw new Error(
              `All types in the AuthenticatedItem union must contain an "${field}" field of type ${types[field]} but it does not exist for ${type.name}`
            );
          }
          let fieldType = graphqlField.type;
          if (fieldType instanceof GraphQLNonNull) {
            fieldType = fieldType.ofType;
          }
          if (!(fieldType instanceof GraphQLScalarType) || fieldType.name !== types[field]) {
            throw new Error(
              `All types in the AuthenticatedItem union must contain an "${field}" field of type ${
                types[field]
              } but the field is of type ${fieldType.toString()} on ${type.name}`
            );
          }
          const args = Object.keys(graphqlField.args);
          if (args.length) {
            throw new Error(
              `All types in the AuthenticatedItem union must contain an "${field}" field that accepts no arguments but the "${field}" field on ${
                type.name
              } accepts the following arguments: ${args.map(x => JSON.stringify(x)).join(', ')}`
            );
          }
        }
      }
      // We're returning the complete query AST here for explicit-ness
      return {
        kind: 'Document',
        definitions: [
          {
            kind: 'OperationDefinition',
            operation: 'query',
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'authenticatedItem' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: authenticatedItemType.getTypes().map(
                      (type): InlineFragmentNode => {
                        return {
                          kind: 'InlineFragment',
                          typeCondition: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: type.name },
                          },
                          selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                              { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                              { kind: 'Field', name: { kind: 'Name', value: '_label_' } },
                            ],
                          },
                        };
                      }
                    ),
                  },
                },
              ],
            },
          },
        ],
      };
    }
  }
}
