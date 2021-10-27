import { graphQLSchemaExtension, list } from '@keystone-next/keystone';
import { text } from '@keystone-next/keystone/fields';

export const lists = {
  Something: list({
    fields: {
      text: text({ label: 'Initial Label For Text' }),
      anotherField: text(),
    },
  }),
};

export const extendGraphqlSchema = graphQLSchemaExtension({
  typeDefs: `
    extend type Query {
      someNumber: Int
    }
  `,
  resolvers: {
    Query: {
      someNumber: () => 1,
    },
  },
});
