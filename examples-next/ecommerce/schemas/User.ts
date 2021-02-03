import { text, password, relationship } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';
import { rules, permissions } from '../access';

export const User = list({
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
    // resetToken: text(),
    // resetTokenExpiry: timestamp()
  },
});
