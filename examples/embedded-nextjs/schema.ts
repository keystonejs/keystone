import { list } from '@keystone-next/keystone/schema';
import { text } from '@keystone-next/fields';

export const Post = list({
  fields: {
    title: text({ isRequired: true }),
    slug: text(),
    content: text(),
  },
});
