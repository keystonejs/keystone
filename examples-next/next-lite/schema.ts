import { list } from '@keystone-next/keystone/schema';
import { checkbox, text } from '@keystone-next/fields';

export const Post = list({
  fields: {
    title: text({ isRequired: true }),
    slug: checkbox(),
    content: text(),
  },
});
