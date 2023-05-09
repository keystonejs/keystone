import { list } from '@keystone-6/core';

import { allowAll } from '@keystone-6/core/access';
import { text } from './1-text-field';
import { stars } from './2-stars-field';
import { pair } from './3-pair-field';
import { pair as pairNested } from './3-pair-field-nested';
import { pair as pairJson } from './3-pair-field-json';

import { Lists } from '.keystone/types';

export const lists: Lists = {
  Post: list({
    access: allowAll,
    fields: {
      content: text({
        ui: {
          description: 'A text field, with no null support',
        },

        hooks: {
          resolveInput: async ({ resolvedData, operation, inputData, item, fieldKey }) => {
            console.log('Post.content.hooks.resolveInput', {
              resolvedData,
              operation,
              inputData,
              item,
              fieldKey,
            });
            return resolvedData[fieldKey];
          },

          validateInput: async ({
            resolvedData,
            inputData,
            item,
            addValidationError,
            fieldKey,
          }) => {
            console.log('Post.content.hooks.validateInput', {
              resolvedData,
              inputData,
              item,
              fieldKey,
            });
          },
        },
      }),
      rating: stars({
        ui: {
          description: 'A star rating, with a scale of 5',
        },
      }),
      pair: pair({
        ui: {
          description: 'One string, two database string fields',
        },
      }),
      pairNested: pairNested({
        ui: {
          description: 'Two strings, two database string fields',
        },
      }),
      pairJson: pairJson({
        ui: {
          description: 'Two strings, one database JSON field',
        },
      }),
    },
    hooks: {
      // TODO: this is  an example of how hooks interact with custom multiple-column fields,
      //   but it isn't very meaningful in context
      resolveInput: async ({ resolvedData, operation, inputData, item }) => {
        console.log('Post.hooks.resolveInput', { resolvedData, operation, inputData, item });
        return {
          ...resolvedData,

          // add some defaults
          pair: {
            left: resolvedData.pair?.left,
            right: resolvedData.pair?.right,
          },
        };
      },

      validateInput: async ({ resolvedData, operation, inputData, item, addValidationError }) => {
        console.log('Post.hooks.validateInput', { resolvedData, operation, inputData, item });

        if (Math.random() > 0.95) {
          addValidationError('oh oh, try again, this is part of the example');
        }
      },
    },
  }),
};
