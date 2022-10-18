import type { KeystoneConfig } from '../types';
import { KeystoneMeta } from '../admin-ui/system/adminMetaSchema';
import { graphql } from '../types/schema';
import { AdminMetaRootVal } from '../admin-ui/system/createAdminMeta';
import { InitialisedList } from './core/types-for-lists';
import { getGraphQLSchema } from './core/graphql-schema';

export function createGraphQLSchema(
  config: KeystoneConfig,
  lists: Record<string, InitialisedList>,
  adminMeta: AdminMetaRootVal
) {
  // Start with the core keystone graphQL schema
  let graphQLSchema = getGraphQLSchema(lists, {
    mutation: config.session
      ? {
          endSession: graphql.field({
            type: graphql.nonNull(graphql.Boolean),
            async resolve(rootVal, args, context) {
              if (context.sessionStrategy) {
                await context.sessionStrategy.end({ context });
              }
              return true;
            },
          }),
        }
      : {},
    query: {
      keystone: graphql.field({
        type: graphql.nonNull(KeystoneMeta),
        resolve: () => ({ adminMeta }),
      }),
    },
  });

  // Merge in the user defined graphQL API
  if (config.extendGraphqlSchema) {
    graphQLSchema = config.extendGraphqlSchema(graphQLSchema);
  }

  return graphQLSchema;
}
