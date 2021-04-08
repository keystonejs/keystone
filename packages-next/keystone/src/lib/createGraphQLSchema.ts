import { GraphQLObjectType } from 'graphql';
import { mapSchema } from '@graphql-tools/utils';
import { makeExecutableSchema } from '@graphql-tools/schema';
import type { KeystoneConfig, BaseKeystone } from '@keystone-next/types';
import { getAdminMetaSchema } from '@keystone-next/admin-ui/system';
import { sessionSchema } from '../session';

export function createGraphQLSchema(
  config: KeystoneConfig,
  keystone: BaseKeystone,
  schemaName: 'public' | 'internal' = 'public'
) {
  // Start with the core keystone graphQL schema
  let graphQLSchema = makeExecutableSchema({
    typeDefs: keystone.getTypeDefs({ schemaName }),
    resolvers: keystone.getResolvers({ schemaName }),
  });

  // Filter out the _label_ field from all lists
  graphQLSchema = mapSchema(graphQLSchema, {
    'MapperKind.OBJECT_TYPE'(type) {
      if (
        config.lists[type.name] !== undefined &&
        config.lists[type.name].fields._label_ === undefined
      ) {
        let {
          fields: { _label_, ...fields },
          ...objectTypeConfig
        } = type.toConfig();
        return new GraphQLObjectType({ fields, ...objectTypeConfig });
      }

      return type;
    },
  });

  // TODO: find a way to not pass keystone in here, if we can - it's too broad and makes
  // everything in the keystone instance public API
  // Merge in the user defined graphQL API
  if (config.extendGraphqlSchema) {
    graphQLSchema = config.extendGraphqlSchema(graphQLSchema, keystone);
  }

  // Merge in session graphQL API
  if (config.session) {
    graphQLSchema = sessionSchema(graphQLSchema);
  }

  // Merge in the admin-meta graphQL API
  graphQLSchema = getAdminMetaSchema({ keystone, config, schema: graphQLSchema });
  return graphQLSchema;
}
