import type { KeystoneConfig, AdminMetaRootVal } from '@keystone-next/types';
import { getAdminMetaSchema } from '../admin-ui/system';
import { sessionSchema } from '../session';
import { InitialisedList } from './core/types-for-lists';
import { getGraphQLSchema } from './core/graphql-schema';
import { getDBProvider } from './createSystem';

export function createGraphQLSchema(
  config: KeystoneConfig,
  lists: Record<string, InitialisedList>,
  adminMeta: AdminMetaRootVal
) {
  let graphQLSchema = getGraphQLSchema(lists, getDBProvider(config.db), {
    query: getAdminMetaSchema({ config, adminMeta, lists }),
    mutation: config.session ? sessionSchema() : {},
  });

  // Merge in the user defined graphQL API
  if (config.extendGraphqlSchema) {
    graphQLSchema = config.extendGraphqlSchema(graphQLSchema);
  }

  return graphQLSchema;
}
