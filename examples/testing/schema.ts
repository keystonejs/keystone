import { list } from '@keystone-next/keystone';
import { checkbox, password, relationship, text, timestamp } from '@keystone-next/keystone/fields';
import { select } from '@keystone-next/keystone/fields';

export const lists = {
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
      item: {
        update: async ({ session, item, context }) => {
          const task = await context.lists.Task.findOne({
            where: { id: item.id },
            query: 'assignedTo { id }',
          });
          return !!(session?.itemId && session.itemId === task.assignedTo?.id);
        },
      },
    },
    defaultIsFilterable: true,
    defaultIsOrderable: true,
  }),
  Person: list({
    fields: {
      name: text({ isRequired: true }),
      email: text({ isRequired: true, isIndexed: 'unique' }),
      password: password({ isRequired: true }),
      tasks: relationship({ ref: 'Task.assignedTo', many: true }),
    },
    defaultIsFilterable: true,
    defaultIsOrderable: true,
  }),
};
