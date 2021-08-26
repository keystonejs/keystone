import type { GraphQLSchemaExtension } from '@keystone-next/keystone/types';
import { assertInputObjectType, GraphQLInputObjectType, GraphQLSchema, printType } from 'graphql';

import { AuthGqlNames, InitFirstItemConfig } from '../types';

export function getInitFirstItemSchema({
  listKey,
  fields,
  itemData,
  gqlNames,
  graphQLSchema,
}: {
  listKey: string;
  fields: InitFirstItemConfig<any>['fields'];
  itemData: InitFirstItemConfig<any>['itemData'];
  gqlNames: AuthGqlNames;
  graphQLSchema: GraphQLSchema;
}): GraphQLSchemaExtension {
  const createInputConfig = assertInputObjectType(
    graphQLSchema.getType(`${listKey}CreateInput`)
  ).toConfig();
  const fieldsSet = new Set(fields);
  const initialCreateInput = printType(
    new GraphQLInputObjectType({
      ...createInputConfig,
      fields: Object.fromEntries(
        Object.entries(createInputConfig.fields).filter(([fieldKey]) => fieldsSet.has(fieldKey))
      ),
      name: gqlNames.CreateInitialInput,
    })
  );
  return {
    typeDefs: `
        ${initialCreateInput}
        type Mutation {
          ${gqlNames.createInitialItem}(data: ${gqlNames.CreateInitialInput}!): ${gqlNames.ItemAuthenticationWithPasswordSuccess}!
        }
      `,
    resolvers: {
      Mutation: {
        async [gqlNames.createInitialItem](
          root: any,
          { data }: { data: Record<string, any> },
          context
        ) {
          if (!context.startSession) {
            throw new Error('No session implementation available on context');
          }

          const dbItemAPI = context.sudo().db.lists[listKey];
          const count = await dbItemAPI.count({});
          if (count !== 0) {
            throw new Error('Initial items can only be created when no items exist in that list');
          }

          // Update system state
          // this is strictly speaking incorrect. the db API will do GraphQL coercion on a value which has already been coerced
          // (this is also mostly fine, the chance that people are using things where
          // the input value can't round-trip like the Upload scalar here is quite low)
          const item = await dbItemAPI.createOne({ data: { ...data, ...itemData } });
          const sessionToken = await context.startSession({ listKey, itemId: item.id.toString() });
          return { item, sessionToken };
        },
      },
    },
  };
}
