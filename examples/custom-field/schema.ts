import { list } from '@keystone-6/core';

import { allowAll } from '@keystone-6/core/access';
import { text } from './1-text-field';
import { stars } from './2-stars-field';
import { pair } from './3-pair-field';

import { Lists } from '.keystone/types';

export const lists: Lists = {
  Post: list({
    access: allowAll,
    fields: {
      content: text({
        ui: {
          description: 'A text field, with no null support',
        },
      }),
      rating: stars({
        ui: {
          description: 'A star rating, with a scale of 5',
        },
      }),
      pair: pair({
        ui: {
          description: 'Two words split by a space',
        },
      }), // TODO: this example is a bit abstract, should be contextualised
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
    },
  }),
};
