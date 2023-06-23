import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { checkbox, relationship, text, timestamp } from '@keystone-6/core/fields';
import { select } from '@keystone-6/core/fields';
import { createId } from '@paralleldrive/cuid2';
import type { Lists } from '.keystone/types';

function makeCustomIdentifier(listKey: string) {
  return `${listKey.toUpperCase()}_${createId()}`;
}

export const lists: Lists = {
  Task: list({
    access: allowAll,
    db: {
      idField: { kind: 'string' },
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
    hooks: {
      resolveInput: {
        create: async ({ listKey, operation, resolvedData }) => {
          return { ...resolvedData, id: makeCustomIdentifier(listKey) };
        }
      },
    },
  }),
  Person: list({
    access: allowAll,
    db: {
      idField: { kind: 'string' },
    },
    fields: {
      name: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      tasks: relationship({ ref: 'Task.assignedTo', many: true }),
    },
    hooks: {
      resolveInput: {
        create: async ({ listKey, operation, resolvedData }) => {
          return { ...resolvedData, id: makeCustomIdentifier(listKey) };
        }
      },
    },
  }),
};
