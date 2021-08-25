import { createSchema, list } from '@keystone-next/keystone';
import { checkbox, password, relationship, text, timestamp } from '@keystone-next/keystone/fields';
import { select } from '@keystone-next/keystone/fields';

export const lists = createSchema({
  Task: list({
    fields: {
      label: text({ isRequired: true }),
      priority: select({
        dataType: 'enum',
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
      update: async ({ session, itemId, context }) => {
        const task = await context.lists.Task.findOne({
          where: { id: itemId },
          query: 'assignedTo { id }',
        });
        return !!(session?.itemId && session.itemId === task.assignedTo?.id);
      },
    },
    graphql: { isEnabled: { filter: true, orderBy: true } },
  }),
  Person: list({
    fields: {
      name: text({ isRequired: true }),
      email: text({ isRequired: true, isUnique: true, graphql: { isEnabled: { filter: true } } }),
      password: password({ isRequired: true }),
      tasks: relationship({ ref: 'Task.assignedTo', many: true }),
    },
    graphql: { isEnabled: { filter: true, orderBy: true } },
  }),
});
