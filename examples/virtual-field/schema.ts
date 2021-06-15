import { createSchema, list } from '@keystone-next/keystone/schema';
import { select, relationship, text, timestamp, virtual } from '@keystone-next/fields';
import { schema } from '@keystone-next/types';

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
      }),
      // A virtual field returning a value derived from the item data.
      isPublished: virtual({
        field: schema.field({
          type: schema.Boolean,
          resolve(item: any) {
            return item.status === 'published';
          },
        }),
      }),
      content: text({ ui: { displayMode: 'textarea' } }),
      // A virtual field returning a custom GraphQL object type.
      counts: virtual({
        field: schema.field({
          type: schema.object<{ content: string }>()({
            name: 'PostCounts',
            fields: {
              words: schema.field({
                type: schema.Int,
                resolve({ content }) {
                  return content.split(' ').length;
                },
              }),
              sentences: schema.field({
                type: schema.Int,
                resolve({ content }) {
                  return content.split('.').length;
                },
              }),
              paragraphs: schema.field({
                type: schema.Int,
                resolve({ content }) {
                  return content.split('\n\n').length;
                },
              }),
            },
          }),
          resolve(item: any) {
            return { content: item.content || '' };
          },
        }),
        graphQLReturnFragment: '{ words sentences paragraphs }',
      }),
      // A virtual field which accepts GraphQL arguments.
      excerpt: virtual({
        field: schema.field({
          type: schema.String,
          args: {
            length: schema.arg({ type: schema.nonNull(schema.Int), defaultValue: 200 }),
          },
          resolve(item, { length }) {
            if (!item.content) {
              return null;
            }
            return (item.content as string).slice(0, length - 3) + '...';
          },
        }),
      }),
      // A virtual field which returns a type derived from a Keystone list.
      relatedPosts: virtual({
        field: lists =>
          schema.field({
            type: schema.list(schema.nonNull(lists.Post.types.output)),
            resolve(item, args, context) {
              // this could have some logic to get posts that are actually related to this one somehow
              // this is a just a naive "get the three latest posts that aren't this one"
              return context.db.lists.Post.findMany({
                first: 3,
                where: { id_not: item.id, status: 'published' },
                orderBy: [{ publishDate: 'desc' }],
              });
            },
          }),
        graphQLReturnFragment: '{ title }',
      }),
      publishDate: timestamp(),
      author: relationship({ ref: 'Author.posts', many: false }),
    },
  }),
  Author: list({
    fields: {
      name: text({ isRequired: true }),
      email: text({ isRequired: true, isUnique: true }),
      posts: relationship({ ref: 'Post.author', many: true }),
    },
  }),
});
