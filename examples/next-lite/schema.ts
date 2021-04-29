import { createSchema } from '@keystone-next/keystone/schema';
import { list } from '@keystone-next/keystone/schema';
import { text, relationship, password, checkbox } from '@keystone-next/fields';

const User = list({
  ui: {
    listView: {
      initialColumns: ['name', 'posts'],
    },
  },
  fields: {
    name: text({ isRequired: true }),
    email: text({ isRequired: true, isUnique: true }),
    password: password(),
    posts: relationship({ ref: 'Post.author', many: true }),
    isAdmin: checkbox(),
  },
});

const Post = list({
  fields: {
    title: text({ isRequired: true }),
    slug: text(),
    content: text(),
    author: relationship({
      ref: 'User.posts',
      ui: {
        displayMode: 'cards',
        cardFields: ['name', 'email'],
        inlineEdit: { fields: ['name', 'email'] },
        linkToItem: true,
        inlineCreate: { fields: ['name', 'email'] },
      },
    }),
  },
});

export const lists = createSchema({
  User: User,
  Post: Post,
});
