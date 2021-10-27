import type { GraphQLSchemaExtension } from '@keystone-next/keystone/types';

import { AuthGqlNames, AuthTokenTypeConfig, SecretFieldImpl } from '../types';

import { createAuthToken } from '../lib/createAuthToken';
import { validateAuthToken } from '../lib/validateAuthToken';
import { getAuthTokenErrorMessage } from '../lib/getErrorMessage';

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
}): GraphQLSchemaExtension {
  return {
    typeDefs: `
      # Reset password
      type Query {
        ${gqlNames.validateItemPasswordResetToken}(${identityField}: String!, token: String!): ${gqlNames.ValidateItemPasswordResetTokenResult}
      }
      type Mutation {
        ${gqlNames.sendItemPasswordResetLink}(${identityField}: String!): Boolean!
        ${gqlNames.redeemItemPasswordResetToken}(${identityField}: String!, token: String!, ${secretField}: String!): ${gqlNames.RedeemItemPasswordResetTokenResult}
      }

      type ${gqlNames.ValidateItemPasswordResetTokenResult} {
        code: PasswordResetRedemptionErrorCode!
        message: String!
      }
      type ${gqlNames.RedeemItemPasswordResetTokenResult} {
        code: PasswordResetRedemptionErrorCode!
        message: String!
      }
      enum PasswordResetRedemptionErrorCode {
        FAILURE
        TOKEN_EXPIRED
        TOKEN_REDEEMED
      }
    `,
    resolvers: {
      Mutation: {
        async [gqlNames.sendItemPasswordResetLink](root: any, args: { [P in I]: string }, context) {
          const dbItemAPI = context.sudo().db[listKey];
          const tokenType = 'passwordReset';
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

            await passwordResetLink.sendToken({ itemId, identity, token, context });
          }
          return true;
        },
        async [gqlNames.redeemItemPasswordResetToken](
          root: any,
          args: { [P in I]: string } & { [P in S]: string } & { token: string },
          context
        ) {
          const dbItemAPI = context.sudo().db[listKey];
          const tokenType = 'passwordReset';
          const result = await validateAuthToken(
            listKey,
            passwordResetTokenSecretFieldImpl,
            tokenType,
            identityField,
            args[identityField],
            passwordResetLink.tokensValidForMins,
            args.token,
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
            data: { [secretField]: args[secretField] },
          });

          return null;
        },
      },
      Query: {
        async [gqlNames.validateItemPasswordResetToken](
          root: any,
          args: { [P in I]: string } & { token: string },
          context
        ) {
          const dbItemAPI = context.sudo().db[listKey];
          const tokenType = 'passwordReset';
          const result = await validateAuthToken(
            listKey,
            passwordResetTokenSecretFieldImpl,
            tokenType,
            identityField,
            args[identityField],
            passwordResetLink.tokensValidForMins,
            args.token,
            dbItemAPI
          );

          if (!result.success) {
            return { code: result.code, message: getAuthTokenErrorMessage({ code: result.code }) };
          }
          return null;
        },
      },
    },
  };
}
