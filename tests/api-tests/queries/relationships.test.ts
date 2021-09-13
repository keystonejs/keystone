import { gen, sampleOne } from 'testcheck';

import { text, relationship } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig } from '../utils';

const alphanumGenerator = gen.alphaNumString.notEmpty();

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      Post: list({
        fields: {
          title: text({ isFilterable: true, isOrderable: true }),
          author: relationship({ ref: 'User', isFilterable: true }),
        },
      }),
      User: list({
        fields: {
          name: text({ isFilterable: true }),
          feed: relationship({ ref: 'Post', many: true, isFilterable: true }),
        },
      }),
    },
  }),
});

describe('Querying with relationship filters', () => {
  describe('to-single', () => {
    test(
      'with data',
      runner(async ({ context }) => {
        // Create an item to link against
        const users = await context.lists.User.createMany({
          data: [{ name: 'Jess' }, { name: 'Johanna' }, { name: 'Sam' }],
        });
        const posts = await context.lists.Post.createMany({
          data: [
            { author: { connect: { id: users[0].id } }, title: sampleOne(alphanumGenerator) },
            { author: { connect: { id: users[1].id } }, title: sampleOne(alphanumGenerator) },
            { author: { connect: { id: users[2].id } }, title: sampleOne(alphanumGenerator) },
            { author: { connect: { id: users[0].id } }, title: sampleOne(alphanumGenerator) },
          ],
          query: 'id title',
        });

        // Create an item that does the linking
        const allPosts = await context.lists.Post.findMany({
          where: { author: { name: { contains: 'J' } } },
          query: 'id title',
        });
        expect(allPosts).toHaveLength(3);

        // We don't know the order, so we have to check individually
        expect(allPosts).toContainEqual({ id: posts[0].id, title: posts[0].title });
        expect(allPosts).toContainEqual({ id: posts[1].id, title: posts[1].title });
        expect(allPosts).toContainEqual({ id: posts[3].id, title: posts[3].title });
      })
    );

    test(
      'without data',
      runner(async ({ context }) => {
        // Create an item to link against
        const user = await context.lists.User.createOne({ data: { name: 'Jess' } });
        const posts = await context.lists.Post.createMany({
          data: [
            { author: { connect: { id: user.id } }, title: sampleOne(alphanumGenerator) },
            { title: sampleOne(alphanumGenerator) },
          ],
          query: 'id title',
        });

        // Create an item that does the linking
        const _posts = await context.lists.Post.findMany({
          where: { author: { name: { contains: 'J' } } },
          query: 'id title author { id name }',
        });
        expect(_posts).toMatchObject([{ id: posts[0].id, title: posts[0].title }]);
      })
    );
  });

  describe('to-many', () => {
    const setup = async (create: (...args: any) => Promise<any>) => {
      const posts = await Promise.all([
        create('Post', { title: 'Hello' }),
        create('Post', { title: 'Just in time' }),
        create('Post', { title: 'Bye' }),
        create('Post', { title: 'I like Jelly' }),
      ]);

      const users = await Promise.all([
        create('User', {
          feed: { connect: [{ id: posts[0].id }, { id: posts[1].id }] },
          name: sampleOne(alphanumGenerator),
        }),
        create('User', {
          feed: { connect: [{ id: posts[2].id }] },
          name: sampleOne(alphanumGenerator),
        }),
        create('User', {
          feed: { connect: [{ id: posts[3].id }] },
          name: sampleOne(alphanumGenerator),
        }),
      ]);

      return { posts, users };
    };

    test(
      'every condition',
      runner(async ({ context }) => {
        const create = async (listKey: string, data: any) =>
          context.lists[listKey].createOne({ data });
        const { users } = await setup(create);

        // EVERY
        const _users = await context.lists.User.findMany({
          where: { feed: { every: { title: { contains: 'J' } } } },
          query: 'id name feed { id title }',
        });

        expect(_users).toMatchObject([{ id: users[2].id, feed: [{ title: 'I like Jelly' }] }]);
      })
    );

    test(
      'some condition',
      runner(async ({ context }) => {
        const create = async (listKey: string, data: any) =>
          context.lists[listKey].createOne({ data });
        const { users } = await setup(create);

        // SOME
        const _users = await context.lists.User.findMany({
          where: { feed: { some: { title: { contains: 'J' } } } },
          query: 'id feed(orderBy: { title: asc }) { title }',
        });

        expect(_users).toHaveLength(2);
        // We don't know the order, so we have to check individually
        expect(_users).toContainEqual({
          id: users[0].id,
          feed: [{ title: 'Hello' }, { title: 'Just in time' }],
        });
        expect(_users).toContainEqual({ id: users[2].id, feed: [{ title: 'I like Jelly' }] });
      })
    );

    test(
      'none condition',
      runner(async ({ context }) => {
        const create = async (listKey: string, data: any) =>
          context.lists[listKey].createOne({ data });
        const { users } = await setup(create);

        // NONE
        const _users = await context.lists.User.findMany({
          where: { feed: { none: { title: { contains: 'J' } } } },
          query: 'id name feed { id title }',
        });

        expect(_users).toMatchObject([{ id: users[1].id, feed: [{ title: 'Bye' }] }]);
      })
    );
  });

  describe('to-many with empty list', () => {
    const setup = async (create: (...args: any) => Promise<any>) => {
      const posts = await Promise.all([
        create('Post', { title: 'Hello' }),
        create('Post', { title: 'I like Jelly' }),
      ]);

      const users = await Promise.all([
        create('User', {
          feed: { connect: [{ id: posts[0].id }, { id: posts[1].id }] },
          name: sampleOne(alphanumGenerator),
        }),
        create('User', {
          feed: { connect: [{ id: posts[0].id }] },
          name: sampleOne(alphanumGenerator),
        }),
        create('User', { name: sampleOne(alphanumGenerator) }),
        create('User', { name: sampleOne(alphanumGenerator) }),
      ]);

      return { posts, users };
    };

    test(
      'every condition',
      runner(async ({ context }) => {
        const create = async (listKey: string, data: any) =>
          context.lists[listKey].createOne({ data });
        const { users } = await setup(create);

        // EVERY
        const _users = await context.lists.User.findMany({
          where: { feed: { every: { title: { contains: 'J' } } } },
          query: 'id feed { id title }',
        });

        expect(_users).toHaveLength(2);
        expect(_users).toContainEqual({ id: users[2].id, feed: [] });
        expect(_users).toContainEqual({ id: users[3].id, feed: [] });
      })
    );

    test(
      'some condition',
      runner(async ({ context }) => {
        const create = async (listKey: string, data: any) =>
          context.lists[listKey].createOne({ data });
        const { users } = await setup(create);

        // SOME
        const _users = await context.lists.User.findMany({
          where: { feed: { some: { title: { contains: 'J' } } } },
          query: 'id name feed(orderBy: { title: asc }) { id title }',
        });

        expect(_users).toMatchObject([
          { id: users[0].id, feed: [{ title: 'Hello' }, { title: 'I like Jelly' }] },
        ]);
        expect(_users).toHaveLength(1);
      })
    );

    test(
      'none condition',
      runner(async ({ context }) => {
        const create = async (listKey: string, data: any) =>
          context.lists[listKey].createOne({ data });
        const { users } = await setup(create);

        // NONE
        const _users = await context.lists.User.findMany({
          where: { feed: { none: { title: { contains: 'J' } } } },
          query: 'id feed { title }',
        });

        expect(_users).toHaveLength(3);
        // We don't know the order, so we have to check individually
        expect(_users).toContainEqual({ id: users[1].id, feed: [{ title: 'Hello' }] });
        expect(_users).toContainEqual({ id: users[2].id, feed: [] });
        expect(_users).toContainEqual({ id: users[3].id, feed: [] });
      })
    );
  });

  describe('to-many with empty related list', () => {
    const setup = async (create: (...args: any) => Promise<any>) => {
      const users = await Promise.all([
        create('User', { name: sampleOne(alphanumGenerator) }),
        create('User', { name: sampleOne(alphanumGenerator) }),
        create('User', { name: sampleOne(alphanumGenerator) }),
        create('User', { name: sampleOne(alphanumGenerator) }),
      ]);

      return { users };
    };

    test(
      'every condition',
      runner(async ({ context }) => {
        const create = async (listKey: string, data: any) =>
          context.lists[listKey].createOne({ data });
        const { users } = await setup(create);

        // EVERY
        const _users = await context.lists.User.findMany({
          where: { feed: { every: { title: { contains: 'J' } } } },
          query: 'id feed { id title }',
        });

        expect(_users).toHaveLength(4);
        // We don't know the order, so we have to check individually
        expect(_users).toContainEqual({ id: users[0].id, feed: [] });
        expect(_users).toContainEqual({ id: users[1].id, feed: [] });
        expect(_users).toContainEqual({ id: users[2].id, feed: [] });
        expect(_users).toContainEqual({ id: users[3].id, feed: [] });
      })
    );

    test(
      'some condition',
      runner(async ({ context }) => {
        const create = async (listKey: string, data: any) =>
          context.lists[listKey].createOne({ data });
        const { users } = await setup(create);

        // SOME
        const _users = await context.lists.User.findMany({
          where: { feed: { some: { author: { id: { equals: users[0].id } } } } },
          query: 'id name feed { id title }',
        });
        expect(_users).toEqual([]);
      })
    );

    test(
      'none condition',
      runner(async ({ context }) => {
        const create = async (listKey: string, data: any) =>
          context.lists[listKey].createOne({ data });
        const { users } = await setup(create);

        // NONE
        const _users = await context.lists.User.findMany({
          where: { feed: { none: { title: { contains: 'J' } } } },
          query: 'id feed { title }',
        });

        expect(_users).toHaveLength(4);

        // We don't know the order, so we have to check individually
        expect(_users).toContainEqual({ id: users[0].id, feed: [] });
        expect(_users).toContainEqual({ id: users[1].id, feed: [] });
        expect(_users).toContainEqual({ id: users[2].id, feed: [] });
        expect(_users).toContainEqual({ id: users[3].id, feed: [] });
      })
    );
  });
});
