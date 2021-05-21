import { integer, text, relationship, virtual } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';
import { types } from '@keystone-next/types';
import { isSignedIn, rules } from '../access';
import formatMoney from '../lib/formatMoney';

export const Order = list({
  access: {
    create: isSignedIn,
    read: rules.canOrder,
    update: () => false,
    delete: () => false,
  },
  fields: {
    label: virtual({
      field: types.field({
        type: types.String,
        resolve(item) {
          return `${formatMoney((item as any).total)}`;
        },
      }),
    }),
    total: integer(),
    items: relationship({ ref: 'OrderItem.order', many: true }),
    user: relationship({ ref: 'User.orders' }),
    charge: text(),
  },
});
