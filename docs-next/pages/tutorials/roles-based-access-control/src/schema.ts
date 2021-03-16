import { createSchema, list } from '@keystone-next/keystone/schema';
import { text, checkbox, relationship, password, timestamp, select } from '@keystone-next/fields';
import { document } from '@keystone-next/fields-document';

import { isSignedIn, permissions } from './access';

export const lists = createSchema({
  User: list({
    access: {
      create: permissions.canManageUsers,
      read: isSignedIn,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers,
    },
    fields: {
      name: text({ isRequired: true }),
      email: text({ isRequired: true, isUnique: true }),
      password: password({
        isRequired: true,
        access: {
          update: ({ session, item }) =>
            permissions.canManageUsers({ session }) || session.itemId === item.id,
        },
      }),
      posts: relationship({ ref: 'Post.author', many: true }),
      role: relationship({
        isRequired: true,
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
    },
    ui: {
      hideCreate: args => !permissions.canManageUsers(args),
      hideDelete: args => !permissions.canManageUsers(args),
      listView: {
        initialColumns: ['name', 'role', 'posts'],
      },
      itemView: {
        defaultFieldMode: ({ session, item }) => {
          if (session.data.role?.canManageUsers) return 'edit';
          else if (session.itemId === item.id) return 'edit';
          return 'read';
        },
      },
    },
  }),
  Post: list({
    access: {
      create: permissions.canCreatePosts,
      read: isSignedIn,
      update: permissions.canUpdatePosts,
      delete: permissions.canDeletePosts,
    },
    fields: {
      title: text(),
      status: select({
        options: [
          { label: 'Published', value: 'published' },
          { label: 'Draft', value: 'draft' },
        ],
        ui: {
          displayMode: 'segmented-control',
        },
      }),
      content: document({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
      }),
      publishDate: timestamp(),
      author: relationship({
        ref: 'User.posts',
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineEdit: { fields: ['name', 'email'] },
          linkToItem: true,
          inlineCreate: { fields: ['name', 'email'] },
        },
      }),
      tags: relationship({
        ref: 'Tag.posts',
        ui: {
          displayMode: 'cards',
          cardFields: ['name'],
          inlineEdit: { fields: ['name'] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ['name'] },
        },
        many: true,
      }),
    },
    ui: {
      hideCreate: args => !permissions.canCreatePosts(args),
      hideDelete: args => !permissions.canDeletePosts(args),
      listView: {
        initialColumns: ['title', 'author'],
      },
      itemView: {
        defaultFieldMode: ({ session, item }) => {
          if (session.data.role?.canUpdatePosts) return 'edit';
          else if (session.itemId == item.authorId) return 'edit';
          return 'read';
        },
      },
    },
  }),
  Tag: list({
    ui: {
      isHidden: true,
    },
    fields: {
      name: text(),
      posts: relationship({
        ref: 'Post.tags',
        many: true,
      }),
    },
  }),
  Role: list({
    access: {
      create: permissions.canManageRoles,
      read: isSignedIn,
      update: permissions.canManageRoles,
      delete: permissions.canManageRoles,
    },
    fields: {
      name: text({ isRequired: true }),
      canManageUsers: checkbox({ defaultValue: false }),
      canManageRoles: checkbox({ defaultValue: false }),
      canCreatePosts: checkbox({ defaultValue: false }),
      canUpdatePosts: checkbox({ defaultValue: false }),
      canDeletePosts: checkbox({ defaultValue: false }),

      assignedTo: relationship({
        ref: 'User.role',
        many: true,
        ui: {
          itemView: { fieldMode: 'read' },
        },
      }),
    },
    ui: {
      hideCreate: args => !permissions.canManageRoles(args),
      hideDelete: args => !permissions.canManageRoles(args),
      listView: {
        initialColumns: ['name', 'assignedTo'],
      },
      itemView: {
        defaultFieldMode: args => (permissions.canManageRoles(args) ? 'edit' : 'read'),
      },
    },
  }),
});
