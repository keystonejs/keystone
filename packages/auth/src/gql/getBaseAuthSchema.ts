import type { GraphQLSchemaExtension, KeystoneContext } from '@keystone-next/keystone/types';

import { AuthGqlNames, SecretFieldImpl } from '../types';

import { validateSecret } from '../lib/validateSecret';
import { getPasswordAuthError } from '../lib/getErrorMessage';

export function getBaseAuthSchema<I extends string, S extends string>({
  listKey,
  identityField,
  secretField,
  protectIdentities,
  gqlNames,
  secretFieldImpl,
}: {
  listKey: string;
  identityField: I;
  secretField: S;
  protectIdentities: boolean;
  gqlNames: AuthGqlNames;
  secretFieldImpl: SecretFieldImpl;
}): GraphQLSchemaExtension {
  return {
    typeDefs: `
      # Auth
      union AuthenticatedItem = ${listKey}
      type Query {
        authenticatedItem: AuthenticatedItem
      }
      # Password auth
      type Mutation {
        ${gqlNames.authenticateItemWithPassword}(${identityField}: String!, ${secretField}: String!): ${gqlNames.ItemAuthenticationWithPasswordResult}!
      }
      union ${gqlNames.ItemAuthenticationWithPasswordResult} = ${gqlNames.ItemAuthenticationWithPasswordSuccess} | ${gqlNames.ItemAuthenticationWithPasswordFailure}
      type ${gqlNames.ItemAuthenticationWithPasswordSuccess} {
        sessionToken: String!
        item: ${listKey}!
      }
      type ${gqlNames.ItemAuthenticationWithPasswordFailure} {
        code: PasswordAuthErrorCode!
        message: String!
      }
      enum PasswordAuthErrorCode {
        FAILURE
        IDENTITY_NOT_FOUND
        SECRET_NOT_SET
        MULTIPLE_IDENTITY_MATCHES
        SECRET_MISMATCH
      }
    `,
    resolvers: {
      Mutation: {
        async [gqlNames.authenticateItemWithPassword](
          root: any,
          args: { [P in I]: string } & { [P in S]: string },
          context
        ) {
          if (!context.startSession) {
            throw new Error('No session implementation available on context');
          }

          const dbItemAPI = context.sudo().db.lists[listKey];
          const result = await validateSecret(
            secretFieldImpl,
            identityField,
            args[identityField],
            secretField,
            protectIdentities,
            args[secretField],
            dbItemAPI
          );

          if (!result.success) {
            const message = getPasswordAuthError({
              identityField,
              secretField,
              listKey,
              context,
              code: result.code,
            });
            return { code: result.code, message };
          }

          // Update system state
          const sessionToken = await context.startSession({
            listKey,
            itemId: result.item.id.toString(),
          });
          return { sessionToken, item: result.item };
        },
      },
      Query: {
        async authenticatedItem(root, args, { session, db }) {
          if (typeof session?.itemId === 'string' && typeof session.listKey === 'string') {
            return db.lists[session.listKey].findOne({ where: { id: session.itemId } });
          }
          return null;
        },
      },
      AuthenticatedItem: {
        __resolveType(rootVal: any, { session }: KeystoneContext) {
          return session?.listKey;
        },
      },
      // TODO: Is this the preferred approach for this?
      [gqlNames.ItemAuthenticationWithPasswordResult]: {
        __resolveType(rootVal: any) {
          return rootVal.sessionToken
            ? gqlNames.ItemAuthenticationWithPasswordSuccess
            : gqlNames.ItemAuthenticationWithPasswordFailure;
        },
      },
    },
  };
}
