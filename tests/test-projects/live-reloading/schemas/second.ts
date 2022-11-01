import { graphql, list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { text, virtual } from '@keystone-6/core/fields';

export const lists = {
  Something: list({
    access: allowAll,
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

export const extendGraphqlSchema = graphql.extend(() => {
  return {
    query: {
      someNumber: graphql.field({
        type: graphql.nonNull(graphql.Int),
        resolve: () => 1,
      }),
    },
  };
});
