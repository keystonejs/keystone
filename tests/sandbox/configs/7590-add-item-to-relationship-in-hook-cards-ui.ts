import { list, config } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { relationship, text } from '@keystone-6/core/fields';
import { dbConfig, uiConfig } from '../utils';

export const lists = {
  User: list({
    access: allowAll,
    fields: {
      name: text(),
      numbers: relationship({
        ref: 'Number.user',
        many: true,
        ui: {
          displayMode: 'cards',
          cardFields: ['value'],
        },
        hooks: {
          // every time you save, add a random number
          async resolveInput(args) {
            return {
              ...args.resolvedData[args.fieldKey],
              create: {
                value: Math.floor(Math.random() * 100000).toString(),
              },
            };
          },
        },
      }),
    },
  }),
  Number: list({
    access: allowAll,
    fields: {
      user: relationship({ ref: 'User.numbers' }),
      value: text({ validation: { isRequired: true } }),
    },
  }),
};

export default config({ db: dbConfig, ui: uiConfig, lists });
