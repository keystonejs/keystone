import { KeystoneContext } from '@keystone-6/core/types';
import { setupTestEnv, TestEnv } from '@keystone-6/api-tests/test-runner';
import { text, relationship, integer } from '@keystone-6/core/fields';
import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { TypeInfoFromConfig, testConfig } from '../utils';

const config = testConfig({
  lists: {
    Post: list({
      access: allowAll,
      fields: {
        order: integer({ isIndexed: 'unique' }),
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
  let userId: string;

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
    userId = result.id;
    // posts will be added in random sequence, so need to sort by order
    posts = result.posts.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
  });
  afterAll(async () => {
    await testEnv.disconnect();
  });

  test('cursor pagination test (graphql api)', async () => {
    const { errors, data } = await context.graphql.raw({
      query: `query { posts(
          take: 6,\
          skip: 1,\
          cursor: { order: 5 }\
          orderBy: { order: asc }\
        ) { id order }\
      }`,
    });
    expect(errors).toEqual(undefined);
    let currentOrder = 6;
    expect(data).toEqual({
      posts: Array.from(Array(6).keys()).map(_ => posts[currentOrder++]),
    });
  });

  test('cursor pagination test (query api)', async () => {
    const result1 = await context.query.Post.findMany({
      take: 6,
      skip: 1,
      cursor: { order: 5 },
      orderBy: { order: 'asc' },
      query: 'id order',
    });
    expect(result1).toBeDefined();
    expect(result1.length).toBe(6);
    let currentOrder = 6;
    expect(result1).toEqual(Array.from(Array(6).keys()).map(_ => posts[currentOrder++]));
  });

  test('cursor pagination test (db api)', async () => {
    const result1 = await context.db.Post.findMany({
      take: 6,
      skip: 1,
      cursor: { order: 5 },
      orderBy: { order: 'asc' },
    });
    expect(result1).toBeDefined();
    expect(result1.length).toBe(6);
    let currentOrder = 6;
    expect(result1).toEqual(Array.from(Array(6).keys()).map(_ => posts[currentOrder++]));
  });

  test('cursor pagination through relation', async () => {
    const { errors, data } = await context.graphql.raw({
      query: `query {\
        user(where: { id: "${userId}"}) {\
          posts(\
            take: 6,\
            skip: 1,\
            cursor: { order: 5 }\
            orderBy: { order: asc }\
          ) { id order }\
        }\
      }`,
    });
    expect(errors).toEqual(undefined);
    let currentOrder = 6;
    expect(data).toEqual({
      user: { posts: Array.from(Array(6).keys()).map(_ => posts[currentOrder++]) },
    });
  });

  test('cursor pagination forward', async () => {
    const result1 = await context.query.Post.findMany({
      take: 6,
      orderBy: { order: 'asc' },
      query: 'id order',
    });
    expect(result1).toBeDefined();
    let currentOrder = 0;
    expect(result1).toEqual(Array.from(Array(6).keys()).map(_ => posts[currentOrder++]));

    const result2 = await context.query.Post.findMany({
      take: 6,
      skip: 1,
      cursor: { order: result1[result1.length - 1].order },
      orderBy: { order: 'asc' },
      query: 'id order',
    });

    expect(result2).toBeDefined();
    expect(result2).toEqual(Array.from(Array(6).keys()).map(_ => posts[currentOrder++]));

    const result3 = await context.query.Post.findMany({
      take: 6,
      skip: 1,
      cursor: { order: result2[result2.length - 1].order },
      orderBy: { order: 'asc' },
      query: 'id order',
    });

    expect(result3).toBeDefined();
    expect(result3).toEqual(Array.from(Array(3).keys()).map(_ => posts[currentOrder++]));
  });

  test('cursor pagination backwards', async () => {
    const result1 = await context.query.Post.findMany({
      take: -6,
      orderBy: { order: 'desc' },
      query: 'id order',
    });
    expect(result1).toBeDefined();
    let currentOrder = 5;
    expect(result1).toEqual(Array.from(Array(6).keys()).map(_ => posts[currentOrder--]));

    const result2 = await context.query.Post.findMany({
      take: -6,
      skip: 1,
      cursor: { order: result1[0].order },
      orderBy: { order: 'desc' },
      query: 'id order',
    });

    expect(result2).toBeDefined();
    currentOrder = 11;
    expect(result2).toEqual(Array.from(Array(6).keys()).map(_ => posts[currentOrder--]));

    const result3 = await context.query.Post.findMany({
      take: -6,
      skip: 1,
      cursor: { order: result2[0].order },
      orderBy: { order: 'desc' },
      query: 'id order',
    });

    expect(result3).toBeDefined();
    currentOrder = 14;
    expect(result3).toEqual(Array.from(Array(3).keys()).map(_ => posts[currentOrder--]));
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
    // posts will be added in random sequence, so need to sort by order
    posts = result.posts.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
  });
  afterEach(async () => {
    await testEnv.disconnect();
  });

  test('insert rows in the middle of pagination and check stability', async () => {
    const result1 = await context.query.Post.findMany({
      take: 3,
      skip: 1,
      cursor: { order: 13 },
      orderBy: { order: 'desc' },
      query: 'id order',
    });
    expect(result1).toBeDefined();
    let currentOrder = 12;
    expect(result1).toEqual(Array.from(Array(3).keys()).map(_ => posts[currentOrder--]));

    await context.query.Post.createMany({
      data: [{ order: 15 }, { order: 16 }, { order: 17 }, { order: 18 }],
    });

    const result2 = await context.query.Post.findMany({
      take: 3,
      skip: 1,
      cursor: { order: result1[result1.length - 1].order },
      orderBy: { order: 'desc' },
      query: 'id order',
    });
    expect(result2).toBeDefined();
    currentOrder = 9;
    expect(result2).toEqual(Array.from(Array(3).keys()).map(_ => posts[currentOrder--]));
  });
});
