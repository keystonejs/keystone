import { graphql } from '@keystone-6/core';
import addToCart from './addToCart';
import checkout from './checkout';

export const extendGraphqlSchema = graphql.extend(base => {
  return {
    mutation: {
      addToCart: graphql.field({
        type: base.object('CartItem'),
        args: { productId: graphql.arg({ type: graphql.nonNull(graphql.ID) }) },
        // @ts-expect-error context is generic here until https://github.com/keystonejs/keystone/pull/7733 is merged
        resolve: addToCart,
      }),
      checkout: graphql.field({
        type: base.object('Order'),
        args: { token: graphql.arg({ type: graphql.nonNull(graphql.String) }) },
        // @ts-expect-error context is generic here until https://github.com/keystonejs/keystone/pull/7733 is merged
        resolve: checkout,
      }),
    },
  };
});
