import { createSchema, list } from '@keystone-next/keystone';
import { checkbox, relationship, text, timestamp } from '@keystone-next/keystone/fields';
import { select } from '@keystone-next/keystone/fields';

export const lists = createSchema({
  Task: list({
    access: {
      delete: async ({ itemId, context }) => {
        const item: any = await context.lists.Task.findOne({
          where: { id: itemId },
          query: 'label',
        });
        const matchString = item.label.replace(/([\d])+/g, '').trim();
        return !['do not delete', 'do not destroy', 'do not kill'].includes(matchString);
      },
    },
    fields: {
      label: text({ isRequired: true, graphql: { isEnabled: { orderBy: true } } }),
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
    graphql: { isEnabled: { filter: true, orderBy: true } },
  }),
  Person: list({
    fields: {
      name: text({ isRequired: true }),
      tasks: relationship({ ref: 'Task.assignedTo', many: true }),
    },
    graphql: { isEnabled: { filter: true, orderBy: true } },
  }),
});
