import { graphQLSchemaExtension } from '@keystone-next/keystone/schema';
import { AuthGqlNames, AuthTokenTypeConfig } from '../types';

import { updateAuthToken } from '../lib/updateAuthToken';
import { redeemAuthToken } from '../lib/redeemAuthToken';
import { getErrorMessage } from '../lib/getErrorMessage';

export function getMagicAuthLinkSchema({
  listKey,
  identityField,
  secretField,
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
  return graphQLSchemaExtension({
    typeDefs: `
      # Magic links
      type Mutation {
        ${gqlNames.sendItemMagicAuthLink}(${identityField}: String!): ${gqlNames.SendItemMagicAuthLinkResult}!
      }
      type ${gqlNames.SendItemMagicAuthLinkResult} {
        code: AuthErrorCode!
        message: String!
      }
      type Mutation {
        ${gqlNames.redeemItemMagicAuthToken}(${identityField}: String!, token: String!): ${gqlNames.RedeemItemMagicAuthTokenResult}
      }
      union ${gqlNames.RedeemItemMagicAuthTokenResult} = ${gqlNames.RedeemItemMagicAuthTokenSuccess} | ${gqlNames.RedeemItemMagicAuthTokenFailure}
      type ${gqlNames.RedeemItemMagicAuthTokenSuccess} {
        token: String!
        item: ${listKey}!
      }
      type ${gqlNames.RedeemItemMagicAuthTokenFailure} {
        code: AuthErrorCode!
        message: String!
      }
    `,
    resolvers: {
      Mutation: {
        async [gqlNames.sendItemMagicAuthLink](root: any, args: any, ctx: any) {
          const list = ctx.keystone.lists[listKey];
          const identity = args[identityField];
          const result = await updateAuthToken(
            'magicAuth',
            list,
            identityField,
            protectIdentities,
            identity,
            ctx
          );

          // Note: `success` can be false with no code
          if (!result.success && result.code) {
            const message = getErrorMessage(
              identityField,
              secretField,
              list.adminUILabels.singular,
              list.adminUILabels.plural,
              result.code
            );
            return { code: result.code, message };
          }
          if (result.success) {
            await magicAuthLink.sendToken({
              itemId: result.itemId,
              identity,
              token: result.token,
            });
          }
          return {};
        },
        async [gqlNames.redeemItemMagicAuthToken](root: any, args: any, ctx: any) {
          const list = ctx.keystone.lists[listKey];
          const result = await redeemAuthToken(
            'magicAuth',
            list,
            identityField,
            protectIdentities,
            magicAuthLink.tokensValidForMins,
            args,
            ctx
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

      // TODO: Is this the preferred approach for this?
      [gqlNames.RedeemItemMagicAuthTokenResult]: {
        __resolveType(rootVal: any) {
          return rootVal.token
            ? gqlNames.RedeemItemMagicAuthTokenSuccess
            : gqlNames.RedeemItemMagicAuthTokenFailure;
        },
      },
    },
  });
}
