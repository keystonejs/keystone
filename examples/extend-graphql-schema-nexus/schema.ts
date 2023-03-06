import type { GraphQLSchema } from 'graphql';
import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { select, relationship, text, timestamp } from '@keystone-6/core/fields';
import { mergeSchemas } from '@graphql-tools/schema';
import * as nexus from 'nexus';
import type { Context, Lists } from '.keystone/types';

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

export function extendGraphqlSchema(baseSchema: GraphQLSchema) {
  const NexusPostQuery = nexus.extendType({
    type: 'Query',
    definition(t) {
      t.field('nexusPosts', {
        type: nexus.nonNull(nexus.list('Post')),
        args: {
          authorId: nexus.stringArg(),
          seconds: nexus.nonNull(nexus.intArg({ default: 600 })),
        },
        async resolve(root, { authorId, seconds }, context: Context) {
          const cutoff = new Date(Date.now() - seconds * 1000);

          return await context.db.Post.findMany({
            where: {
              ...(authorId ? { author: { id: authorId } } : null),
              publishDate: { gt: cutoff },
            },
          });
        },
      });
    },
  });

  const NexusThing = nexus.objectType({
    name: 'NexusThing',
    definition(t) {
      t.int('id');
      t.string('title');
    },
  });

  const NexusThingQuery = nexus.extendType({
    type: 'Query',
    definition(t) {
      t.nonNull.list.field('things', {
        type: NexusThing,
        resolve() {
          return [
            { id: 1, title: 'Keystone' },
            { id: 2, title: 'Prisma' },
            { id: 3, title: 'Nexus' },
          ];
        },
      });
    },
  });

  return nexus.makeSchema({
    mergeSchema: {
      schema: baseSchema,
    },
    types: {
      NexusThing,
      NexusPostQuery,
      NexusThingQuery,
    },
  });
}
