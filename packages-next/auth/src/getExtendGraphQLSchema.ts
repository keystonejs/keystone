import { graphQLSchemaExtension } from '@keystone-spike/keystone/schema';
import { ResolvedAuthGqlNames } from './types';

export function getExtendGraphQLSchema({
  listKey,
  identityField,
  secretField,
  protectIdentities,
  gqlNames,
}: {
  listKey: string;
  identityField: string;
  secretField: string;
  protectIdentities: boolean;
  gqlNames: ResolvedAuthGqlNames;
}) {
  async function validate(args: Record<string, string>, list: any) {
    // Validate the config
    const secretFieldInstance = list.fieldsByPath[secretField];
    if (
      typeof secretFieldInstance.compare !== 'function' ||
      secretFieldInstance.compare.length < 2
    ) {
      throw new Error(
        `Field type specified does not support required functionality. ` +
          `createAuth for list '${listKey}' is using a secretField of '${secretField}'` +
          ` but field type does not provide the required compare() functionality.`
      );
    }
    if (typeof secretFieldInstance.generateHash !== 'function') {
      throw new Error(
        `Field type specified does not support required functionality. ` +
          `createAuth for list '${listKey}' is using a secretField of '${secretField}'` +
          ` but field type does not provide the required generateHash() functionality.`
      );
    }
    const itemResult = await getItem(args, list);
    if (!itemResult.success) return { success: false as const, message: itemResult.message };
    // Verify the secret matches
    const match = await matchItem(itemResult.item, args, secretFieldInstance);
    if (!match.success) {
      return {
        success: false as const,
        message: protectIdentities ? '[passwordAuth:failure] Authentication failed' : match.message,
      };
    }
    return { success: true as const, item: itemResult.item };
  }
  async function getItem(args: Record<string, string>, list: any) {
    const secretFieldInstance = list.fieldsByPath[secretField];
    // Match by identity
    const identity = args[identityField];
    const results = await list.adapter.find({ [identityField]: identity });
    // If we failed to match an identity and we're protecting existing identities then combat timing
    // attacks by creating an arbitrary hash (should take about as long has comparing an existing one)
    if (results.length !== 1 && protectIdentities) {
      // This may still leak if the workfactor for the password field has changed
      const hash = await secretFieldInstance.generateHash(
        'simulated-password-to-counter-timing-attack'
      );
      await secretFieldInstance.compare('', hash);
      return { success: false as const, message: '[passwordAuth:failure] Authentication failed' };
    }
    // Identity failures with helpful errors
    if (results.length === 0) {
      const key = '[passwordAuth:identity:notFound]';
      const message = `${key} The ${identityField} provided didn't identify any ${list.plural}`;
      return { success: false as const, message };
    }
    if (results.length > 1) {
      const key = '[passwordAuth:identity:multipleFound]';
      const message = `${key} The ${identityField} provided identified ${results.length} ${list.plural}`;
      return { success: false as const, message };
    }
    const item = results[0];
    return { success: true as const, item };
  }
  async function matchItem(
    item: Record<string, any>,
    args: Record<string, string>,
    secretFieldInstance: {
      compare(a: string, b: string): boolean;
      generateHash(secret: string): string;
    }
  ) {
    const secret = args[secretField];
    if (item[secretField]) {
      const success = await secretFieldInstance.compare(secret, item[secretField]);
      return {
        success,
        message: success
          ? 'Authentication successful'
          : `[passwordAuth:secret:mismatch] The ${secretField} provided is incorrect`,
      };
    }
    const hash = await secretFieldInstance.generateHash(
      'simulated-password-to-counter-timing-attack'
    );
    await secretFieldInstance.compare(secret, hash);
    return {
      success: false,
      message:
        '[passwordAuth:secret:notSet] The item identified has no secret set so can not be authenticated',
    };
  }
  // note that authenticate${listKey}WithPassword is non-nullable because it throws when auth fails
  return graphQLSchemaExtension({
    typeDefs: `
      union AuthenticatedItem = ${listKey}
      type Query {
        authenticatedItem: AuthenticatedItem
      }
      type Mutation {
        ${gqlNames.authenticateItemWithPassword}(${identityField}: String!, ${secretField}: String!): ${gqlNames.ItemAuthenticationWithPasswordResult}!
      }
      type ${gqlNames.ItemAuthenticationWithPasswordResult} {
          token: String!
          item: ${listKey}!
      }
    `,
    resolvers: {
      Mutation: {
        async [`authenticate${listKey}WithPassword`](root: any, args: any, ctx: any) {
          const result = await validate(args, ctx.keystone.lists[listKey]);
          if (!result.success) {
            throw new Error(result.message);
          }
          const token = await ctx.startSession({ listKey: 'User', itemId: result.item.id + '' });
          return {
            token,
            item: result.item,
          };
        },
      },
      Query: {
        async authenticatedItem(root: any, args: any, ctx: any) {
          if (typeof ctx.session?.itemId === 'string' && typeof ctx.session.listKey === 'string') {
            const item = (
              await ctx.keystone.lists[ctx.session.listKey].adapter.find({
                id: ctx.session.itemId,
              })
            )[0];
            if (!item) return null;
            return {
              ...item,
              // TODO: is this okay?
              // probably yes but ¯\_(ツ)_/¯
              __typename: ctx.session.listKey,
            };
          }
          return null;
        },
      },
      AuthenticatedItem: {
        __resolveType(rootVal: any) {
          return rootVal.__typename;
        },
      },
    },
  });
}
