import { text, select, integer, relationship } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';
import { permissions, rules } from '../access';

export const Product = list({
  access: {
    create: permissions.canManageProducts,
    read: rules.canReadProducts,
    update: permissions.canManageProducts,
    delete: permissions.canManageProducts,
  },
  fields: {
    name: text({ isRequired: true }),
    status: select({
      options: [
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Available', value: 'AVAILABLE' },
        { label: 'Unavailable', value: 'UNAVAILABLE' },
      ],
      defaultValue: 'DRAFT',
      ui: {
        displayMode: 'segmented-control',
        createView: { fieldMode: 'hidden' },
      },
    }),
    description: text({ ui: { displayMode: 'textarea' } }),
    price: integer(),
    photo: relationship({
      ref: 'ProductImage.product',
      ui: {
        createView: { fieldMode: 'hidden' },
        displayMode: 'cards',
        cardFields: ['image', 'altText'],
        inlineCreate: { fields: ['image', 'altText'] },
        inlineEdit: { fields: ['altText'] },
      },
    }),
  },
  ui: {
    listView: { initialColumns: ['name', 'status'] },
  }
});
