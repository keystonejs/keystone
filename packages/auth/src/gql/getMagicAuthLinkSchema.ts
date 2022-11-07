import type { BaseItem } from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';
import { AuthGqlNames, AuthTokenTypeConfig, SecretFieldImpl } from '../types';

import { createAuthToken } from '../lib/createAuthToken';
import { validateAuthToken } from '../lib/validateAuthToken';
import { getAuthTokenErrorMessage } from '../lib/getErrorMessage';

const errorCodes = ['FAILURE', 'TOKEN_EXPIRED', 'TOKEN_REDEEMED'] as const;

const MagicLinkRedemptionErrorCode = graphql.enum({
  name: 'MagicLinkRedemptionErrorCode',
  values: graphql.enumValues(errorCodes),
});

export function getMagicAuthLinkSchema<I extends string>({
  listKey,
  identityField,
  gqlNames,
  magicAuthLink,
  magicAuthTokenSecretFieldImpl,
  base,
}: {
  listKey: string;
  identityField: I;
  gqlNames: AuthGqlNames;
  magicAuthLink: AuthTokenTypeConfig;
  magicAuthTokenSecretFieldImpl: SecretFieldImpl;
  base: graphql.BaseSchemaMeta;
}) {
  const RedeemItemMagicAuthTokenFailure = graphql.object<{
    code: typeof errorCodes[number];
    message: string;
  }>()({
    name: gqlNames.RedeemItemMagicAuthTokenFailure,
    fields: {
      code: graphql.field({ type: graphql.nonNull(MagicLinkRedemptionErrorCode) }),
      message: graphql.field({ type: graphql.nonNull(graphql.String) }),
    },
  });
  const RedeemItemMagicAuthTokenSuccess = graphql.object<{ token: string; item: BaseItem }>()({
    name: gqlNames.RedeemItemMagicAuthTokenSuccess,
    fields: {
      token: graphql.field({ type: graphql.nonNull(graphql.String) }),
      item: graphql.field({ type: graphql.nonNull(base.object(listKey)) }),
    },
  });
  const RedeemItemMagicAuthTokenResult = graphql.union({
    name: gqlNames.RedeemItemMagicAuthTokenResult,
    types: [RedeemItemMagicAuthTokenSuccess, RedeemItemMagicAuthTokenFailure],
    resolveType(val) {
      return 'token' in val
        ? gqlNames.RedeemItemMagicAuthTokenSuccess
        : gqlNames.RedeemItemMagicAuthTokenFailure;
    },
  });
  return {
    mutation: {
      [gqlNames.sendItemMagicAuthLink]: graphql.field({
        type: graphql.nonNull(graphql.Boolean),
        args: { [identityField]: graphql.arg({ type: graphql.nonNull(graphql.String) }) },
        async resolve(rootVal, { [identityField]: identity }, context) {
          const dbItemAPI = context.sudo().db[listKey];
          const tokenType = 'magicAuth';

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
          return true;
        },
      }),
      [gqlNames.redeemItemMagicAuthToken]: graphql.field({
        type: graphql.nonNull(RedeemItemMagicAuthTokenResult),
        args: {
          [identityField]: graphql.arg({ type: graphql.nonNull(graphql.String) }),
          token: graphql.arg({ type: graphql.nonNull(graphql.String) }),
        },
        async resolve(rootVal, { [identityField]: identity, token }, context) {
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
            identity,
            magicAuthLink.tokensValidForMins,
            token,
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
      }),
    },
  };
}
