import { GraphQLSchema } from 'graphql';
import { graphQLSchemaExtension } from '@keystone-spike/keystone/schema';
import { ResolvedAuthGqlNames } from './types';

export function initFirstItemSchemaExtension({
  listKey,
  fields,
  extraCreateInput,
  gqlNames,
}: {
  listKey: string;
  fields: string[];
  extraCreateInput: Record<string, any> | undefined;
  gqlNames: ResolvedAuthGqlNames;
}) {
  return (schema: GraphQLSchema, keystoneClassInstance: any) => {
    const list = keystoneClassInstance.lists[listKey];

    const createInitialInputName = `CreateInitial${listKey}Input`;
    const createInitialMutationName = `createInitial${listKey}`;
    const newSchema = graphQLSchemaExtension({
      typeDefs: `
    input ${createInitialInputName} {
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
        ${createInitialMutationName}(data: ${createInitialInputName}!): ${
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
              { ...data, ...extraCreateInput },
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
