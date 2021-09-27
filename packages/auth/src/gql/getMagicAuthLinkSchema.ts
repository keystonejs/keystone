import type { GraphQLSchemaExtension } from '@keystone-next/keystone/types';

import { AuthGqlNames, AuthTokenTypeConfig, SecretFieldImpl } from '../types';

import { createAuthToken } from '../lib/createAuthToken';
import { validateAuthToken } from '../lib/validateAuthToken';
import { getAuthTokenErrorMessage } from '../lib/getErrorMessage';

export function getMagicAuthLinkSchema<I extends string>({
  listKey,
  identityField,
  gqlNames,
  magicAuthLink,
  magicAuthTokenSecretFieldImpl,
}: {
  listKey: string;
  identityField: I;
  gqlNames: AuthGqlNames;
  magicAuthLink: AuthTokenTypeConfig;
  magicAuthTokenSecretFieldImpl: SecretFieldImpl;
}): GraphQLSchemaExtension {
  return {
    typeDefs: `
      # Magic links
      type Mutation {
        ${gqlNames.sendItemMagicAuthLink}(${identityField}: String!): Boolean
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
        TOKEN_EXPIRED
        TOKEN_REDEEMED
      }
    `,
    resolvers: {
      Mutation: {
        async [gqlNames.sendItemMagicAuthLink](root: any, args: { [P in I]: string }, context) {
          const dbItemAPI = context.sudo().db[listKey];
          const tokenType = 'magicAuth';
          const identity = args[identityField];

          const result = await createAuthToken(identityField, identity, dbItemAPI);

          // Update system state
          if (result.success) {
            // Save the token and related info back to the item
            const { token, itemId } = result;
            await dbItemAPI.updateOne({
              where: { id: `${itemId}` },
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

          const dbItemAPI = context.sudo().db[listKey];
          const tokenType = 'magicAuth';
          const result = await validateAuthToken(
            listKey,
            magicAuthTokenSecretFieldImpl,
            tokenType,
            identityField,
            args[identityField],
            magicAuthLink.tokensValidForMins,
            args.token,
            dbItemAPI
          );

          if (!result.success) {
            return { code: result.code, message: getAuthTokenErrorMessage({ code: result.code }) };
          }
          // Update system state
          // Save the token and related info back to the item
          await dbItemAPI.updateOne({
            where: { id: result.item.id },
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
