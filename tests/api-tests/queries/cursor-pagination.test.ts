import { KeystoneContext } from '@keystone-6/core/types';
import { setupTestEnv, TestEnv } from '@keystone-6/api-tests/test-runner';
import { text, relationship, integer } from '@keystone-6/core/fields';
import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { TypeInfoFromConfig, apiTestConfig } from '../utils';

const config = apiTestConfig({
  lists: {
    Post: list({
      access: allowAll,
      fields: {
        order: integer(),
        author: relationship({ ref: 'User.posts', many: true }),
      },
    }),
    User: list({
      access: allowAll,
      fields: {
        name: text(),
        posts: relationship({ ref: 'Post.author', many: true }),
      },
    }),
  },
});

describe('cursor pagination basic tests', () => {
  let testEnv: TestEnv<TypeInfoFromConfig<typeof config>>;
  let context: KeystoneContext;
  let posts: { id: string }[];

  beforeAll(async () => {
    testEnv = await setupTestEnv({ config });
    context = testEnv.testArgs.context;

    await testEnv.connect();

    const result = await context.query.User.createOne({
      data: {
        name: 'Test',
        posts: {
          create: Array.from(Array(15).keys()).map(num => ({ order: num })),
        },
      },
      query: 'id posts { id order }',
    });
    // sort posts just to be safe - maybe they are created concurrently
    posts = result.posts.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
  });
  afterAll(async () => {
    await testEnv.disconnect();
  });

  test('basic cursor pagination forward', async () => {
    const { errors: errors1, data: data1 } = await context.graphql.raw({
      query: `query { posts(
          take: 6,\
        ) { id order }\
      }`,
    });

    let currentOrder = 0;

    expect(errors1).toEqual(undefined);
    expect(data1).toEqual({
      posts: Array.from(Array(6).keys()).map(_ => posts[currentOrder++]),
    });

    const { errors: errors2, data: data2 } = await context.graphql.raw({
      query: `query { posts(
          take: 6,\
          skip: 1,\
          cursor: { id: "${posts[5].id}"}\
        ) { id order }\
      }`,
    });

    expect(errors2).toEqual(undefined);
    expect(data2).toEqual({
      posts: Array.from(Array(6).keys()).map(_ => posts[currentOrder++]),
    });

    const { errors: errors3, data: data3 } = await context.graphql.raw({
      query: `query { posts(
          take: 6,\
          skip: 1,\
          cursor: { id: "${posts[11].id}"}\
        ) { id order }\
      }`,
    });

    expect(errors3).toEqual(undefined);
    expect(data3).toEqual({
      posts: Array.from(Array(3).keys()).map(_ => posts[currentOrder++]),
    });
  });
});

describe('cursor pagination stability', () => {
  let testEnv: TestEnv<TypeInfoFromConfig<typeof config>>;
  let context: KeystoneContext;
  let posts: { id: string }[];

  beforeEach(async () => {
    testEnv = await setupTestEnv({ config });
    context = testEnv.testArgs.context;

    await testEnv.connect();

    const result = await context.query.User.createOne({
      data: {
        name: 'Test',
        posts: {
          create: Array.from(Array(15).keys()).map(num => ({ order: num })),
        },
      },
      query: 'id posts { id order }',
    });
    // sort posts just to be safe - maybe they are created concurrently
    posts = result.posts.sort((a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id));
  });
  afterEach(async () => {
    await testEnv.disconnect();
  });

  test('insert rows in the middle of pagination and check stability', async () => {
    const { errors: errors1, data: data1 } = await context.graphql.raw({
      query: `query { posts(\
          take: 6,\
          orderBy: { id: desc }\
        ) { id order }\
      }`,
    });

    let currentOrder = 14;

    expect(errors1).toEqual(undefined);
    expect(data1).toEqual({
      posts: Array.from(Array(6).keys()).map(_ => posts[currentOrder--]),
    });

    await context.query.Post.createMany({
      data: [{ order: 15 }, { order: 16 }, { order: 17 }, { order: 18 }],
    });

    const { errors: errors2, data: data2 } = await context.graphql.raw({
      query: `query { posts(\
          take: 6,\
          skip: 1,\
          cursor: { id: "${posts[9].id}"},\
          orderBy: { id: desc }\
        ) { id order }\
      }`,
    });

    expect(errors2).toEqual(undefined);
    expect(data2).toEqual({
      posts: Array.from(Array(6).keys()).map(_ => posts[currentOrder--]),
    });

    await context.query.Post.createMany({
      data: [{ order: 19 }, { order: 20 }, { order: 21 }, { order: 22 }],
    });

    const { errors: errors3, data: data3 } = await context.graphql.raw({
      query: `query { posts(\
        take: 6,\
        skip: 1,\
        cursor: { id: "${posts[3].id}"},\
        orderBy: { id: desc }\
        ) { id order }\
      }`,
    });

    expect(errors3).toEqual(undefined);
    expect(data3).toEqual({
      posts: Array.from(Array(3).keys()).map(_ => posts[currentOrder--]),
    });
  });
});
