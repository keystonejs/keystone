import { list } from '@keystone-next/keystone';
import { select, relationship, text, timestamp } from '@keystone-next/keystone/fields';

export const lists = {
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
      publishDate: timestamp(),
      author: relationship({ ref: 'Author.posts', many: false }),
    },
  }),
  Author: list({
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ isIndexed: 'unique', validation: { isRequired: true } }),
      posts: relationship({ ref: 'Post.author', many: true }),
    },
  }),
};
