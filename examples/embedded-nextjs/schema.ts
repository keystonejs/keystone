import { list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';
import { allowAll } from '@keystone-6/core/access';

export const Post = list({
  access: allowAll,
  fields: {
    title: text({ validation: { isRequired: true } }),
    slug: text(),
    content: text(),
  },
});
