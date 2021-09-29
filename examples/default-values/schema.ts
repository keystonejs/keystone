import { list } from '@keystone-next/keystone';
import { checkbox, relationship, text, timestamp } from '@keystone-next/keystone/fields';
import { select } from '@keystone-next/keystone/fields';

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
        hooks: {
          resolveInput({ resolvedData, originalInput }) {
            if (originalInput.priority === undefined) {
              if (originalInput.label && originalInput.label.toLowerCase().includes('urgent')) {
                return 'high';
              } else {
                return 'low';
              }
            }
            return resolvedData.priority;
          },
        },
      }),
      // Static default: When a task is first created, it is incomplete
      isComplete: checkbox({ defaultValue: false }),
      assignedTo: relationship({
        ref: 'Person.tasks',
        many: false,
        hooks: {
          // Dynamic default: Find an anonymous user and assign the task to them
          async resolveInput({ context, operation, resolvedData }) {
            if (operation === 'create' && !resolvedData.assignedTo) {
              const anonymous = await context.db.Person.findMany({
                where: { name: { equals: 'Anonymous' } },
              });
              if (anonymous.length > 0) {
                return { connect: { id: anonymous[0].id } };
              }
            }
            // If we don't have an anonymous user we return the value
            // that was passed in(which might be nothing) so as not to apply any default
            return resolvedData.assignedTo;
          },
        },
      }),
      // Dynamic default: We set the due date to be 7 days in the future
      finishBy: timestamp({
        hooks: {
          resolveInput({ resolvedData, originalInput, operation }) {
            if (originalInput.finishBy == null && operation === 'create') {
              const date = new Date();
              date.setUTCDate(new Date().getUTCDate() + 7);
              return date;
            }
            return resolvedData.finishBy;
          },
        },
      }),
    },
    defaultIsFilterable: true,
    defaultIsOrderable: true,
  }),
  Person: list({
    fields: {
      name: text({ validation: { isRequired: true } }),
      tasks: relationship({ ref: 'Task.assignedTo', many: true }),
    },
    defaultIsFilterable: true,
    defaultIsOrderable: true,
  }),
};
