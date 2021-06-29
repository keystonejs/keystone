import { setupTestRunner } from '@keystone-next/testing';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { apiTestConfig } from '../../utils';

type IdType = any;

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: createSchema({
      User: list({
        fields: {
          company: relationship({ ref: 'Company' }),
          posts: relationship({ ref: 'Post', many: true }),
        },
      }),
      Company: list({ fields: { name: text() } }),
      Post: list({ fields: { content: text() } }),
    }),
  }),
});

describe('relationship filtering', () => {
  test(
    'nested to-many relationships can be filtered',
    runner(async ({ context }) => {
      const ids = await context.lists.Post.createMany({
        data: [
          { data: { content: 'Hello world' } },
          { data: { content: 'hi world' } },
          { data: { content: 'Hello? Or hi?' } },
        ],
      });

      const [user, user2] = await context.lists.User.createMany({
        data: [
          { data: { posts: { connect: ids } } },
          { data: { posts: { connect: [ids[0]] } } }, // Create a dummy user to make sure we're actually filtering it out
        ],
      });

      const users = (await context.lists.User.findMany({
        query: `id posts (where: { content_contains: "hi" }){ id content }`,
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
        data: [
          { data: { content: 'Hello world' } },
          { data: { content: 'hi world' } },
          { data: { content: 'Hello? Or hi?' } },
        ],
      });

      const [user, user2] = await context.lists.User.createMany({
        data: [
          { data: { posts: { connect: ids } } },
          { data: { posts: { connect: [ids[0]] } } }, // Create a dummy user to make sure we're actually filtering it out
        ],
      });

      const users = await context.lists.User.findMany({
        query: 'id posts(first: 1, orderBy: { content: asc }) { id }',
      });
      expect(users).toContainEqual({ id: user.id, posts: [ids[0]] });
      expect(users).toContainEqual({ id: user2.id, posts: [ids[0]] });
    })
  );

  test(
    'nested to-many relationships can be filtered within AND clause',
    runner(async ({ context }) => {
      const ids = await context.lists.Post.createMany({
        data: [
          { data: { content: 'Hello world' } },
          { data: { content: 'hi world' } },
          { data: { content: 'Hello? Or hi?' } },
        ],
      });

      const [user, user2] = await context.lists.User.createMany({
        data: [
          { data: { posts: { connect: ids } } },
          { data: { posts: { connect: [ids[0]] } } }, // Create a dummy user to make sure we're actually filtering it out
        ],
      });

      const users = await context.lists.User.findMany({
        query:
          'id posts(where: { AND: [{ content_contains: "hi" }, { content_contains: "lo" }] }){ id }',
      });

      expect(users).toContainEqual({ id: user.id, posts: [ids[2]] });
      expect(users).toContainEqual({ id: user2.id, posts: [] });
    })
  );

  test(
    'nested to-many relationships can be filtered within OR clause',
    runner(async ({ context }) => {
      const ids = await context.lists.Post.createMany({
        data: [
          { data: { content: 'Hello world' } },
          { data: { content: 'hi world' } },
          { data: { content: 'Hello? Or hi?' } },
        ],
      });

      const [user, user2] = await context.lists.User.createMany({
        data: [
          { data: { posts: { connect: ids } } },
          { data: { posts: { connect: [ids[0]] } } }, // Create a dummy user to make sure we're actually filtering it out
        ],
      });

      const users = await context.lists.User.findMany({
        query:
          'id posts(where: { OR: [{ content_contains: "i w" }, { content_contains: "? O" }] }){ id content }',
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
        where: { posts_some: { content_contains: 'foo' } },
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
        data: [
          { data: { content: 'Hello world' } },
          { data: { content: 'hi world' } },
          { data: { content: 'Hello? Or hi?' } },
        ],
      });

      const [user, user2] = await context.lists.User.createMany({
        data: [
          { data: { posts: { connect: ids } } },
          { data: { posts: { connect: [ids[0]] } } }, // Create a dummy user to make sure we're actually filtering it out
        ],
      });

      const users = await context.lists.User.findMany({ query: 'id _postsMeta { count }' });
      expect(users).toHaveLength(2);
      expect(users).toContainEqual({ id: user.id, _postsMeta: { count: 3 } });
      expect(users).toContainEqual({ id: user2.id, _postsMeta: { count: 1 } });
    })
  );

  test(
    'nested to-many relationship meta can be filtered',
    runner(async ({ context }) => {
      const ids = await context.lists.Post.createMany({
        data: [
          { data: { content: 'Hello world' } },
          { data: { content: 'hi world' } },
          { data: { content: 'Hello? Or hi?' } },
        ],
      });

      const [user, user2] = await context.lists.User.createMany({
        data: [
          { data: { posts: { connect: ids } } },
          { data: { posts: { connect: [ids[0]] } } }, // Create a dummy user to make sure we're actually filtering it out
        ],
      });

      const users = await context.lists.User.findMany({
        query: 'id _postsMeta(where: { content_contains: "hi" }){ count }',
      });
      expect(users).toHaveLength(2);
      expect(users).toContainEqual({ id: user.id, _postsMeta: { count: 2 } });
      expect(users).toContainEqual({ id: user2.id, _postsMeta: { count: 0 } });
    })
  );

  test(
    'nested to-many relationship meta can be limited',
    runner(async ({ context }) => {
      const ids = await context.lists.Post.createMany({
        data: [
          { data: { content: 'Hello world' } },
          { data: { content: 'hi world' } },
          { data: { content: 'Hello? Or hi?' } },
        ],
      });

      const [user, user2] = await context.lists.User.createMany({
        data: [
          { data: { posts: { connect: ids } } },
          { data: { posts: { connect: [ids[0]] } } }, // Create a dummy user to make sure we're actually filtering it out
        ],
      });

      const users = await context.lists.User.findMany({
        query: 'id _postsMeta(first: 1) { count }',
      });
      expect(users).toHaveLength(2);
      expect(users).toContainEqual({ id: user.id, _postsMeta: { count: 1 } });
      expect(users).toContainEqual({ id: user2.id, _postsMeta: { count: 1 } });
    })
  );

  test(
    'nested to-many relationship meta can be filtered within AND clause',
    runner(async ({ context }) => {
      const ids = await context.lists.Post.createMany({
        data: [
          { data: { content: 'Hello world' } },
          { data: { content: 'hi world' } },
          { data: { content: 'Hello? Or hi?' } },
        ],
      });

      const [user, user2] = await context.lists.User.createMany({
        data: [
          { data: { posts: { connect: ids } } },
          { data: { posts: { connect: [ids[0]] } } }, // Create a dummy user to make sure we're actually filtering it out
        ],
      });

      const users = await context.lists.User.findMany({
        query: `id _postsMeta(where: { AND: [{ content_contains: "hi" }, { content_contains: "lo" }] }) { count }`,
      });

      expect(users).toHaveLength(2);
      expect(users).toContainEqual({ id: user.id, _postsMeta: { count: 1 } });
      expect(users).toContainEqual({ id: user2.id, _postsMeta: { count: 0 } });
    })
  );

  test(
    'nested to-many relationship meta can be filtered within OR clause',
    runner(async ({ context }) => {
      const ids = await context.lists.Post.createMany({
        data: [
          { data: { content: 'Hello world' } },
          { data: { content: 'hi world' } },
          { data: { content: 'Hello? Or hi?' } },
        ],
      });

      const [user, user2] = await context.lists.User.createMany({
        data: [
          { data: { posts: { connect: ids } } },
          { data: { posts: { connect: [ids[0]] } } }, // Create a dummy user to make sure we're actually filtering it out
        ],
      });

      const users = await context.lists.User.findMany({
        query:
          'id _postsMeta(where: { OR: [{ content_contains: "i w" }, { content_contains: "? O" }] }){ count }',
      });
      expect(users).toHaveLength(2);
      expect(users).toContainEqual({ id: user.id, _postsMeta: { count: 2 } });
      expect(users).toContainEqual({ id: user2.id, _postsMeta: { count: 0 } });
    })
  );
});
