import { list } from '@keystone-next/keystone';
import { select, relationship, text, timestamp } from '@keystone-next/keystone/fields';

export const lists = {
  Post: list({
    fields: {
      title: text({ isRequired: true }),
      status: select({
        dataType: 'enum',
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
      name: text({ isRequired: true }),
      email: text({ isRequired: true, isIndexed: 'unique' }),
      posts: relationship({ ref: 'Post.author', many: true }),
    },
  }),
};
