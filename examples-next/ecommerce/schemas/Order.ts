import { virtual, integer, relationship, text } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';
import { rules } from '../access';
import formatMoney from '../lib/formatMoney';

export const Order = list({
  access: {
    create: () => false,
    read: rules.canOrder,
    update: () => false,
    delete: () => false,
  },
  ui: {
    hideCreate: true,
    hideDelete: true,
    listView: { initialColumns: ['label', 'user', 'items'] },
  },
  fields: {
    label: virtual({
      graphQLReturnType: 'String',
      resolver: item => formatMoney(item.total),
    }),
    total: integer(),
    items: relationship({ ref: 'OrderItem.order', many: true }),
    user: relationship({ ref: 'User.orders' }),
    charge: text(),
  },
});
