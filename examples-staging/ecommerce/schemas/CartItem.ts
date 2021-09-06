import { integer, relationship } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { rules, isSignedIn } from '../access';

export const CartItem = list({
  access: {
    operation: {
      create: isSignedIn,
    },
    filter: {
      query: rules.canOrder,
      update: rules.canOrder,
      delete: rules.canOrder,
    },
  },
  ui: {
    listView: {
      initialColumns: ['product', 'quantity', 'user'],
    },
  },
  fields: {
    // TODO: Custom Label in here
    quantity: integer({
      defaultValue: 1,
      isRequired: true,
    }),
    product: relationship({ ref: 'Product', isFilterable: true }),
    user: relationship({ ref: 'User.cart', isFilterable: true }),
  },
});
