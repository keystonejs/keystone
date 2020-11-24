import { AuthGqlNames, AuthTokenTypeConfig } from '../types';

import { updateAuthToken } from '../lib/updateAuthToken';
import { redeemAuthToken } from '../lib/redeemAuthToken';
import { validateAuthToken } from '../lib/validateAuthToken';
import { getAuthTokenErrorMessage } from '../lib/getErrorMessage';

export function getPasswordResetSchema({
  listKey,
  identityField,
  secretField,
  protectIdentities,
  gqlNames,
  passwordResetLink,
}: {
  listKey: string;
  identityField: string;
  secretField: string;
  protectIdentities: boolean;
  gqlNames: AuthGqlNames;
  passwordResetLink: AuthTokenTypeConfig;
}) {
  return {
    typeDefs: `
      # Reset password
      type Mutation {
        ${gqlNames.sendItemPasswordResetLink}(${identityField}: String!): ${gqlNames.SendItemPasswordResetLinkResult}
      }
      type ${gqlNames.SendItemPasswordResetLinkResult} {
        code: PasswordResetRequestErrorCode!
        message: String!
      }
      enum PasswordResetRequestErrorCode {
        IDENTITY_NOT_FOUND
        MULTIPLE_IDENTITY_MATCHES
      }
      type Query {
        ${gqlNames.validateItemPasswordResetToken}(${identityField}: String!, token: String!): ${gqlNames.ValidateItemPasswordResetTokenResult}
      }
      type ${gqlNames.ValidateItemPasswordResetTokenResult} {
        code: PasswordResetRedemptionErrorCode!
        message: String!
      }
      type Mutation {
        ${gqlNames.redeemItemPasswordResetToken}(${identityField}: String!, token: String!, ${secretField}: String!): ${gqlNames.RedeemItemPasswordResetTokenResult}
      }
      type ${gqlNames.RedeemItemPasswordResetTokenResult} {
        code: PasswordResetRedemptionErrorCode!
        message: String!
      }
      enum PasswordResetRedemptionErrorCode {
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
        async [gqlNames.sendItemPasswordResetLink](root: any, args: any, context: any) {
          const list = context.keystone.lists[listKey];
          const itemAPI = context.lists[listKey];
          const identity = args[identityField];
          const result = await updateAuthToken(
            'passwordReset',
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
            await passwordResetLink.sendToken({
              itemId: result.itemId,
              identity,
              token: result.token,
            });
          }
          return null;
        },
        async [gqlNames.redeemItemPasswordResetToken](root: any, args: any, context: any) {
          const list = context.keystone.lists[listKey];
          const itemAPI = context.lists[listKey];
          const result = await redeemAuthToken(
            'passwordReset',
            list,
            identityField,
            protectIdentities,
            passwordResetLink.tokensValidForMins,
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

          // Save the provided secret
          await itemAPI.updateOne({
            id: result.item.id,
            data: { [secretField]: args[secretField] },
          });

          return null;
        },
      },
      Query: {
        async [gqlNames.validateItemPasswordResetToken](root: any, args: any, context: any) {
          const list = context.keystone.lists[listKey];
          const itemAPI = context.lists[listKey];
          const result = await validateAuthToken(
            'passwordReset',
            list,
            identityField,
            protectIdentities,
            passwordResetLink.tokensValidForMins,
            args,
            itemAPI
          );

          if (!result.success && result.code) {
            const message = getAuthTokenErrorMessage({
              identityField,
              itemSingular: list.adminUILabels.singular,
              itemPlural: list.adminUILabels.plural,
              code: result.code,
            });
            return { code: result.code, message };
          }
          return null;
        },
      },
    },
  };
}
