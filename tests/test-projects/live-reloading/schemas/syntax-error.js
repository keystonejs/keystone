import { graphQLSchemaExtension, list } from '@keystone-next/keystone';
import { text } from '@keystone-next/keystone/fields';

expor const lists = {
  Something: list({
    fields: {
      text: text(),
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
