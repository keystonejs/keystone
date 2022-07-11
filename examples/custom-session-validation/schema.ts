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
      password: password({
        validation: { isRequired: true },
      }),
      // Added a passwordChangedAt field that is updated using the resoolveInput hook whenever the password is changed.
      // This value is checked against the session startTime to determine if the password has been changed since the
      // session was started, and if so invalidate the session.
      passwordChangedAt: timestamp({
        // Don't allow the passwordChangedAt field to be set by the user.
        access: () => false,
        hooks: {
          resolveInput: ({ resolvedData }) => {
            // If the password has been changed, update the passwordChangedAt field to the current time.
            if (resolvedData.password) {
              return new Date();
            }
            // Otherwise return undefined to indicate that the password hasn't been changed.
            return;
          },
        },
        ui: {
          // Hide the passwordChangedAt field from the UI.
          createView: { fieldMode: 'hidden' },
          itemView: { fieldMode: 'hidden' },
          listView: { fieldMode: 'hidden' },
        },
      }),
      tasks: relationship({ ref: 'Task.assignedTo', many: true }),
    },
  }),
};
