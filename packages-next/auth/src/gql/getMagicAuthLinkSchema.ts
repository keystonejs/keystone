import type { GraphQLSchemaExtension } from '@keystone-next/types';

import { AuthGqlNames, AuthTokenTypeConfig } from '../types';

import { updateAuthToken } from '../lib/updateAuthToken';
import { validateAuthToken } from '../lib/validateAuthToken';
import { getAuthTokenErrorMessage } from '../lib/getErrorMessage';

export function getMagicAuthLinkSchema<I extends string>({
  listKey,
  identityField,
  protectIdentities,
  gqlNames,
  magicAuthLink,
}: {
  listKey: string;
  identityField: I;
  protectIdentities: boolean;
  gqlNames: AuthGqlNames;
  magicAuthLink: AuthTokenTypeConfig;
}): GraphQLSchemaExtension {
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
        async [gqlNames.sendItemMagicAuthLink](root: any, args: { [P in I]: string }, context) {
          const list = context.keystone.lists[listKey];
          const sudoContext = context.createContext({ skipAccessControl: true });
          const itemAPI = sudoContext.lists[listKey];
          const tokenType = 'magicAuth';
          const identity = args[identityField];

          const result = await updateAuthToken(identityField, protectIdentities, identity, itemAPI);

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

          // Update system state
          if (result.success) {
            // Save the token and related info back to the item
            const { token, itemId } = result;
            await itemAPI.updateOne({
              id: `${itemId}`,
              data: {
                [`${tokenType}Token`]: token,
                [`${tokenType}IssuedAt`]: new Date().toISOString(),
                [`${tokenType}RedeemedAt`]: null,
              },
              resolveFields: false,
            });

            await magicAuthLink.sendToken({ itemId, identity, token });
          }
          return null;
        },
        async [gqlNames.redeemItemMagicAuthToken](
          root: any,
          args: { [P in I]: string } & { token: string },
          context
        ) {
          if (!context.startSession) {
            throw new Error('No session implementation available on context');
          }

          const list = context.keystone.lists[listKey];
          const sudoContext = context.createContext({ skipAccessControl: true });
          const itemAPI = sudoContext.lists[listKey];
          const tokenType = 'magicAuth';
          const result = await validateAuthToken(
            tokenType,
            list,
            identityField,
            args[identityField],
            protectIdentities,
            magicAuthLink.tokensValidForMins,
            args.token,
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
          // Update system state
          // Save the token and related info back to the item
          await itemAPI.updateOne({
            id: result.item.id,
            data: { [`${tokenType}RedeemedAt`]: new Date().toISOString() },
            resolveFields: false,
          });

          const sessionToken = await context.startSession({ listKey, itemId: result.item.id });
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
