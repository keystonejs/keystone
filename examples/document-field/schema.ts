import { list } from '@keystone-next/keystone';
import { select, relationship, text, timestamp } from '@keystone-next/keystone/fields';
import { document } from '@keystone-next/fields-document';

export const lists = {
  Post: list({
    fields: {
      title: text({ isRequired: true }),
      slug: text({ isRequired: true, isIndexed: 'unique' }),
      status: select({
        dataType: 'enum',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ],
      }),
      content: document({
        // We want to have support a fully featured document editor for our
        // authors, so we're enabling all of the formatting abilities and
        // providing 1, 2 or 3 column layouts.
        formatting: true,
        dividers: true,
        links: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
        ],
        // We want to support twitter-style mentions in blogs, so we add an
        // inline relationship which references the `Author` list.
        relationships: {
          mention: {
            kind: 'inline',
            listKey: 'Author',
            label: 'Mention', // This will display in the Admin UI toolbar behind the `+` icon
            selection: 'id name', // These fields will be available to the renderer
          },
        },
      }),
      publishDate: timestamp(),
      author: relationship({ ref: 'Author.posts', many: false }),
    },
  }),
  Author: list({
    fields: {
      name: text({ isRequired: true }),
      email: text({ isRequired: true, isIndexed: 'unique' }),
      posts: relationship({ ref: 'Post.author', many: true }),
      bio: document({
        // We want to constrain the formatting in Author bios to a limited set of options.
        // We will allow bold, italics, unordered lists, and links.
        // See the document field guide for a complete list of configurable options
        formatting: {
          inlineMarks: {
            bold: true,
            italic: true,
          },
          listTypes: { unordered: true },
        },
        links: true,
      }),
    },
  }),
};
