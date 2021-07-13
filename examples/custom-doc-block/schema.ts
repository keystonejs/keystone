import { createSchema, list } from '@keystone-next/keystone/schema';
import { select, relationship, text, timestamp } from '@keystone-next/fields';
import { document } from '@keystone-next/fields-document';
import { componentBlocks } from './document-field-view';

export const lists = createSchema({
  Author: list({
    fields: {
      name: text({ isRequired: true }),
      email: text({ isRequired: true, isUnique: true }),
      posts: relationship({ ref: 'Post.author', many: true }),
      // we only want to allow bios to have links and no other formatting things
      bio: document({
        formatting: undefined,
        dividers: undefined,
        links: true,
        layouts: undefined,
      }),
    },
  }),
  Post: list({
    fields: {
      title: text({ isRequired: true }),
      slug: text({ isRequired: true, isUnique: true }),
      status: select({
        dataType: 'enum',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ],
      }),
      content: document({
        // we're enabling all of the formatting abilities
        // we could provide an object here to only enable some specific formatting features
        formatting: true,
        dividers: true,
        links: true,
        layouts: [
          [1, 1],
          [2, 1],
        ],
        // we need to provide the component blocks here as well as in the seperate file
        // that's loaded in the front-end because Keystone runs validation from component blocks on the server
        componentBlocks,
        ui: {
          views: require.resolve('./document-field-view'),
        },
      }),
      publishDate: timestamp(),
      author: relationship({ ref: 'Author.posts', many: false }),
    },
  }),
});
