import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { select, relationship, text, timestamp } from '@keystone-6/core/fields';

export const lists = {
  Settings: list({
    access: allowAll,
    isSingleton: true,
    fields: {
      websiteName: text(),
      copyrightText: text(),
      highlightedPosts: relationship({ ref: 'Post', many: true }),
    },
    graphql: {
      plural: 'ManySettings',
    },
  }),
  Post: list({
    access: allowAll,
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
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ isIndexed: 'unique', validation: { isRequired: true } }),
      posts: relationship({ ref: 'Post.author', many: true }),
    },
  }),
};
