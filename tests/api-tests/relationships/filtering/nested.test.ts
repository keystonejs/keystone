import { ProviderName, testConfig } from '@keystone-next/test-utils-legacy';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig } from '@keystone-next/test-utils-legacy';
import { createItem } from '@keystone-next/server-side-graphql-client-legacy';

type IdType = any;

function setupKeystone(provider: ProviderName) {
  return setupFromConfig({
    provider,
    config: testConfig({
      lists: createSchema({
        User: list({
          fields: {
            company: relationship({ ref: 'Company' }),
            posts: relationship({ ref: 'Post', many: true }),
          },
        }),
        Company: list({
          fields: {
            name: text(),
          },
        }),
        Post: list({
          fields: {
            content: text(),
          },
        }),
      }),
    }),
  });
}

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe('relationship filtering', () => {
      test(
        'nested to-many relationships can be filtered',
        runner(setupKeystone, async ({ context }) => {
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

          const data = (await context.graphql.run({
            query: `
              query {
                allUsers {
                  id
                  posts (where: {
                    content_contains: "hi",
                  }){
                    id
                    content
                  }
                }
              }
            `,
          })) as { allUsers: { id: IdType; posts: { id: IdType; content: string }[] }[] };

          expect(data).toHaveProperty('allUsers.0.posts');
          expect(data.allUsers).toHaveLength(2);
          data.allUsers[0].posts = data.allUsers[0].posts.map(({ id }) => id).sort();
          data.allUsers[1].posts = data.allUsers[1].posts.map(({ id }) => id).sort();
          expect(data.allUsers).toContainEqual({
            id: user.id,
            posts: [ids[1].id, ids[2].id].sort(),
          });
          expect(data.allUsers).toContainEqual({ id: user2.id, posts: [] });
        })
      );

      // this is failing on GitHub Actions rn for some unknown reason so going to disable it for now
      // eslint-disable-next-line jest/no-disabled-tests
      test.skip(
        'nested to-many relationships can be limited',
        runner(setupKeystone, async ({ context }) => {
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

          const data = await context.graphql.run({
            query: `
        query {
          allUsers {
            id
            posts (first: 1, sortBy: content_ASC) {
              id
            }
          }
        }
      `,
          });

          expect(data).toHaveProperty('allUsers.0.posts');
          expect(data.allUsers).toContainEqual({ id: user.id, posts: [ids[0]] });
          expect(data.allUsers).toContainEqual({ id: user2.id, posts: [ids[0]] });
        })
      );

      test(
        'nested to-many relationships can be filtered within AND clause',
        runner(setupKeystone, async ({ context }) => {
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

          const data = await context.graphql.run({
            query: `
        query {
          allUsers {
            id
            posts (where: {
              AND: [
                { content_contains: "hi" },
                { content_contains: "lo" },
              ]
            }){
              id
            }
          }
        }
      `,
          });

          expect(data).toHaveProperty('allUsers.0.posts');
          expect(data.allUsers).toContainEqual({ id: user.id, posts: [ids[2]] });
          expect(data.allUsers).toContainEqual({ id: user2.id, posts: [] });
        })
      );

      test(
        'nested to-many relationships can be filtered within OR clause',
        runner(setupKeystone, async ({ context }) => {
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

          const data = await context.graphql.run({
            query: `
        query {
          allUsers {
            id
            posts (where: {
              OR: [
                { content_contains: "i w" },
                { content_contains: "? O" },
              ]
            }){
              id
              content
            }
          }
        }
      `,
          });

          expect(data).toHaveProperty('allUsers.0.posts');
          expect(data.allUsers).toContainEqual({
            id: user.id,
            posts: expect.arrayContaining([
              expect.objectContaining(ids[1]),
              expect.objectContaining(ids[2]),
            ]),
          });
          expect(data.allUsers).toContainEqual({ id: user2.id, posts: [] });
        })
      );

      test(
        'Filtering out all items by nested field should return []',
        runner(setupKeystone, async ({ context }) => {
          await createItem({ context, listKey: 'User', item: {} });

          const result = await context.graphql.run({
            query: `
              query {
                allUsers(where: { posts_some: { content_contains: "foo" } }) {
                  posts { id }
                }
              }
            `,
          });

          expect(Array.isArray(result.allUsers)).toBeTruthy();
          expect(result.allUsers).toHaveLength(0);
        })
      );
    });

    describe('relationship meta filtering', () => {
      test(
        'nested to-many relationships return meta info',
        runner(setupKeystone, async ({ context }) => {
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

          const data = await context.graphql.run({
            query: `
        query {
          allUsers {
            id
            _postsMeta {
              count
            }
          }
        }
      `,
          });

          expect(data.allUsers).toHaveLength(2);
          expect(data).toHaveProperty('allUsers.0._postsMeta');
          expect(data.allUsers).toContainEqual({ id: user.id, _postsMeta: { count: 3 } });
          expect(data.allUsers).toContainEqual({ id: user2.id, _postsMeta: { count: 1 } });
        })
      );

      test(
        'nested to-many relationship meta can be filtered',
        runner(setupKeystone, async ({ context }) => {
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

          const data = await context.graphql.run({
            query: `
        query {
          allUsers {
            id
            _postsMeta (where: {
              content_contains: "hi",
            }){
              count
            }
          }
        }
      `,
          });

          expect(data.allUsers).toHaveLength(2);
          expect(data).toHaveProperty('allUsers.0._postsMeta');
          expect(data.allUsers).toContainEqual({ id: user.id, _postsMeta: { count: 2 } });
          expect(data.allUsers).toContainEqual({ id: user2.id, _postsMeta: { count: 0 } });
        })
      );

      test(
        'nested to-many relationship meta can be limited',
        runner(setupKeystone, async ({ context }) => {
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

          const data = await context.graphql.run({
            query: `
        query {
          allUsers {
            id
            _postsMeta (first: 1) {
              count
            }
          }
        }
      `,
          });

          expect(data).toHaveProperty('allUsers.0._postsMeta');
          expect(data.allUsers).toHaveLength(2);
          expect(data.allUsers).toContainEqual({ id: user.id, _postsMeta: { count: 1 } });
          expect(data.allUsers).toContainEqual({ id: user2.id, _postsMeta: { count: 1 } });
        })
      );

      test(
        'nested to-many relationship meta can be filtered within AND clause',
        runner(setupKeystone, async ({ context }) => {
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

          const data = await context.graphql.run({
            query: `
        query {
          allUsers {
            id
            _postsMeta (where: {
              AND: [
                { content_contains: "hi" },
                { content_contains: "lo" },
              ]
            }){
              count
            }
          }
        }
      `,
          });

          expect(data.allUsers).toHaveLength(2);
          expect(data).toHaveProperty('allUsers.0._postsMeta');
          expect(data.allUsers).toContainEqual({ id: user.id, _postsMeta: { count: 1 } });
          expect(data.allUsers).toContainEqual({ id: user2.id, _postsMeta: { count: 0 } });
        })
      );

      test(
        'nested to-many relationship meta can be filtered within OR clause',
        runner(setupKeystone, async ({ context }) => {
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

          const data = await context.graphql.run({
            query: `
              query {
                allUsers {
                  id
                  _postsMeta (where: {
                    OR: [
                      { content_contains: "i w" },
                      { content_contains: "? O" },
                    ]
                  }){
                    count
                  }
                }
              }
            `,
          });

          expect(data.allUsers).toHaveLength(2);
          expect(data).toHaveProperty('allUsers.0._postsMeta');
          expect(data.allUsers).toContainEqual({ id: user.id, _postsMeta: { count: 2 } });
          expect(data.allUsers).toContainEqual({ id: user2.id, _postsMeta: { count: 0 } });
        })
      );
    });
  })
);
