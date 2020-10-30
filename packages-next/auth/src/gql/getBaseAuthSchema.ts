import { graphQLSchemaExtension } from '@keystone-next/keystone/schema';
import { AuthGqlNames } from '../types';

import { attemptAuthentication } from '../lib/attemptAuthentication';
import { getErrorMessage } from '../lib/getErrorMessage';

export function getBaseAuthSchema({
  listKey,
  identityField,
  secretField,
  protectIdentities,
  gqlNames,
}: {
  listKey: string;
  identityField: string;
  secretField: string;
  protectIdentities: boolean;
  gqlNames: AuthGqlNames;
}) {
  return graphQLSchemaExtension({
    typeDefs: `
      # Auth
      union AuthenticatedItem = ${listKey}
      type Query {
        authenticatedItem: AuthenticatedItem
      }
      enum AuthErrorCode {
        PASSWORD_AUTH_FAILURE
        PASSWORD_AUTH_IDENTITY_NOT_FOUND
        PASSWORD_AUTH_SECRET_NOT_SET
        PASSWORD_AUTH_MULTIPLE_IDENTITY_MATCHES
        PASSWORD_AUTH_SECRET_MISMATCH
        AUTH_TOKEN_REQUEST_IDENTITY_NOT_FOUND
        AUTH_TOKEN_REQUEST_MULTIPLE_IDENTITY_MATCHES
        AUTH_TOKEN_REDEMPTION_FAILURE
        AUTH_TOKEN_REDEMPTION_IDENTITY_NOT_FOUND
        AUTH_TOKEN_REDEMPTION_MULTIPLE_IDENTITY_MATCHES
        AUTH_TOKEN_REDEMPTION_TOKEN_NOT_SET
        AUTH_TOKEN_REDEMPTION_TOKEN_MISMATCH
        AUTH_TOKEN_REDEMPTION_TOKEN_EXPIRED
        AUTH_TOKEN_REDEMPTION_TOKEN_REDEEMED
      }

      # Password auth
      type Mutation {
        ${gqlNames.authenticateItemWithPassword}(${identityField}: String!, ${secretField}: String!):
        ${gqlNames.ItemAuthenticationWithPasswordResult}!
      }
      union ${gqlNames.ItemAuthenticationWithPasswordResult} = ${gqlNames.ItemAuthenticationWithPasswordSuccess} | ${gqlNames.ItemAuthenticationWithPasswordFailure}
      type ${gqlNames.ItemAuthenticationWithPasswordSuccess} {
        sessionToken: String!
        item: ${listKey}!
      }
      type ${gqlNames.ItemAuthenticationWithPasswordFailure} {
        code: AuthErrorCode!
        message: String!
      }
    `,
    resolvers: {
      Mutation: {
        async [gqlNames.authenticateItemWithPassword](root: any, args: any, ctx: any) {
          const list = ctx.keystone.lists[listKey];
          const result = await attemptAuthentication(
            list,
            identityField,
            secretField,
            protectIdentities,
            args
          );

          if (!result.success) {
            const message = getErrorMessage(
              identityField,
              secretField,
              list.adminUILabels.singular,
              list.adminUILabels.plural,
              result.code
            );
            return { code: result.code, message };
          }

          const sessionToken = await ctx.startSession({ listKey: 'User', itemId: result.item.id });
          return { token: sessionToken, item: result.item };
        },
      },
      Query: {
        async authenticatedItem(root: any, args: any, ctx: any) {
          if (typeof ctx.session?.itemId === 'string' && typeof ctx.session.listKey === 'string') {
            const item = (
              await ctx.keystone.lists[ctx.session.listKey].adapter.find({
                id: ctx.session.itemId,
              })
            )[0];
            if (!item) return null;
            return {
              ...item,
              // TODO: Is there a better way of doing this?
              __typename: ctx.session.listKey,
            };
          }
          return null;
        },
      },
      AuthenticatedItem: {
        __resolveType(rootVal: any) {
          return rootVal.__typename;
        },
      },
      // TODO: Is this the preferred approach for this?
      [gqlNames.ItemAuthenticationWithPasswordResult]: {
        __resolveType(rootVal: any) {
          return rootVal.token
            ? gqlNames.ItemAuthenticationWithPasswordSuccess
            : gqlNames.ItemAuthenticationWithPasswordFailure;
        },
      },
    },
  });
}
