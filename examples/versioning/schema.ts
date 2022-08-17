import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { integer, text } from '@keystone-6/core/fields';
import { Lists } from '.keystone/types';

export const lists: Lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: text(),
      version: integer({
        defaultValue: 0,
        validation: { isRequired: true },
        db: { isNullable: false },
        graphql: {
          // read: { isNonNull: true }, // unnecessary
          // create: { isNonNull: true }, // unnecessary
          // TODO update: { isNonNull: true } // what we want
        },
        ui: {
          itemView: {
            fieldMode: 'read' // no manually editing this
          }
        },
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
