import { graphql, graphQLSchemaExtension, list } from '@keystone-6/core';
import { text, virtual } from '@keystone-6/core/fields';

export const lists = {
  Something: list({
    fields: {
      text: text({ label: 'Very Important Text' }),
      virtual: virtual({
        field: graphql.field({
          type: graphql.String,
          resolve(item) {
            return (item as { text: string }).text;
          },
        }),
      }),
    },
  }),
};

export const extendGraphqlSchema = graphQLSchemaExtension({
  typeDefs: `
    extend type Query {
      someNumber: Int!
    }
  `,
  resolvers: {
    Query: {
      someNumber: () => 1,
    },
  },
});
