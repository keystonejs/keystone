import { list } from '@keystone-next/keystone';
import { select, relationship, text, timestamp, virtual } from '@keystone-next/keystone/fields';
import { graphql } from '@keystone-next/keystone/types';

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
          resolve(item: any) {
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
            const content = item.content as string;
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
      email: text({ isRequired: true, isIndexed: 'unique' }),
      posts: relationship({ ref: 'Post.author', many: true }),
      // A virtual field which returns a type derived from a Keystone list.
      latestPost: virtual({
        field: lists =>
          graphql.field({
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
        ui: { query: '{ title publishDate }' },
      }),
    },
  }),
};
