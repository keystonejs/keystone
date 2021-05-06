import type { KeystoneConfig, AdminMetaRootVal } from '@keystone-next/types';
import { getAdminMetaSchema } from '@keystone-next/admin-ui/system';
import { sessionSchema } from '../session';
import { InitialisedList } from './core/types-for-lists';
import { getGraphQLSchema } from './core/graphql-schema';
import { getDBProvider } from './createSystem';

export function createGraphQLSchema(
  config: KeystoneConfig,
  lists: Record<string, InitialisedList>,
  adminMeta: AdminMetaRootVal
) {
  // Start with the core keystone graphQL schema
  let graphQLSchema = getGraphQLSchema(lists, getDBProvider(config.db));

  // Merge in the admin-meta graphQL API
  graphQLSchema = getAdminMetaSchema({ config, schema: graphQLSchema, adminMeta, lists });

  // Merge in the user defined graphQL API
  if (config.extendGraphqlSchema) {
    graphQLSchema = config.extendGraphqlSchema(graphQLSchema);
  }

  // Merge in session graphQL API
  if (config.session) {
    graphQLSchema = sessionSchema(graphQLSchema);
  }

  return graphQLSchema;
}
