// This demonstrates the most basic Nexus usage to query a list of things

import { extendType, objectType } from 'nexus';

export const Thing = objectType({
  name: 'Thing',
  definition(t) {
    t.int('id');
    t.string('title');
  },
});

export const ThingQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('things', {
      type: 'Thing',
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
