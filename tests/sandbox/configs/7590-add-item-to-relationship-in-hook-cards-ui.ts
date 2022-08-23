import { list, config } from '@keystone-6/core';
import { relationship, text } from '@keystone-6/core/fields';
import { dbConfig } from '../utils';

export const models = {
  User: list({
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
    fields: {
      user: relationship({ ref: 'User.numbers' }),
      value: text({ validation: { isRequired: true } }),
    },
  }),
};

export default config({ db: dbConfig, models });
