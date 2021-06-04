import type { GraphQLSchemaExtension } from '@keystone-next/types';

import { AuthGqlNames, AuthTokenTypeConfig, SecretFieldImpl } from '../types';

import { createAuthToken } from '../lib/createAuthToken';
import { validateAuthToken } from '../lib/validateAuthToken';
import { getAuthTokenErrorMessage } from '../lib/getErrorMessage';

export function getMagicAuthLinkSchema<I extends string>({
  listKey,
  identityField,
  protectIdentities,
  gqlNames,
  magicAuthLink,
  secretFieldImpl,
}: {
  listKey: string;
  identityField: I;
  protectIdentities: boolean;
  gqlNames: AuthGqlNames;
  magicAuthLink: AuthTokenTypeConfig;
  secretFieldImpl: SecretFieldImpl;
}): GraphQLSchemaExtension {
  return {
    typeDefs: `
      # Magic links
      type Mutation {
        ${gqlNames.sendItemMagicAuthLink}(${identityField}: String!): ${gqlNames.SendItemMagicAuthLinkResult}
        ${gqlNames.redeemItemMagicAuthToken}(${identityField}: String!, token: String!): ${gqlNames.RedeemItemMagicAuthTokenResult}!
      }
      type ${gqlNames.SendItemMagicAuthLinkResult} {
        code: MagicLinkRequestErrorCode!
        message: String!
      }
      enum MagicLinkRequestErrorCode {
        IDENTITY_NOT_FOUND
        MULTIPLE_IDENTITY_MATCHES
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
          const dbItemAPI = context.sudo().db.lists[listKey];
          const tokenType = 'magicAuth';
          const identity = args[identityField];

          const result = await createAuthToken(
            identityField,
            protectIdentities,
            identity,
            dbItemAPI
          );

          // Note: `success` can be false with no code
          // If protectIdentities === true then result.code will *always* be undefined.
          if (!result.success && result.code) {
            const message = getAuthTokenErrorMessage({
              identityField,
              listKey,
              context,
              code: result.code,
            });
            return { code: result.code, message };
          }

          // Update system state
          if (result.success) {
            // Save the token and related info back to the item
            const { token, itemId } = result;
            await dbItemAPI.updateOne({
              id: `${itemId}`,
              data: {
                [`${tokenType}Token`]: token,
                [`${tokenType}IssuedAt`]: new Date().toISOString(),
                [`${tokenType}RedeemedAt`]: null,
              },
            });

            await magicAuthLink.sendToken({ itemId, identity, token, context });
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

          const dbItemAPI = context.sudo().db.lists[listKey];
          const tokenType = 'magicAuth';
          const result = await validateAuthToken(
            listKey,
            secretFieldImpl,
            tokenType,
            identityField,
            args[identityField],
            protectIdentities,
            magicAuthLink.tokensValidForMins,
            args.token,
            dbItemAPI
          );

          if (!result.success) {
            const message = getAuthTokenErrorMessage({
              identityField,
              listKey,
              context,
              code: result.code,
            });

            return { code: result.code, message };
          }
          // Update system state
          // Save the token and related info back to the item
          await dbItemAPI.updateOne({
            id: result.item.id,
            data: { [`${tokenType}RedeemedAt`]: new Date().toISOString() },
          });

          const sessionToken = await context.startSession({
            listKey,
            itemId: result.item.id.toString(),
          });
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
