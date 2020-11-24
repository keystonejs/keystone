import { createSchema, list } from '@keystone-next/keystone/schema';
import { text, relationship, password, select, virtual, integer } from '@keystone-next/fields';
import { cloudinaryImage } from '@keystone-next/cloudinary';
import type { ListsAPI } from './types';
import { permissions, isSignedIn, rules } from './access';
import { permissionFields } from './fields';

const cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_KEY || '',
  apiSecret: process.env.CLOUDINARY_SECRET || '',
};

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function formatMoney(cents: number) {
  const dollars = cents / 100;
  return formatter.format(dollars);
}

export const lists = createSchema({
  User: list({
    access: {
      // anyone should be able to create a user (sign up)
      create: true,
      // only admins can see the list of users, but people should be able to see themselves
      read: rules.canReadUsers,
      update: rules.canUpdateUsers,
      delete: permissions.canManageUsers,
    },
    ui: {
      // only admins can create and delete users in the Admin UI
      hideCreate: args => !permissions.canManageUsers(args),
      hideDelete: args => !permissions.canManageUsers(args),
      listView: {
        initialColumns: ['name', 'email'],
      },
    },
    fields: {
      name: text({ isRequired: true }),
      email: text({ isRequired: true, isUnique: true }),
      password: password(),
      role: relationship({
        ref: 'Role.assignedTo',
        access: {
          create: permissions.canManageUsers,
          update: permissions.canManageUsers,
        },
        ui: {
          itemView: {
            fieldMode: args => (permissions.canManageUsers(args) ? 'edit' : 'read'),
          },
        },
      }),
      cart: relationship({
        ref: 'CartItem.user',
        many: true,
        ui: {
          createView: { fieldMode: 'hidden' },
          itemView: { fieldMode: 'read' },
        },
      }),
      orders: relationship({
        ref: 'Order.user',
        many: true,
        access: {
          create: () => false,
          read: true,
          update: () => false,
        },
        ui: {
          createView: { fieldMode: 'hidden' },
          itemView: { fieldMode: 'read' },
        },
      }),
    },
  }),
  Product: list({
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
      image: relationship({
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
  }),
  ProductImage: list({
    access: {
      create: permissions.canManageProducts,
      read: true,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts,
    },
    ui: {
      isHidden: true,
    },
    fields: {
      product: relationship({ ref: 'Product.image' }),
      image: cloudinaryImage({
        cloudinary,
        label: 'Source',
      }),
      altText: text(),
    },
  }),
  CartItem: list({
    access: {
      create: isSignedIn,
      read: rules.canOrder,
      update: rules.canOrder,
      delete: rules.canOrder,
    },
    fields: {
      label: virtual({
        graphQLReturnType: 'String',
        resolver: async (cartItem, args, context) => {
          const lists: ListsAPI = context.lists;
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
  }),
  Order: list({
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
  }),
  OrderItem: list({
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
  }),
  Role: list({
    access: {
      create: permissions.canManageRoles,
      read: permissions.canManageRoles,
      update: permissions.canManageRoles,
      delete: permissions.canManageRoles,
    },
    ui: {
      hideCreate: args => !permissions.canManageRoles(args),
      hideDelete: args => !permissions.canManageRoles(args),
      isHidden: args => !permissions.canManageRoles(args),
      listView: {
        initialColumns: ['name', 'assignedTo'],
      },
      itemView: {
        defaultFieldMode: args => (permissions.canManageRoles(args) ? 'edit' : 'read'),
      },
    },
    fields: {
      name: text({ isRequired: true }),
      ...permissionFields,
      assignedTo: relationship({
        ref: 'User.role',
        many: true,
        ui: {
          itemView: { fieldMode: 'read' },
        },
      }),
    },
  }),
});
