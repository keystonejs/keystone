import { ExtendGraphqlSchema } from '@keystone-next/keystone/types';

import {
  assertObjectType,
  GraphQLSchema,
  assertInputObjectType,
  GraphQLString,
  GraphQLID,
} from 'graphql';
import { graphql } from '@keystone-next/keystone';
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

export const getSchemaExtension = ({
  identityField,
  listKey,
  secretField,
  gqlNames,
  initFirstItem,
  passwordResetLink,
  magicAuthLink,
}: {
  identityField: string;
  listKey: string;
  secretField: string;
  gqlNames: AuthGqlNames;
  initFirstItem?: InitFirstItemConfig<any>;
  passwordResetLink?: AuthTokenTypeConfig;
  magicAuthLink?: AuthTokenTypeConfig;
}): ExtendGraphqlSchema =>
  graphql.extend(base => {
    const uniqueWhereInputType = assertInputObjectType(
      base.schema.getType(`${listKey}WhereUniqueInput`)
    );
    const identityFieldOnUniqueWhere = uniqueWhereInputType.getFields()[identityField];
    if (
      identityFieldOnUniqueWhere?.type !== GraphQLString &&
      identityFieldOnUniqueWhere?.type !== GraphQLID
    ) {
      throw new Error(
        `createAuth was called with an identityField of ${identityField} on the list ${listKey} ` +
          `but that field doesn't allow being searched uniquely with a String or ID. ` +
          `You should likely add \`isIndexed: 'unique'\` ` +
          `to the field at ${listKey}.${identityField}`
      );
    }
    const baseSchema = getBaseAuthSchema({
      identityField,
      listKey,
      secretField,
      gqlNames,
      secretFieldImpl: getSecretFieldImpl(base.schema, listKey, secretField),
      base,
    });

    return [
      baseSchema.extension,
      initFirstItem &&
        getInitFirstItemSchema({
          listKey,
          fields: initFirstItem.fields,
          itemData: initFirstItem.itemData,
          gqlNames,
          graphQLSchema: base.schema,
          ItemAuthenticationWithPasswordSuccess: baseSchema.ItemAuthenticationWithPasswordSuccess,
        }),
      passwordResetLink &&
        getPasswordResetSchema({
          identityField,
          listKey,
          secretField,
          passwordResetLink,
          gqlNames,
          passwordResetTokenSecretFieldImpl: getSecretFieldImpl(
            base.schema,
            listKey,
            'passwordResetToken'
          ),
        }),
      magicAuthLink &&
        getMagicAuthLinkSchema({
          identityField,
          listKey,
          magicAuthLink,
          gqlNames,
          magicAuthTokenSecretFieldImpl: getSecretFieldImpl(base.schema, listKey, 'magicAuthToken'),
          base,
        }),
    ].filter((x): x is Exclude<typeof x, undefined> => x !== undefined);
  });
