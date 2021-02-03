import type { GraphQLSchemaExtension } from '@keystone-next/types';

import { AuthGqlNames, AuthTokenTypeConfig } from '../types';

import { updateAuthToken } from '../lib/updateAuthToken';
import { validateAuthToken } from '../lib/validateAuthToken';
import { getAuthTokenErrorMessage } from '../lib/getErrorMessage';

export function getPasswordResetSchema<I extends string, S extends string>({
  listKey,
  identityField,
  secretField,
  protectIdentities,
  gqlNames,
  passwordResetLink,
}: {
  listKey: string;
  identityField: I;
  secretField: S;
  protectIdentities: boolean;
  gqlNames: AuthGqlNames;
  passwordResetLink: AuthTokenTypeConfig;
}): GraphQLSchemaExtension {
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
        async [gqlNames.sendItemPasswordResetLink](root: any, args: { [P in I]: string }, context) {
          const list = context.keystone.lists[listKey];
          const sudoContext = context.createContext({ skipAccessControl: true });
          const itemAPI = sudoContext.lists[listKey];
          const tokenType = 'passwordReset';
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

            await passwordResetLink.sendToken({ itemId, identity, token });
          }
          return null;
        },
        async [gqlNames.redeemItemPasswordResetToken](
          root: any,
          args: { [P in I]: string } & { [P in S]: string } & { token: string },
          context
        ) {
          const list = context.keystone.lists[listKey];
          const sudoContext = context.createContext({ skipAccessControl: true });
          const itemAPI = sudoContext.lists[listKey];
          const tokenType = 'passwordReset';
          const result = await validateAuthToken(
            tokenType,
            list,
            identityField,
            args[identityField],
            protectIdentities,
            passwordResetLink.tokensValidForMins,
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
          const itemId = result.item.id;
          // Save the token and related info back to the item
          await itemAPI.updateOne({
            id: itemId,
            data: { [`${tokenType}RedeemedAt`]: new Date().toISOString() },
            resolveFields: false,
          });

          // Save the provided secret. Do this as a separate step as password validation
          // may fail, in which case we still want to mark the token as redeemed
          // (NB: Is this *really* what we want? -TL)
          await itemAPI.updateOne({
            id: itemId,
            data: { [secretField]: args[secretField] },
            resolveFields: false,
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
          const list = context.keystone.lists[listKey];
          const sudoContext = context.createContext({ skipAccessControl: true });
          const itemAPI = sudoContext.lists[listKey];
          const tokenType = 'passwordReset';
          const result = await validateAuthToken(
            tokenType,
            list,
            identityField,
            args[identityField],
            protectIdentities,
            passwordResetLink.tokensValidForMins,
            args.token,
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
