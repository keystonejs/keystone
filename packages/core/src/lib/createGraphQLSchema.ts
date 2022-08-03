import type { KeystoneConfig, AdminMetaRootVal } from '../types';
import { getAdminMetaSchema } from '../admin-ui/system';
import { graphql } from '../types/schema';
import { InitialisedModel } from './core/types-for-lists';
import { getGraphQLSchema } from './core/graphql-schema';
export function createGraphQLSchema(
  config: KeystoneConfig,
  models: Record<string, InitialisedModel>,
  adminMeta: AdminMetaRootVal
) {
  // Start with the core keystone graphQL schema
  let graphQLSchema = getGraphQLSchema(models, {
    mutation: config.session
      ? {
          endSession: graphql.field({
            type: graphql.nonNull(graphql.Boolean),
            async resolve(rootVal, args, context) {
              if (context.endSession) {
                await context.endSession();
              }
              return true;
            },
          }),
        }
      : {},
    query: getAdminMetaSchema({ adminMeta, config, models: models }),
  });

  // Merge in the user defined graphQL API
  if (config.extendGraphqlSchema) {
    graphQLSchema = config.extendGraphqlSchema(graphQLSchema);
  }

  return graphQLSchema;
}
