import { createSchema, list } from '@keystone-next/keystone/schema';
import { select, relationship, text, timestamp, image } from '@keystone-next/fields';
import { document } from '@keystone-next/fields-document';

export const lists = createSchema({
  Post: list({
    fields: {
      title: text({ isRequired: true }),
      status: select({
        dataType: 'enum',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ],
        ui: {
          displayMode: 'segmented-control',
        },
      }),
      content: document({
        formatting: true,
        links: true,
      }),
      publishDate: timestamp(),
      // author: relationship({
      //   ref: 'Author.posts',
      //   ui: {
      //     displayMode: 'cards',
      //     cardFields: ['name', 'email'],
      //     inlineEdit: { fields: ['name', 'email'] },
      //     linkToItem: true,
      //     inlineCreate: { fields: ['name', 'email'] },
      //   },
      // }),
      finishBy: timestamp(),
    },
  }),
  // Author: list({
  //   ui: {
  //     listView: {
  //       initialColumns: ['name', 'posts', 'avatar'],
  //     },
  //   },
  //   fields: {
  //     name: text({ isRequired: true }),
  //     email: text({ isRequired: true, isUnique: true }),
  //     avatar: image(),
  //     posts: relationship({ ref: 'Post.author', many: true }),
  //   },
  // }),
});
