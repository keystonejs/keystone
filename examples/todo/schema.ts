import { createSchema, list } from '@keystone-next/keystone/schema';
import { checkbox, relationship, text, timestamp } from '@keystone-next/fields';
import { select, uuid } from '@keystone-next/fields';

export const lists = createSchema({
  Task: list({
    idField: uuid(),
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
  }),
  Person: list({
    idField: uuid(),
    fields: {
      name: text({ isRequired: true }),
      email: text({ index: 'unique' }),
      tasks: relationship({ ref: 'Task.assignedTo', many: true }),
    },
  }),
});
