import { GraphQLObjectType } from 'graphql';
import { mergeSchemas } from '@graphql-tools/merge';
import { mapSchema } from '@graphql-tools/utils';
import type { KeystoneConfig, KeystoneContext, BaseKeystone } from '@keystone-next/types';
import { adminMetaSchemaExtension } from '@keystone-next/admin-ui/templates';

import { gql } from '../schema';

export function createGraphQLSchema(
  config: KeystoneConfig,
  keystone: BaseKeystone,
  sessionStrategy: any,
  adminMeta: any
) {
  const { lists, extendGraphqlSchema, ui } = config;
  // @ts-ignore
  const schema = mapSchema(
    keystone.createApolloServer({
      schemaName: 'public',
      dev: process.env.NODE_ENV === 'development',
    }).schema,
    {
      'MapperKind.OBJECT_TYPE'(type) {
        if (lists[type.name] !== undefined && lists[type.name].fields._label_ === undefined) {
          let {
            fields: { _label_, ...fields },
            ...objectTypeConfig
          } = type.toConfig();
          return new GraphQLObjectType({ fields, ...objectTypeConfig });
        }

        return type;
      },
    }
  );

  extensions = [
    // Extend with session mutation
    // FIXME: Move this code into the session module
    sessionStrategy?.end && {
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
    },
    // Extend with admin Meta
    adminMetaSchemaExtension({
      adminMeta,
      isAccessAllowed:
        sessionStrategy === undefined
          ? undefined
          : ui?.isAccessAllowed ?? (({ session }) => session !== undefined),
      config,
    }),
  ].filter(x => x);

  return (extensions as [{ typeDefs: string; resolvers: any }]).reduce(
    (s, { typeDefs, resolvers }) => mergeSchemas({ schemas: [s], typeDefs, resolvers }),
    extendGraphqlSchema?.(schema, keystone) || schema
  );
}
