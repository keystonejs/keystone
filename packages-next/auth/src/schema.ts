import { mergeSchemas } from '@graphql-tools/merge';
import { ExtendGraphqlSchema } from '@keystone-next/types';

import { assertObjectType } from 'graphql';
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
    const gqlOutputType = assertObjectType(schema.getType(listKey));
    const secretFieldImpl =
      gqlOutputType.getFields()?.[secretField].extensions?.keystoneSecretField;
    assertSecretFieldImpl(secretFieldImpl, listKey, secretField);

    return [
      getBaseAuthSchema({
        identityField,
        listKey,
        protectIdentities,
        secretField,
        gqlNames,
        secretFieldImpl,
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
          secretFieldImpl,
        }),
      magicAuthLink &&
        getMagicAuthLinkSchema({
          identityField,
          listKey,
          protectIdentities,
          magicAuthLink,
          gqlNames,
          secretFieldImpl,
        }),
    ]
      .filter(x => x)
      .reduce((s, extension) => mergeSchemas({ schemas: [s], ...extension }), schema);
  };
