import { AuthGqlNames, AuthTokenTypeConfig } from '../types';

import { updateAuthToken } from '../lib/updateAuthToken';
import { redeemAuthToken } from '../lib/redeemAuthToken';
import { getAuthTokenErrorMessage } from '../lib/getErrorMessage';

export function getMagicAuthLinkSchema({
  listKey,
  identityField,
  protectIdentities,
  gqlNames,
  magicAuthLink,
}: {
  listKey: string;
  identityField: string;
  secretField: string;
  protectIdentities: boolean;
  gqlNames: AuthGqlNames;
  magicAuthLink: AuthTokenTypeConfig;
}) {
  return {
    typeDefs: `
      # Magic links
      type Mutation {
        ${gqlNames.sendItemMagicAuthLink}(${identityField}: String!): ${gqlNames.SendItemMagicAuthLinkResult}
      }
      type ${gqlNames.SendItemMagicAuthLinkResult} {
        code: MagicLinkRequestErrorCode!
        message: String!
      }
      enum MagicLinkRequestErrorCode {
        IDENTITY_NOT_FOUND
        MULTIPLE_IDENTITY_MATCHES
      }
      type Mutation {
        ${gqlNames.redeemItemMagicAuthToken}(${identityField}: String!, token: String!): ${gqlNames.RedeemItemMagicAuthTokenResult}!
      }
      union ${gqlNames.RedeemItemMagicAuthTokenResult} = ${gqlNames.RedeemItemMagicAuthTokenSuccess} | ${gqlNames.RedeemItemMagicAuthTokenFailure}
      type ${gqlNames.RedeemItemMagicAuthTokenSuccess} {
        token: String!
        item: ${listKey}!
      }
      type ${gqlNames.RedeemItemMagicAuthTokenFailure} {
        code: MagicLinkRedemptionErrorCode!
        message: String!
      }
      enum MagicLinkRedemptionErrorCode {
        FAILURE
        IDENTITY_NOT_FOUND
        MULTIPLE_IDENTITY_MATCHES
        TOKEN_NOT_SET
        TOKEN_MISMATCH
        TOKEN_EXPIRED
        TOKEN_REDEEMED
      }
    `,
    resolvers: {
      Mutation: {
        async [gqlNames.sendItemMagicAuthLink](root: any, args: any, ctx: any) {
          const list = ctx.keystone.lists[listKey];
          const itemAPI = ctx.lists[listKey];
          const identity = args[identityField];
          const result = await updateAuthToken(
            'magicAuth',
            identityField,
            protectIdentities,
            identity,
            itemAPI
          );

          // Note: `success` can be false with no code
          if (!result.success && result.code) {
            const message = getAuthTokenErrorMessage({
              identityField,
              itemSingular: list.adminUILabels.singular,
              itemPlural: list.adminUILabels.plural,
              code: result.code,
            });
            return { code: result.code, message };
          }
          if (result.success) {
            await magicAuthLink.sendToken({ itemId: result.itemId, identity, token: result.token });
          }
          return null;
        },
        async [gqlNames.redeemItemMagicAuthToken](root: any, args: any, ctx: any) {
          const list = ctx.keystone.lists[listKey];
          const itemAPI = ctx.lists[listKey];
          const result = await redeemAuthToken(
            'magicAuth',
            list,
            identityField,
            protectIdentities,
            magicAuthLink.tokensValidForMins,
            args,
            itemAPI
          );

          if (!result.success) {
            const message = getAuthTokenErrorMessage({
              identityField,
              itemSingular: list.adminUILabels.singular,
              itemPlural: list.adminUILabels.plural,
              code: result.code,
            });

            return { code: result.code, message };
          }

          const sessionToken = await ctx.startSession({ listKey, itemId: result.item.id });
          return { token: sessionToken, item: result.item };
        },
      },

      // TODO: Is this the preferred approach for this?
      [gqlNames.RedeemItemMagicAuthTokenResult]: {
        __resolveType(rootVal: any) {
          return rootVal.token
            ? gqlNames.RedeemItemMagicAuthTokenSuccess
            : gqlNames.RedeemItemMagicAuthTokenFailure;
        },
      },
    },
  };
}
