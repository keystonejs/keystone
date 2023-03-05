import { list } from '@keystone-6/core';
import { allowAll, denyAll, allOperations } from '@keystone-6/core/access';
import { text, timestamp } from '@keystone-6/core/fields';
import { document } from '@keystone-6/fields-document';
import type { Lists } from '.keystone/types';

const permissions = {
  authenticatedUser: ({ session }: any) => !!session?.data,
  public: () => true,
  readOnly: {
    operation: {
      // deny create/read/update/delete
      ...allOperations(denyAll),
      // override the deny and allow only query
      query: allowAll,
    },
  },
};

export const lists: Lists = {
  User: list({
    // readonly for demo purpose
    access: permissions.readOnly,
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({
        validation: { isRequired: true },
        isIndexed: 'unique',
      }),
      about: document({
        formatting: true,
        dividers: true,
        links: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
        ],
      }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
      }),
    },
  }),
};
