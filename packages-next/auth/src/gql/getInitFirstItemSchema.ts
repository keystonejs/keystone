import { AuthGqlNames } from '../types';

export function getInitFirstItemSchema({
  listKey,
  fields,
  itemData,
  gqlNames,
  keystone,
}: {
  listKey: string;
  fields: string[];
  itemData: Record<string, any> | undefined;
  gqlNames: AuthGqlNames;
  keystone: any;
}) {
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
        async [gqlNames.createInitialItem](rootVal: any, { data }: any, context: any) {
          const count = await context.lists[listKey].count({});
          if (count !== 0) {
            throw new Error('Initial items can only be created when no items exist in that list');
          }
          const item = await context.lists[listKey].createOne({ data: { ...data, ...itemData } });
          const sessionToken = await context.startSession({ listKey, itemId: item.id });
          return { item, sessionToken };
        },
      },
    },
  };
}
