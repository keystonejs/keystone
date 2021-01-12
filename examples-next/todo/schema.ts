import { createSchema, list } from '@keystone-next/keystone/schema';
import { checkbox, password, relationship, text, timestamp } from '@keystone-next/fields';

const trackingFields = {
  createdAt: timestamp({
    access: { create: false, read: true, update: false },
    defaultValue: () => new Date().toISOString(),
    ui: {
      createView: { fieldMode: 'hidden' },
      itemView: { fieldMode: 'read' },
    },
  }),
  createdBy: relationship({
    ref: 'User',
    access: { create: false, read: true, update: false },
    defaultValue: ({ context: { session } }) =>
      session ? { connect: { id: session.itemId } } : null,
    ui: {
      createView: { fieldMode: 'hidden' },
      itemView: { fieldMode: 'read' },
    },
  }),
  updatedAt: timestamp({
    access: { create: false, read: true, update: false },
    hooks: {
      resolveInput: () => new Date().toISOString(),
    },
    ui: {
      createView: { fieldMode: 'hidden' },
      itemView: { fieldMode: 'read' },
    },
  }),
  updatedBy: relationship({
    ref: 'User',
    access: { create: false, read: true, update: false },
    hooks: {
      resolveInput: ({ context: { session } }) => (session ? session.itemId : null),
    },
    ui: {
      createView: { fieldMode: 'hidden' },
      itemView: { fieldMode: 'read' },
    },
  }),
};

export const lists = createSchema({
  Todo: list({
    ui: {
      listView: {
        initialColumns: ['label', 'isComplete', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy'],
      },
    },
    fields: {
      label: text({ isRequired: true }),
      isComplete: checkbox(),
      assignedTo: relationship({ ref: 'User.tasks' }),
      finishBy: timestamp(),
      ...trackingFields,
    },
  }),
  User: list({
    ui: {
      listView: {
        initialColumns: ['name', 'tasks', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy'],
      },
    },
    fields: {
      name: text({ isRequired: true }),
      email: text(),
      password: password(),
      tasks: relationship({
        ref: 'Todo.assignedTo',
        many: true,
        ui: {
          itemView: { fieldMode: 'read' },
        },
      }),
      ...trackingFields,
    },
  }),
});
