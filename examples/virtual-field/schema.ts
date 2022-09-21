import { list, graphql } from '@keystone-6/core';
import { select, relationship, text, timestamp, virtual } from '@keystone-6/core/fields';
import { allowAll } from '@keystone-6/core/access';
import { Lists, Context } from '.keystone/types';

export const lists: Lists = {
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
      // A virtual field returning a value derived from the item data.
      isPublished: virtual({
        field: graphql.field({
          type: graphql.Boolean,
          resolve(item: any) {
            return item.status === 'published';
          },
        }),
      }),
      content: text({ ui: { displayMode: 'textarea' } }),
      // A virtual field returning a custom GraphQL object type.
      counts: virtual({
        ui: {
          itemView: { fieldMode: 'hidden' },
          listView: { fieldMode: 'hidden' },
        },
        field: graphql.field({
          type: graphql.object<{
            words: number;
            sentences: number;
            paragraphs: number;
          }>()({
            name: 'PostCounts',
            fields: {
              words: graphql.field({ type: graphql.Int }),
              sentences: graphql.field({ type: graphql.Int }),
              paragraphs: graphql.field({ type: graphql.Int }),
            },
          }),
          resolve(item) {
            const content = item.content || '';
            return {
              words: content.split(' ').length,
              sentences: content.split('.').length,
              paragraphs: content.split('\n\n').length,
            };
          },
        }),
      }),
      // A virtual field which accepts GraphQL arguments.
      excerpt: virtual({
        field: graphql.field({
          type: graphql.String,
          args: {
            length: graphql.arg({ type: graphql.nonNull(graphql.Int), defaultValue: 200 }),
          },
          resolve(item, { length }) {
            if (!item.content) {
              return null;
            }
            const content = item.content;
            if (content.length <= length) {
              return content;
            } else {
              return content.slice(0, length - 3) + '...';
            }
          },
        }),
        ui: { query: '(length: 10)' },
      }),
      publishDate: timestamp(),
      author: relationship({ ref: 'Author.posts', many: false }),
      // A virtual field which uses `item` and `context` to query data.
      authorName: virtual({
        field: graphql.field({
          type: graphql.String,
          async resolve(item, args, _context) {
            const context = _context as Context;
            const { author } = await context.query.Post.findOne({
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
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ isIndexed: 'unique', validation: { isRequired: true } }),
      posts: relationship({ ref: 'Post.author', many: true }),
      // A virtual field which returns a type derived from a Keystone list.
      latestPost: virtual({
        field: lists =>
          graphql.field({
            type: lists.Post.types.output,
            async resolve(item, args, _context) {
              const context = _context as Context;
              const { posts } = await context.query.Author.findOne({
                where: { id: item.id.toString() },
                query: `posts(
                    orderBy: { publishDate: desc }
                    take: 1
                  ) { id }`,
              });
              if (posts.length > 0) {
                return context.db.Post.findOne({ where: { id: posts[0].id } });
              }
            },
          }),
        ui: { query: '{ title publishDate }' },
      }),
    },
  }),
};
