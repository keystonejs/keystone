import { AuthGqlNames } from '../types';

import { attemptAuthentication } from '../lib/attemptAuthentication';
import { getPasswordAuthError } from '../lib/getErrorMessage';

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
  return {
    typeDefs: `
      # Auth
      union AuthenticatedItem = ${listKey}
      type Query {
        authenticatedItem: AuthenticatedItem
      }
      # Password auth
      type Mutation {
        ${gqlNames.authenticateItemWithPassword}(${identityField}: String!, ${secretField}: String!): ${gqlNames.ItemAuthenticationWithPasswordResult}!
      }
      union ${gqlNames.ItemAuthenticationWithPasswordResult} = ${gqlNames.ItemAuthenticationWithPasswordSuccess} | ${gqlNames.ItemAuthenticationWithPasswordFailure}
      type ${gqlNames.ItemAuthenticationWithPasswordSuccess} {
        sessionToken: String!
        item: ${listKey}!
      }
      type ${gqlNames.ItemAuthenticationWithPasswordFailure} {
        code: PasswordAuthErrorCode!
        message: String!
      }
      enum PasswordAuthErrorCode {
        FAILURE
        IDENTITY_NOT_FOUND
        SECRET_NOT_SET
        MULTIPLE_IDENTITY_MATCHES
        SECRET_MISMATCH
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
            const message = getPasswordAuthError({
              identityField,
              secretField,
              itemSingular: list.adminUILabels.singular,
              itemPlural: list.adminUILabels.plural,
              code: result.code,
            });
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
  };
}
