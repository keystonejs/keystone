import type { GraphQLSchemaExtension, BaseKeystone } from '@keystone-next/types';

import { AuthGqlNames, InitFirstItemConfig } from '../types';

export function getInitFirstItemSchema({
  listKey,
  fields,
  itemData,
  gqlNames,
  keystone,
}: {
  listKey: string;
  fields: InitFirstItemConfig<any>['fields'];
  itemData: InitFirstItemConfig<any>['itemData'];
  gqlNames: AuthGqlNames;
  keystone: BaseKeystone;
}): GraphQLSchemaExtension {
  return {
    typeDefs: `
        input ${gqlNames.CreateInitialInput} {
          ${Array.prototype
            .concat(
              ...fields.map(fieldPath =>
                keystone.lists[listKey].fieldsByPath[fieldPath].gqlCreateInputFields({
                  schemaName: 'public',
                })
              )
            )
            .join('\n')}
        }
        type Mutation {
          ${gqlNames.createInitialItem}(data: ${gqlNames.CreateInitialInput}!): ${
      gqlNames.ItemAuthenticationWithPasswordSuccess
    }!
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
          const item = await dbItemAPI.createOne({ data: { ...data, ...itemData } });
          const sessionToken = await context.startSession({ listKey, itemId: item.id });
          return { item, sessionToken };
        },
      },
    },
  };
}
