import { graphql } from '@keystone-6/core';
import { AuthGqlNames, AuthTokenTypeConfig, SecretFieldImpl } from '../types';

import { createAuthToken } from '../lib/createAuthToken';
import { validateAuthToken } from '../lib/validateAuthToken';
import { getAuthTokenErrorMessage } from '../lib/getErrorMessage';

const errorCodes = ['FAILURE', 'TOKEN_EXPIRED', 'TOKEN_REDEEMED'] as const;

const PasswordResetRedemptionErrorCode = graphql.enum({
  name: 'PasswordResetRedemptionErrorCode',
  values: graphql.enumValues(errorCodes),
});

export function getPasswordResetSchema<I extends string, S extends string>({
  listKey,
  identityField,
  secretField,
  gqlNames,
  passwordResetLink,
  passwordResetTokenSecretFieldImpl,
}: {
  listKey: string;
  identityField: I;
  secretField: S;
  gqlNames: AuthGqlNames;
  passwordResetLink: AuthTokenTypeConfig;
  passwordResetTokenSecretFieldImpl: SecretFieldImpl;
}) {
  const getResult = (name: string) =>
    graphql.object<{ code: typeof errorCodes[number]; message: string }>()({
      name,
      fields: {
        code: graphql.field({ type: graphql.nonNull(PasswordResetRedemptionErrorCode) }),
        message: graphql.field({ type: graphql.nonNull(graphql.String) }),
      },
    });
  const ValidateItemPasswordResetTokenResult = getResult(
    gqlNames.ValidateItemPasswordResetTokenResult
  );
  const RedeemItemPasswordResetTokenResult = getResult(gqlNames.RedeemItemPasswordResetTokenResult);
  return {
    mutation: {
      [gqlNames.sendItemPasswordResetLink]: graphql.field({
        type: graphql.nonNull(graphql.Boolean),
        args: { [identityField]: graphql.arg({ type: graphql.nonNull(graphql.String) }) },
        async resolve(rootVal, { [identityField]: identity }, context) {
          const dbItemAPI = context.sudo().db[listKey];
          const tokenType = 'passwordReset';

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

            await passwordResetLink.sendToken({ itemId, identity, token, context });
          }
          return true;
        },
      }),
      [gqlNames.redeemItemPasswordResetToken]: graphql.field({
        type: RedeemItemPasswordResetTokenResult,
        args: {
          [identityField]: graphql.arg({ type: graphql.nonNull(graphql.String) }),
          token: graphql.arg({ type: graphql.nonNull(graphql.String) }),
          [secretField]: graphql.arg({ type: graphql.nonNull(graphql.String) }),
        },
        async resolve(
          rootVal,
          { [identityField]: identity, token, [secretField]: secret },
          context
        ) {
          const dbItemAPI = context.sudo().db[listKey];
          const tokenType = 'passwordReset';
          const result = await validateAuthToken(
            listKey,
            passwordResetTokenSecretFieldImpl,
            tokenType,
            identityField,
            identity,
            passwordResetLink.tokensValidForMins,
            token,
            dbItemAPI
          );

          if (!result.success) {
            return { code: result.code, message: getAuthTokenErrorMessage({ code: result.code }) };
          }

          // Update system state
          const itemId = result.item.id;
          // Save the token and related info back to the item
          await dbItemAPI.updateOne({
            where: { id: itemId },
            data: { [`${tokenType}RedeemedAt`]: new Date().toISOString() },
          });

          // Save the provided secret. Do this as a separate step as password validation
          // may fail, in which case we still want to mark the token as redeemed
          // (NB: Is this *really* what we want? -TL)
          await dbItemAPI.updateOne({
            where: { id: itemId },
            data: { [secretField]: secret },
          });

          return null;
        },
      }),
    },
    query: {
      [gqlNames.validateItemPasswordResetToken]: graphql.field({
        type: ValidateItemPasswordResetTokenResult,
        args: {
          [identityField]: graphql.arg({ type: graphql.nonNull(graphql.String) }),
          token: graphql.arg({ type: graphql.nonNull(graphql.String) }),
        },
        async resolve(rootVal, { [identityField]: identity, token }, context) {
          const dbItemAPI = context.sudo().db[listKey];
          const tokenType = 'passwordReset';
          const result = await validateAuthToken(
            listKey,
            passwordResetTokenSecretFieldImpl,
            tokenType,
            identityField,
            identity,
            passwordResetLink.tokensValidForMins,
            token,
            dbItemAPI
          );

          if (!result.success) {
            return { code: result.code, message: getAuthTokenErrorMessage({ code: result.code }) };
          }
          return null;
        },
      }),
    },
  };
}
