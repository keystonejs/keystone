import { createSchema, list } from '@keystone-next/keystone';
import { text } from '@keystone-next/keystone/fields';

export const lists = createSchema({
  Note: list({
    fields: {
      label: text({ isRequired: true }),
    },
  }),
});
