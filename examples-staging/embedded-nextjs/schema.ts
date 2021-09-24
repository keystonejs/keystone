import { list } from '@keystone-next/keystone';
import { text } from '@keystone-next/keystone/fields';

export const Post = list({
  fields: {
    title: text({ validation: { isRequired: true } }),
    slug: text(),
    content: text(),
  },
});
