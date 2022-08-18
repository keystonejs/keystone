import { list } from '@keystone-6/core';
import { integer, text } from '@keystone-6/core/fields';
import { Lists } from '.keystone/types';

export const lists: Lists = {
  Post: list({
    hooks: {
      resolveInput: async ({ resolvedData, operation, item }) => {
        console.log('list.hooks.resolveInput', { resolvedData, operation, item });

        if (operation === 'create') return resolvedData;
        if (resolvedData.version !== item.version + 1)
          throw new Error(`Expected version ${item.version + 1}`);
        return resolvedData;
      },
    },

    fields: {
      title: text({ validation: { isRequired: true } }),
      content: text(),
      version: integer({
        defaultValue: 0,
        validation: { isRequired: true },
        db: { isNullable: false },
      }),
    },
  }),
};
