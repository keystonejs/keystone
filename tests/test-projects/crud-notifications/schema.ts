import { list } from '@keystone-6/keystone';
import { checkbox, relationship, text, timestamp } from '@keystone-6/keystone/fields';
import { select } from '@keystone-6/keystone/fields';

export const lists = {
  Task: list({
    access: {
      item: {
        delete: async ({ item }) => {
          const matchString = item.label.replace(/([\d])+/g, '').trim();
          return !['do not delete', 'do not destroy', 'do not kill'].includes(matchString);
        },
      },
    },
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
  }),
  Person: list({
    fields: {
      name: text({ validation: { isRequired: true } }),
      tasks: relationship({ ref: 'Task.assignedTo', many: true }),
    },
  }),
};
