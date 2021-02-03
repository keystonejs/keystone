import { virtual, integer, relationship } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';
import { isSignedIn, rules } from '../access';
import { ListsAPI } from '../types';

export const CartItem = list({
  access: {
    create: isSignedIn,
    read: rules.canOrder,
    update: rules.canOrder,
    delete: rules.canOrder,
  },
  fields: {
    label: virtual({
      graphQLReturnType: 'String',
      resolver: async (cartItem, args, ctx) => {
        const lists: ListsAPI = ctx.lists;
        if (!cartItem.product) {
          return `🛒 ${cartItem.quantity} of (invalid product)`;
        }
        let product = await lists.Product.findOne({
          where: { id: String(cartItem.product) },
        });
        if (product?.name) {
          return `🛒 ${cartItem.quantity} of ${product.name}`;
        }
        return `🛒 ${cartItem.quantity} of (invalid product)`;
      },
    }),
    quantity: integer({
      defaultValue: 1,
      isRequired: true,
    }),
    product: relationship({ ref: 'Product' /* , isRequired: true */ }),
    user: relationship({ ref: 'User.cart' /* , isRequired: true */ }),
  },
});
