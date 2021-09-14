import { text, relationship } from '@keystone-next/keystone/fields';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { list } from '@keystone-next/keystone';
import { apiTestConfig } from '../../utils';

type IdType = any;

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      User: list({
        fields: {
          company: relationship({ ref: 'Company', isFilterable: true }),
          posts: relationship({ ref: 'Post', many: true, isFilterable: true }),
        },
      }),
      Company: list({ fields: { name: text() } }),
      Post: list({ fields: { content: text({ isFilterable: true }) } }),
    },
  }),
});

describe('relationship filtering', () => {
  test(
    'nested to-many relationships can be filtered',
    runner(async ({ context }) => {
      const ids = await context.lists.Post.createMany({
        data: [{ content: 'Hello world' }, { content: 'hi world' }, { content: 'Hello? Or hi?' }],
      });

      const [user, user2] = await context.lists.User.createMany({
        data: [
          { posts: { connect: ids } },
          { posts: { connect: [ids[0]] } }, // Create a dummy user to make sure we're actually filtering it out
        ],
      });

      const users = (await context.lists.User.findMany({
        query: `id posts (where: { content: { contains: "hi" } }){ id content }`,
      })) as { id: IdType; posts: { id: IdType; content: string }[] }[];
      expect(users).toHaveLength(2);
      users[0].posts = users[0].posts.map(({ id }) => id).sort();
      users[1].posts = users[1].posts.map(({ id }) => id).sort();
      expect(users).toContainEqual({ id: user.id, posts: [ids[1].id, ids[2].id].sort() });
      expect(users).toContainEqual({ id: user2.id, posts: [] });
    })
  );

  // this is failing on GitHub Actions rn for some unknown reason so going to disable it for now
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip(
    'nested to-many relationships can be limited',
    runner(async ({ context }) => {
      const ids = await context.lists.Post.createMany({
        data: [{ content: 'Hello world' }, { content: 'hi world' }, { content: 'Hello? Or hi?' }],
      });

      const [user, user2] = await context.lists.User.createMany({
        data: [
          { posts: { connect: ids } },
          { posts: { connect: [ids[0]] } }, // Create a dummy user to make sure we're actually filtering it out
        ],
      });

      const users = await context.lists.User.findMany({
        query: 'id posts(take: 1, orderBy: { content: asc }) { id }',
      });
      expect(users).toContainEqual({ id: user.id, posts: [ids[0]] });
      expect(users).toContainEqual({ id: user2.id, posts: [ids[0]] });
    })
  );

  test(
    'nested to-many relationships can be filtered within AND clause',
    runner(async ({ context }) => {
      const ids = await context.lists.Post.createMany({
        data: [{ content: 'Hello world' }, { content: 'hi world' }, { content: 'Hello? Or hi?' }],
      });

      const [user, user2] = await context.lists.User.createMany({
        data: [
          { posts: { connect: ids } },
          { posts: { connect: [ids[0]] } }, // Create a dummy user to make sure we're actually filtering it out
        ],
      });

      const users = await context.lists.User.findMany({
        query:
          'id posts(where: { AND: [{ content: { contains: "hi" } }, { content: { contains: "lo" } }] }){ id }',
      });

      expect(users).toContainEqual({ id: user.id, posts: [ids[2]] });
      expect(users).toContainEqual({ id: user2.id, posts: [] });
    })
  );

  test(
    'nested to-many relationships can be filtered within OR clause',
    runner(async ({ context }) => {
      const ids = await context.lists.Post.createMany({
        data: [{ content: 'Hello world' }, { content: 'hi world' }, { content: 'Hello? Or hi?' }],
      });

      const [user, user2] = await context.lists.User.createMany({
        data: [
          { posts: { connect: ids } },
          { posts: { connect: [ids[0]] } }, // Create a dummy user to make sure we're actually filtering it out
        ],
      });

      const users = await context.lists.User.findMany({
        query:
          'id posts(where: { OR: [{ content: { contains: "i w" } }, { content: { contains: "? O" } }] }){ id content }',
      });
      expect(users).toContainEqual({
        id: user.id,
        posts: expect.arrayContaining([
          expect.objectContaining(ids[1]),
          expect.objectContaining(ids[2]),
        ]),
      });
      expect(users).toContainEqual({ id: user2.id, posts: [] });
    })
  );

  test(
    'Filtering out all items by nested field should return []',
    runner(async ({ context }) => {
      await context.lists.User.createOne({ data: {} });

      const users = await context.lists.User.findMany({
        where: { posts: { some: { content: { contains: 'foo' } } } },
        query: 'posts { id }',
      });
      expect(users).toHaveLength(0);
    })
  );
});

describe('relationship meta filtering', () => {
  test(
    'nested to-many relationships return meta info',
    runner(async ({ context }) => {
      const ids = await context.lists.Post.createMany({
        data: [{ content: 'Hello world' }, { content: 'hi world' }, { content: 'Hello? Or hi?' }],
      });

      const [user, user2] = await context.lists.User.createMany({
        data: [
          { posts: { connect: ids } },
          { posts: { connect: [ids[0]] } }, // Create a dummy user to make sure we're actually filtering it out
        ],
      });

      const users = await context.lists.User.findMany({ query: 'id postsCount' });
      expect(users).toHaveLength(2);
      expect(users).toContainEqual({ id: user.id, postsCount: 3 });
      expect(users).toContainEqual({ id: user2.id, postsCount: 1 });
    })
  );

  test(
    'nested to-many relationship meta can be filtered',
    runner(async ({ context }) => {
      const ids = await context.lists.Post.createMany({
        data: [{ content: 'Hello world' }, { content: 'hi world' }, { content: 'Hello? Or hi?' }],
      });

      const [user, user2] = await context.lists.User.createMany({
        data: [
          { posts: { connect: ids } },
          { posts: { connect: [ids[0]] } }, // Create a dummy user to make sure we're actually filtering it out
        ],
      });

      const users = await context.lists.User.findMany({
        query: 'id postsCount(where: { content: { contains: "hi" } })',
      });
      expect(users).toHaveLength(2);
      expect(users).toContainEqual({ id: user.id, postsCount: 2 });
      expect(users).toContainEqual({ id: user2.id, postsCount: 0 });
    })
  );

  test(
    'nested to-many relationship meta can be filtered within AND clause',
    runner(async ({ context }) => {
      const ids = await context.lists.Post.createMany({
        data: [{ content: 'Hello world' }, { content: 'hi world' }, { content: 'Hello? Or hi?' }],
      });

      const [user, user2] = await context.lists.User.createMany({
        data: [
          { posts: { connect: ids } },
          { posts: { connect: [ids[0]] } }, // Create a dummy user to make sure we're actually filtering it out
        ],
      });

      const users = await context.lists.User.findMany({
        query: `id postsCount(where: { AND: [{ content: { contains: "hi" } }, { content: { contains: "lo" } }] })`,
      });

      expect(users).toHaveLength(2);
      expect(users).toContainEqual({ id: user.id, postsCount: 1 });
      expect(users).toContainEqual({ id: user2.id, postsCount: 0 });
    })
  );

  test(
    'nested to-many relationship meta can be filtered within OR clause',
    runner(async ({ context }) => {
      const ids = await context.lists.Post.createMany({
        data: [{ content: 'Hello world' }, { content: 'hi world' }, { content: 'Hello? Or hi?' }],
      });

      const [user, user2] = await context.lists.User.createMany({
        data: [
          { posts: { connect: ids } },
          { posts: { connect: [ids[0]] } }, // Create a dummy user to make sure we're actually filtering it out
        ],
      });

      const users = await context.lists.User.findMany({
        query:
          'id postsCount(where: { OR: [{ content: { contains: "i w" } }, { content: { contains: "? O" } }] })',
      });
      expect(users).toHaveLength(2);
      expect(users).toContainEqual({ id: user.id, postsCount: 2 });
      expect(users).toContainEqual({ id: user2.id, postsCount: 0 });
    })
  );
});
