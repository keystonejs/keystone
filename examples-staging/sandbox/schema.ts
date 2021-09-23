import { list } from '@keystone-next/keystone';
import { checkbox, password, relationship, text, timestamp } from '@keystone-next/keystone/fields';

// this implementation for createdBy and updatedBy is currently wrong so they're disabled for now
const trackingFields = {
  createdAt: timestamp({
    access: { read: () => true, create: () => false, update: () => false },
    defaultValue: () => new Date().toISOString(),
    ui: {
      createView: { fieldMode: 'hidden' },
      itemView: { fieldMode: 'read' },
    },
  }),
  // createdBy: relationship({
  //   ref: 'User',
  //   access: { create: false, read: true, update: false },
  //   defaultValue: ({ context: { session } }) =>
  //     session ? { connect: { id: session.itemId } } : null,
  //   ui: {
  //     createView: { fieldMode: 'hidden' },
  //     itemView: { fieldMode: 'read' },
  //   },
  // }),
  updatedAt: timestamp({
    access: { read: () => true, create: () => false, update: () => false },
    hooks: {
      resolveInput: () => new Date().toISOString(),
    },
    ui: {
      createView: { fieldMode: 'hidden' },
      itemView: { fieldMode: 'read' },
    },
  }),
  // updatedBy: relationship({
  //   ref: 'User',
  //   access: { create: false, read: true, update: false },
  //   hooks: {
  //     resolveInput: ({ context: { session } }) => (session ? session.itemId : null),
  //   },
  //   ui: {
  //     createView: { fieldMode: 'hidden' },
  //     itemView: { fieldMode: 'read' },
  //   },
  // }),
};

export const lists = {
  Todo: list({
    ui: {
      listView: {
        initialColumns: ['label', 'isComplete', 'createdAt', 'updatedAt'],
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
        initialColumns: ['name', 'tasks', 'createdAt', 'updatedAt'],
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
};
