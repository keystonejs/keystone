/* -- NOTES --

This example demonstrates using the prisma client (from Keystone's context)
to return posts with a custom nexus-specified type.

Ideally, we could tell Nexus about the GraphQL schema Keystone generates and
not need to generate the output type again here, but that needs some more
research (and maybe a plugin for nexus?)
*/

import { extendType, intArg, list, stringArg, nonNull, objectType } from 'nexus';

export const NexusPost = objectType({
  name: 'NexusPost',
  definition(t) {
    t.string('id');
    t.string('title');
    t.string('status');
    t.string('content');
  },
});

export const PostQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('nexusPosts', {
      type: nonNull(list('NexusPost')),
      args: {
        authorId: stringArg(),
        days: nonNull(intArg({ default: 7 })),
      },
      async resolve(root, { authorId, days }, context) {
        const cutoff = new Date(
          new Date().setUTCDate(new Date().getUTCDate() - days)
        ).toISOString();

        return await context.prisma.post.findMany({
          where: {
            ...(authorId ? { author: { id: authorId } } : null),
            publishDate: { gt: cutoff },
          },
        });
      },
    });
  },
});
