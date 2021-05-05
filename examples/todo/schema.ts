import { createSchema, list } from '@keystone-next/keystone/schema';
import { checkbox, relationship, text, timestamp } from '@keystone-next/fields';
import { select } from '@keystone-next/fields';

export const lists = createSchema({
  Task: list({
    fields: {
      label: text({ isRequired: true, isIndexed: true }),
      priority: select({
        dataType: 'enum',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
        ],
        isIndexed: true,
      }),
      isComplete: checkbox(),
      assignedTo: relationship({ ref: 'Person.tasks', many: false }),
      finishBy: timestamp({ isIndexed: true }),
    },
  }),
  Person: list({
    fields: {
      name: text({ isRequired: true }),
      tasks: relationship({ ref: 'Task.assignedTo', many: true }),
    },
  }),
});
