import { list } from '@keystone-next/keystone/schema';
import { select, relationship, text, timestamp } from '@keystone-next/fields';
import { KeystoneContext } from '../../packages/types/src';

type Context = KeystoneContext & { foo: string };

export const lists = {
  Post: list({
    fields: {
      title: text({ isRequired: true, isFilterable: true }),
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
    access: {
      read: true,
      update: true,
      create: true,
      delete: ({ context }: { context: Context }) => context.foo === 'bar',
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
