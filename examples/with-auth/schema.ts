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
  }),
  Person: list({
    fields: {
      name: text({ validation: { isRequired: true } }),
      // Added an email and password pair to be used with authentication
      // The email address is going to be used as the identity field, so it's
      // important that we set isRequired and isIndexed: 'unique'.
      email: text({ isIndexed: 'unique', validation: { isRequired: true } }),
      // The password field stores a hash of the supplied password, and
      // we want to ensure that all people have a password set, so we use
      // the validation.isRequired flag.
      password: password({ validation: { isRequired: true } }),
      tasks: relationship({ ref: 'Task.assignedTo', many: true }),
    },
  }),
};
