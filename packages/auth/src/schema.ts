import { ExtendGraphqlSchema, getGqlNames } from '@keystone-6/core/types';

import {
  assertObjectType,
  GraphQLSchema,
  assertInputObjectType,
  GraphQLString,
  GraphQLID,
  parse,
  validate,
} from 'graphql';
import { graphql } from '@keystone-6/core';
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
  sessionData,
}: {
  identityField: string;
  listKey: string;
  secretField: string;
  gqlNames: AuthGqlNames;
  initFirstItem?: InitFirstItemConfig<any>;
  passwordResetLink?: AuthTokenTypeConfig;
  magicAuthLink?: AuthTokenTypeConfig;
  sessionData: string;
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

    // technically this will incorrectly error if someone has a schema extension that adds a field to the list output type
    // and then wants to fetch that field with `sessionData` but it's extremely unlikely someone will do that since if
    // they want to add a GraphQL field, they'll probably use a virtual field
    let ast;
    let query = `query($id: ID!) { ${
      getGqlNames({
        listKey,
        // this isn't used to get the itemQueryName and we don't know it here
        pluralGraphQLName: '',
      }).itemQueryName
    }(where: { id: $id }) { ${sessionData} } }`;
    try {
      ast = parse(query);
    } catch (err) {
      throw new Error(
        `The query to get session data has a syntax error, the sessionData option in your createAuth usage is likely incorrect\n${err}`
      );
    }

    const errors = validate(base.schema, ast);
    if (errors.length) {
      throw new Error(
        `The query to get session data has validation errors, the sessionData option in your createAuth usage is likely incorrect\n${errors.join(
          '\n'
        )}`
      );
    }

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
