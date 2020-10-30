import { GraphQLSchema } from 'graphql';
import { graphQLSchemaExtension } from '@keystone-next/keystone/schema';
import { AuthGqlNames } from '../types';

export function getInitFirstItemSchema({
  listKey,
  fields,
  itemData,
  gqlNames,
}: {
  listKey: string;
  fields: string[];
  itemData: Record<string, any> | undefined;
  gqlNames: AuthGqlNames;
}) {
  return (schema: GraphQLSchema, keystoneClassInstance: any) => {
    const list = keystoneClassInstance.lists[listKey];

    const newSchema = graphQLSchemaExtension({
      typeDefs: `
        input ${gqlNames.CreateInitialInput} {
          ${Array.prototype
            .concat(
              ...fields.map(fieldPath =>
                list.fieldsByPath[fieldPath].gqlCreateInputFields({
                  schemaName: 'public',
                })
              )
            )
            .join('\n')}
        }
        type Mutation {
          ${gqlNames.createInitialItem}(data: ${gqlNames.CreateInitialInput}!): ${
        gqlNames.ItemAuthenticationWithPasswordResult
      }!
        }
      `,
      resolvers: {
        Mutation: {
          async [`createInitial${listKey}`](rootVal: any, { data }: any, context: any) {
            const { count } = await list.adapter.itemsQuery(
              {},
              {
                meta: true,
              }
            );
            if (count !== 0) {
              throw new Error('Initial items can only be created when no items exist in that list');
            }
            const contextThatSkipsAccessControl = await context.createContext({
              skipAccessControl: true,
            });
            const item = await list.createMutation(
              { ...data, ...itemData },
              contextThatSkipsAccessControl
            );
            const token = await context.startSession({ listKey, itemId: item.id });
            return {
              item,
              token,
            };
          },
        },
      },
    })(schema, keystoneClassInstance);
    return newSchema;
  };
}
