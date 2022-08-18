import { list } from '@keystone-6/core';
import { select, relationship, timestamp } from '@keystone-6/core/fields';

import { text } from './1-text-field';
import { stars } from './2-stars-field';
import { pair } from './3-pair-field';

import { Lists } from '.keystone/types';

export const lists: Lists = {
  Post: list({
    fields: {
      title: text({ validation: { isRequired: true } }),
      status: select({
        type: 'enum',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ],
      }),
      content: text(),
      rating: stars(),
      pair: pair(), // TODO: this example is a bit abstract, should be contextualised
      publishDate: timestamp(),
      author: relationship({ ref: 'Author.posts', many: false }),
    },
    hooks: {
      // TODO: this is  an example of how hooks interact with custom multiple-column fields,
      //   but it isn't very meaningful in context
      resolveInput: async ({ resolvedData, operation, item }) => {
        console.log('Post.hooks.resolveInput', { resolvedData, operation, item });

        if (operation === 'create') return resolvedData;
        return {
          ...resolvedData,

          pair: {
            left: resolvedData.left || '<blank>',
            right: resolvedData.right|| '<blank>',
          },
        }
      },
    },
  }),
  Author: list({
    fields: {
      name: text({ validation: { isRequired: true } }),
      posts: relationship({ ref: 'Post.author', many: true }),
    },
  }),
};
