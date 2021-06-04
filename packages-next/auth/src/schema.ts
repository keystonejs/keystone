import { mergeSchemas } from '@graphql-tools/merge';
import { ExtendGraphqlSchema } from '@keystone-next/types';

import { assertObjectType, GraphQLSchema } from 'graphql';
import { AuthGqlNames, AuthTokenTypeConfig, InitFirstItemConfig, SecretFieldImpl } from './types';
import { getBaseAuthSchema } from './gql/getBaseAuthSchema';
import { getInitFirstItemSchema } from './gql/getInitFirstItemSchema';
import { getPasswordResetSchema } from './gql/getPasswordResetSchema';
import { getMagicAuthLinkSchema } from './gql/getMagicAuthLinkSchema';

function assertSecretFieldImpl(
  impl: any,
  listKey: string,
  secretField: string
): asserts impl is SecretFieldImpl {
  if (
    !impl ||
    typeof impl.compare !== 'function' ||
    impl.compare.length < 2 ||
    typeof impl.generateHash !== 'function'
  ) {
    const s = JSON.stringify(secretField);
    let msg = `A createAuth() invocation for the "${listKey}" list specifies ${s} as its secretField, but the field type doesn't implement the required functionality.`;
    throw new Error(msg);
  }
}

export function getSecretFieldImpl(schema: GraphQLSchema, listKey: string, fieldKey: string) {
  const gqlOutputType = assertObjectType(schema.getType(listKey));
  const secretFieldImpl = gqlOutputType.getFields()?.[fieldKey].extensions?.keystoneSecretField;
  assertSecretFieldImpl(secretFieldImpl, listKey, fieldKey);
  return secretFieldImpl;
}

export const getSchemaExtension =
  ({
    identityField,
    listKey,
    protectIdentities,
    secretField,
    gqlNames,
    initFirstItem,
    passwordResetLink,
    magicAuthLink,
  }: {
    identityField: string;
    listKey: string;
    protectIdentities: boolean;
    secretField: string;
    gqlNames: AuthGqlNames;
    initFirstItem?: InitFirstItemConfig<any>;
    passwordResetLink?: AuthTokenTypeConfig;
    magicAuthLink?: AuthTokenTypeConfig;
  }): ExtendGraphqlSchema =>
  schema => {
    return [
      getBaseAuthSchema({
        identityField,
        listKey,
        protectIdentities,
        secretField,
        gqlNames,
        secretFieldImpl: getSecretFieldImpl(schema, listKey, secretField),
      }),
      initFirstItem &&
        getInitFirstItemSchema({
          listKey,
          fields: initFirstItem.fields,
          itemData: initFirstItem.itemData,
          gqlNames,
          graphQLSchema: schema,
        }),
      passwordResetLink &&
        getPasswordResetSchema({
          identityField,
          listKey,
          protectIdentities,
          secretField,
          passwordResetLink,
          gqlNames,
          passwordResetTokenSecretFieldImpl: getSecretFieldImpl(
            schema,
            listKey,
            'passwordResetToken'
          ),
        }),
      magicAuthLink &&
        getMagicAuthLinkSchema({
          identityField,
          listKey,
          protectIdentities,
          magicAuthLink,
          gqlNames,
          magicAuthTokenSecretFieldImpl: getSecretFieldImpl(schema, listKey, 'magicAuthToken'),
        }),
    ]
      .filter(x => x)
      .reduce((s, extension) => mergeSchemas({ schemas: [s], ...extension }), schema);
  };
