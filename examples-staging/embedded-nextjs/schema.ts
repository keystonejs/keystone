import { list } from '@keystone-6/keystone';
import { text } from '@keystone-6/keystone/fields';

export const Post = list({
  fields: {
    title: text({ validation: { isRequired: true } }),
    slug: text(),
    content: text(),
  },
});
