import { GraphQLObjectType } from 'graphql';
import { mergeSchemas } from '@graphql-tools/merge';
import { mapSchema } from '@graphql-tools/utils';
import type {
  KeystoneConfig,
  SessionStrategy,
  KeystoneContext,
  BaseKeystone,
  SerializedAdminMeta,
} from '@keystone-next/types';
import { adminMetaSchemaExtension } from '@keystone-next/admin-ui/templates';

import { gql } from '../schema';

export function createGraphQLSchema(
  config: KeystoneConfig,
  keystone: BaseKeystone,
  adminMeta: SerializedAdminMeta,
  sessionStrategy?: SessionStrategy<unknown>,
  sessionImplementation?: any
) {
  let graphQLSchema = keystone.createApolloServer({
    schemaName: 'public',
    dev: process.env.NODE_ENV === 'development',
  }).schema;

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
  if (config.extendGraphqlSchema) {
    graphQLSchema = config.extendGraphqlSchema(graphQLSchema, keystone);
  }

  if (sessionStrategy?.end) {
    graphQLSchema = mergeSchemas({
      schemas: [graphQLSchema],
      typeDefs: gql`
        type Mutation {
          endSession: Boolean!
        }
      `,
      resolvers: {
        Mutation: {
          async endSession(rootVal, args, context: KeystoneContext) {
            if (context.endSession) {
              await context.endSession();
            }
            return true;
          },
        },
      },
    });
  }

  graphQLSchema = adminMetaSchemaExtension({
    adminMeta,
    graphQLSchema,
    isAccessAllowed:
      sessionImplementation === undefined
        ? undefined
        : config.ui?.isAccessAllowed ?? (({ session }) => session !== undefined),
    config,
  });
  return graphQLSchema;
}
