import { text, relationship, integer } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';
import { rules } from '../access';

export const OrderItem = list({
  access: {
    create: () => false,
    read: rules.canOrder,
    update: () => false,
    delete: () => false,
  },
  ui: {
    hideCreate: true,
    hideDelete: true,
    listView: { initialColumns: ['name', 'price', 'quantity'] },
  },
  fields: {
    name: text({ isRequired: true }),
    order: relationship({ ref: 'Order.items' }),
    user: relationship({ ref: 'User' }),
    description: text({ ui: { displayMode: 'textarea' } }),
    price: integer(),
    quantity: integer({ isRequired: true }),
    image: relationship({
      ref: 'ProductImage',
      ui: { displayMode: 'cards', cardFields: ['image'] },
    }),
  },
});
