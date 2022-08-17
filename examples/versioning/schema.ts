import { list } from '@keystone-6/core';
import { integer, text } from '@keystone-6/core/fields';
import { Lists } from '.keystone/types';

export const lists: Lists = {
  Post: list({
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: text(),
      version: integer({
        defaultValue: 0,
        validation: { isRequired: true },
        db: { isNullable: false },
        hooks: {
          resolveInput: async ({ resolvedData, operation, item }) => {
            if (operation === 'create') return resolvedData.version;
            if (resolvedData.version !== item.version) throw new Error('Out of sync');

            return item.version + 1;
          }
        },
      })
    },
  }),
};
