import { mergeSchemas } from '@graphql-tools/merge';
import { ExtendGraphqlSchema } from '@keystone-next/types';

import { AuthGqlNames, AuthTokenTypeConfig, InitFirstItemConfig } from './types';
import { getBaseAuthSchema } from './gql/getBaseAuthSchema';
import { getInitFirstItemSchema } from './gql/getInitFirstItemSchema';
import { getPasswordResetSchema } from './gql/getPasswordResetSchema';
import { getMagicAuthLinkSchema } from './gql/getMagicAuthLinkSchema';

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
  schema =>
    [
      getBaseAuthSchema({
        identityField,
        listKey,
        protectIdentities,
        secretField,
        gqlNames,
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
        }),
      magicAuthLink &&
        getMagicAuthLinkSchema({
          identityField,
          listKey,
          protectIdentities,
          magicAuthLink,
          gqlNames,
        }),
    ]
      .filter(x => x)
      .reduce((s, extension) => mergeSchemas({ schemas: [s], ...extension }), schema);
