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
    graphql: { isEnabled: { filter: true, orderBy: true } },
  }),
  Person: list({
    fields: {
      name: text({ isRequired: true }),
      // Added an email and password pair to be used with authentication
      // The email address is going to be used as the identity field, so it's
      // important that we set isRequired, isUnique, and isEnabled: filter.
      email: text({ isRequired: true, isUnique: true, graphql: { isEnabled: { filter: true } } }),
      // The password field stores a hash of the supplied password, and
      // we want to ensure that all people have a password set, so we use
      // the isRequired flag.
      password: password({ isRequired: true }),
      tasks: relationship({ ref: 'Task.assignedTo', many: true }),
    },
    graphql: { isEnabled: { filter: true, orderBy: true } },
  }),
});
