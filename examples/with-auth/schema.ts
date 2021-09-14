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
    defaultIsFilterable: true,
    defaultIsOrderable: true,
  }),
  Person: list({
    fields: {
      name: text({ isRequired: true }),
      // Added an email and password pair to be used with authentication
      // The email address is going to be used as the identity field, so it's
      // important that we set isRequired, isIndexed: 'unique', and isFilterable.
      email: text({ isRequired: true, isIndexed: 'unique', isFilterable: true }),
      // The password field stores a hash of the supplied password, and
      // we want to ensure that all people have a password set, so we use
      // the isRequired flag.
      password: password({ isRequired: true }),
      tasks: relationship({ ref: 'Task.assignedTo', many: true }),
    },
    defaultIsFilterable: true,
    defaultIsOrderable: true,
  }),
};
