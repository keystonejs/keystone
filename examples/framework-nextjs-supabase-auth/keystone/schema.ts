import { list } from '@keystone-6/core';
import { allowAll, allOperations } from '@keystone-6/core/access';
import { text, timestamp } from '@keystone-6/core/fields';
import type { Lists } from '.keystone/types';

const permissions = {
  authenticatedUser: ({ session }: any) => !!session,
};

export const lists: Lists = {
  Post: list({
    // readonly for demo purpose
    access: {
      operation: {
        // Only Supabase Users can create, update, and delete
        ...allOperations(permissions.authenticatedUser),
        // override the deny and allow only query
        query: allowAll,
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      content: text(),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
      }),
    },
  }),
};
