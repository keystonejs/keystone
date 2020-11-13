import { createSchema, list } from '@keystone-next/keystone/schema';
import { text, relationship, password, select, virtual, integer } from '@keystone-next/fields';
import { cloudinaryImage } from '@keystone-next/cloudinary';
import type { ListsAPI, AccessControl } from './types';

/*
  TODO
    - [ ] Access Control (new Roles system)
    - [ ] Tracking (createdAt, updatedAt, updatedAt, updatedBy)
    - [ ] Port the addToCard mutation
    - [ ] Port the checkout mutation
    - [x] User: could create an isAdmin user?
    - [x] CartItem: labelResolver -> virtual field
    - [x] Item: price integer field missing defaultValue, isRequired
    - [x] Item: image field (need cloudinaryImage?)
    - [x] OrderItem: quantity integer field missing isRequired
    - [x] Item / OrderItem: change image to relationship
    - [ ] Item: relationship fields don't support isRequired
*/

export const access: AccessControl = {
  userIsAdmin: ({ session }) => session?.data && session.data.permissions === 'ADMIN',
  userIsEditor: ({ session }) => session?.data && session.data.permissions === 'EDITOR',
  userIsItem: ({ session }) => (session?.itemId ? { id: session.itemId } : false),
  userAuthorsItem: ({ session }) => (session?.itemId ? { author: { id: session.itemId } } : false),
  userOwnsItem: ({ session }) => (session?.itemId ? { user: { id: session.itemId } } : false),
  userIsAdminOrEditor: args => access.userIsAdmin(args) || access.userIsEditor(args),
  userIsAdminOrOwner: args => access.userIsAdmin(args) || access.userOwnsItem(args),
  userCanAccessUsers: args => access.userIsAdmin(args) || access.userIsItem(args),
  userCanUpdateItem: args =>
    access.userIsAdmin(args) || access.userIsEditor(args) || access.userOwnsItem,
};

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
      // only admins can see the list of users
      read: access.userCanAccessUsers,
      update: access.userCanAccessUsers,
      delete: access.userIsAdmin,
    },
    ui: {
      // only admins can create and delete users in the Admin UI
      hideCreate: args => !access.userIsAdmin(args),
      hideDelete: args => !access.userIsAdmin(args),
      listView: {
        initialColumns: ['name', 'email'],
      },
    },
    fields: {
      name: text({ isRequired: true }),
      email: text({ isRequired: true, isUnique: true }),
      password: password(),
      cart: relationship({
        ref: 'CartItem.user',
        many: true,
        ui: {
          createView: { fieldMode: 'hidden' },
          itemView: { fieldMode: 'read' },
        },
      }),
      permissions: select({
        options: [
          { label: 'User', value: 'USER' },
          { label: 'Editor', value: 'EDITOR' },
          { label: 'Admin', value: 'ADMIN' },
        ],
        access: {
          // only admins can create or change the permissions field
          create: access.userIsAdmin,
          update: access.userIsAdmin,
        },
        ui: {
          itemView: {
            // show the fieldMode as read-only if the user is not an admin
            fieldMode: args => (access.userIsAdmin(args) ? 'edit' : 'read'),
          },
        },
      }),
    },
  }),
  Product: list({
    access: {
      create: access.userIsAdminOrEditor,
      read: true,
      update: access.userIsAdminOrEditor,
      delete: access.userIsAdmin,
    },
    fields: {
      name: text({ isRequired: true }),
      permissions: select({
        options: [
          { label: 'Draft', value: 'DRAFT' },
          { label: 'Available', value: 'AVAILABLE' },
          { label: 'Unavailable', value: 'UNAVAILABLE' },
        ],
        defaultValue: 'DRAFT',
        ui: {
          displayMode: 'segmented-control',
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
      author: relationship({ ref: 'User' }),
    },
  }),
  ProductImage: list({
    access: {
      create: access.userIsAdminOrEditor,
      read: true,
      update: access.userIsAdminOrEditor,
      delete: access.userIsAdminOrEditor,
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
    ui: {
      labelField: 'label',
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
  }),
  Order: list({
    ui: {
      labelField: 'label',
      listView: { initialColumns: ['label', 'user', 'items'] },
    },
    fields: {
      label: virtual({
        graphQLReturnType: 'String',
        resolver: item => formatMoney(item.total),
      }),
      total: integer(),
      items: relationship({ ref: 'OrderItem', many: true }),
      user: relationship({ ref: 'User' }),
      charge: text(),
    },
  }),
  OrderItem: list({
    fields: {
      name: text({ isRequired: true }),
      description: text({ ui: { displayMode: 'textarea' } }),
      price: integer(),
      quantity: integer({ isRequired: true }),
      image: relationship({
        ref: 'ProductImage',
        ui: { displayMode: 'cards', cardFields: ['image'] },
      }),
    },
  }),
});
