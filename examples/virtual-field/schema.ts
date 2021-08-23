import { createSchema, list } from '@keystone-next/keystone';
import { select, relationship, text, timestamp, virtual } from '@keystone-next/keystone/fields';
import { schema } from '@keystone-next/keystone/types';

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
          type: schema.object<{
            words: number;
            sentences: number;
            paragraphs: number;
          }>()({
            name: 'PostCounts',
            fields: {
              words: schema.field({ type: schema.Int }),
              sentences: schema.field({ type: schema.Int }),
              paragraphs: schema.field({ type: schema.Int }),
            },
          }),
          resolve(item: any) {
            const content = item.content || '';
            return {
              words: content.split(' ').length,
              sentences: content.split('.').length,
              paragraphs: content.split('\n\n').length,
            };
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
            const content = item.content as string;
            if (content.length <= length) {
              return content;
            } else {
              return content.slice(0, length - 3) + '...';
            }
          },
        }),
        graphQLReturnFragment: '(length: 10)',
      }),
      publishDate: timestamp(),
      author: relationship({ ref: 'Author.posts', many: false }),
      // A virtual field which uses `item` and `context` to query data.
      authorName: virtual({
        field: schema.field({
          type: schema.String,
          async resolve(item, args, context) {
            const { author } = await context.lists.Post.findOne({
              where: { id: item.id.toString() },
              query: 'author { name }',
            });
            return author && author.name;
          },
        }),
      }),
    },
  }),
  Author: list({
    fields: {
      name: text({ isRequired: true }),
      email: text({ isRequired: true, isUnique: true }),
      posts: relationship({ ref: 'Post.author', many: true }),
      // A virtual field which returns a type derived from a Keystone list.
      latestPost: virtual({
        field: lists =>
          schema.field({
            type: lists.Post.types.output,
            async resolve(item, args, context) {
              const { posts } = await context.lists.Author.findOne({
                where: { id: item.id.toString() },
                query: `posts(
                    orderBy: { publishDate: desc }
                    take: 1
                  ) { id }`,
              });
              if (posts.length > 0) {
                return context.db.lists.Post.findOne({ where: { id: posts[0].id } });
              }
            },
          }),
        graphQLReturnFragment: '{ title publishDate }',
      }),
    },
  }),
});
