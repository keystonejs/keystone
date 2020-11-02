import { graphQLSchemaExtension } from '@keystone-next/keystone/schema';
import { AuthGqlNames, AuthTokenTypeConfig } from '../types';

import { updateAuthToken } from '../lib/updateAuthToken';
import { redeemAuthToken } from '../lib/redeemAuthToken';
import { validateAuthToken } from '../lib/validateAuthToken';
import { updateItemSecret } from '../lib/updateItemSecret';
import { getErrorMessage } from '../lib/getErrorMessage';

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
  return graphQLSchemaExtension({
    typeDefs: `
      # Reset password
      type Mutation {
        ${gqlNames.sendItemPasswordResetLink}(${identityField}: String!): ${gqlNames.SendItemPasswordResetLinkResult}!
      }
      type ${gqlNames.SendItemPasswordResetLinkResult} {
        code: AuthErrorCode
        message: String
      }
      type Query {
        ${gqlNames.validateItemPasswordResetToken}(${identityField}: String!, token: String!): ${gqlNames.ValidateItemPasswordResetTokenResult}!
      }
      type ${gqlNames.ValidateItemPasswordResetTokenResult} {
        code: AuthErrorCode
        message: String
      }
      type Mutation {
        ${gqlNames.redeemItemPasswordResetToken}(${identityField}: String!, token: String!, ${secretField}: String!): ${gqlNames.RedeemItemPasswordResetTokenResult}!
      }
      type ${gqlNames.RedeemItemPasswordResetTokenResult} {
        code: AuthErrorCode
        message: String
      }
    `,
    resolvers: {
      Mutation: {
        async [gqlNames.sendItemPasswordResetLink](root: any, args: any, ctx: any) {
          const list = ctx.keystone.lists[listKey];
          const identity = args[identityField];
          const result = await updateAuthToken(
            'passwordReset',
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
            await passwordResetLink.sendToken({
              itemId: result.itemId,
              identity,
              token: result.token,
            });
          }
          return {};
        },
        async [gqlNames.redeemItemPasswordResetToken](root: any, args: any, ctx: any) {
          const list = ctx.keystone.lists[listKey];
          const result = await redeemAuthToken(
            'passwordReset',
            list,
            identityField,
            protectIdentities,
            passwordResetLink.tokensValidForMins,
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

          const secretPlaintext = args[secretField];
          const updateResult = await updateItemSecret(
            list,
            result.item.id,
            secretPlaintext,
            secretField,
            ctx
          );
          if (updateResult.code) {
            const message = getErrorMessage(
              identityField,
              secretField,
              list.adminUILabels.singular,
              list.adminUILabels.plural,
              updateResult.code
            );
            return { code: updateResult.code, message };
          }
          return {};
        },
      },
      Query: {
        async [gqlNames.validateItemPasswordResetToken](root: any, args: any, ctx: any) {
          const list = ctx.keystone.lists[listKey];
          const result = await validateAuthToken(
            'passwordReset',
            list,
            identityField,
            protectIdentities,
            passwordResetLink.tokensValidForMins,
            args
          );

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
          return {};
        },
      },
    },
  });
}
