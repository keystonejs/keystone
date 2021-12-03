import { list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export const Post = list({
  fields: {
    title: text({ validation: { isRequired: true } }),
    slug: text(),
    content: text(),
  },
});
