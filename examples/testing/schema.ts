import { list } from '@keystone-6/core';
import { checkbox, password, relationship, text, timestamp } from '@keystone-6/core/fields';
import { select } from '@keystone-6/core/fields';

export const lists = {
  Task: list({
    fields: {
      label: text({ validation: { isRequired: true } }),
      priority: select({
        type: 'enum',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
        ],
      }),
      isComplete: checkbox(),
      assignedTo: relationship({ ref: 'Person.tasks', many: false }),
      finishBy: timestamp(),
    },
    // Add access control so that only the assigned user can update a task
    // We will write a test to verify that this is working correctly.
    access: {
      item: {
        update: async ({ session, item, context }) => {
          const task = await context.query.Task.findOne({
            where: { id: item.id.toString() },
            query: 'assignedTo { id }',
          });
          return !!(session?.itemId && session.itemId === task.assignedTo?.id);
        },
      },
    },
  }),
  Person: list({
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ isIndexed: 'unique', validation: { isRequired: true } }),
      password: password({ validation: { isRequired: true } }),
      tasks: relationship({ ref: 'Task.assignedTo', many: true }),
    },
  }),
};
