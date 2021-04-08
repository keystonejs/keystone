import { CacheScope } from 'apollo-cache-control';
import { text, relationship, integer } from '@keystone-next/fields';
import {
  multiAdapterRunners,
  setupFromConfig,
  networkedGraphqlRequest,
  testConfig,
  ProviderName,
} from '@keystone-next/test-utils-legacy';
import { createItems } from '@keystone-next/server-side-graphql-client-legacy';
import { list, createSchema, graphQLSchemaExtension } from '@keystone-next/keystone/schema';
import { KeystoneContext } from '@keystone-next/types';

function setupKeystone(provider: ProviderName) {
  return setupFromConfig({
    provider,
    config: testConfig({
      lists: createSchema({
        Post: list({
          fields: {
            title: text(),
            author: relationship({ ref: 'User.posts', many: true }),
          },
          graphql: {
            // @ts-ignore
            cacheHint: { scope: CacheScope.Public, maxAge: 100 },
          },
        }),
        User: list({
          fields: {
            name: text({
              // @ts-ignore
              graphql: { cacheHint: { maxAge: 80 } },
            }),
            favNumber: integer({
              // @ts-ignore
              graphql: { cacheHint: { maxAge: 10, scope: CacheScope.Private } },
            }),
            posts: relationship({ ref: 'Post.author', many: true }),
          },
          graphql: {
            // @ts-ignore
            cacheHint: ({ results, operationName, meta }) => {
              if (meta) {
                return { scope: CacheScope.Public, maxAge: 90 };
              }
              if (operationName === 'complexQuery') {
                return { maxAge: 1 };
              }
              if (results.length === 0) {
                return { maxAge: 5 };
              }
              return { maxAge: 100 };
            },
          },
        }),
      }),
      extendGraphqlSchema: graphQLSchemaExtension({
        typeDefs: `
          type MyType {
            original: Int
            double: Float
          }

          type Mutation {
            triple(x: Int): Int
          }

          type Query {
            double(x: Int): MyType
          }
        `,
        resolvers: {
          Query: {
            // @ts-ignore
            double: (root, { x }, context, info) => {
              info.cacheControl.setCacheHint({ scope: CacheScope.Public, maxAge: 100 });
              return { original: x, double: 2.0 * x };
            },
          },
          Mutation: {
            triple: (root, { x }) => 3 * x,
          },
        },
      }),
    }),
  });
}

const addFixtures = async (context: KeystoneContext) => {
  const users = await createItems({
    context,
    listKey: 'User',
    items: [
      { data: { name: 'Jess', favNumber: 1 } },
      { data: { name: 'Johanna', favNumber: 8 } },
      { data: { name: 'Sam', favNumber: 5 } },
    ],
  });

  const posts = await createItems({
    context,
    listKey: 'Post',
    items: [
      { data: { author: { connect: [{ id: users[0].id }] }, title: 'One author' } },
      {
        data: {
          author: { connect: [{ id: users[0].id }, { id: users[1].id }] },
          title: 'Two authors',
        },
      },
      {
        data: {
          author: { connect: [{ id: users[0].id }, { id: users[1].id }, { id: users[2].id }] },
          title: 'Three authors',
        },
      },
    ],
  });

  return { users, posts };
};

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe('cache hints', () => {
      test(
        'users',
        runner(setupKeystone, async ({ context, app }) => {
          await addFixtures(context);

          // Basic query
          let { data, errors, res } = await networkedGraphqlRequest({
            app,
            query: `
              query {
                allUsers {
                  name
                }
              }
            `,
          });

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allUsers');
          expect(res.headers['cache-control']).toBe('max-age=80, public');

          // favNumber has the most restrictive hint
          ({ data, errors, res } = await networkedGraphqlRequest({
            app,
            query: `
              query favNumbers {
                allUsers {
                  name
                  favNumber
                }
              }
            `,
          }));

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allUsers');
          expect(res.headers['cache-control']).toBe('max-age=10, private');

          // Meta query
          ({ data, errors, res } = await networkedGraphqlRequest({
            app,
            query: `
              query {
                userCount: _allUsersMeta {
                  count
                }
              }
            `,
          }));

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('userCount');
          expect(res.headers['cache-control']).toBe('max-age=90, public');

          // User post relationship
          ({ data, errors, res } = await networkedGraphqlRequest({
            app,
            query: `
              query {
                allUsers {
                  posts {
                    title
                  }
                }
              }
            `,
          }));

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allUsers');
          expect(res.headers['cache-control']).toBe('max-age=100, public');

          // Operation name detected
          ({ data, errors, res } = await networkedGraphqlRequest({
            app,
            query: `
              query complexQuery {
                allUsers {
                  name
                }
              }
            `,
          }));

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allUsers');
          expect(res.headers['cache-control']).toBe('max-age=1, public');

          // Hint based on query results
          ({ data, errors, res } = await networkedGraphqlRequest({
            app,
            query: `
              query {
                allUsers(where: { name: "nope" })  {
                  name
                }
              }
            `,
          }));

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allUsers');
          expect(res.headers['cache-control']).toBe('max-age=5, public');
        })
      );

      test(
        'posts',
        runner(setupKeystone, async ({ context, app }) => {
          await addFixtures(context);
          // The Post list has a static cache hint

          // Basic query
          let { data, errors, res } = await networkedGraphqlRequest({
            app,
            query: `
              query {
                allPosts {
                  title
                }
              }
            `,
          });

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allPosts');
          expect(res.headers['cache-control']).toBe('max-age=100, public');

          // Hints on post authors are more restrictive
          ({ data, errors, res } = await networkedGraphqlRequest({
            app,
            query: `
              query {
                allPosts {
                  author {
                    name
                    favNumber
                  }
                }
              }
            `,
          }));

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allPosts');
          expect(res.headers['cache-control']).toBe('max-age=10, private');

          // Post author meta query
          ({ data, errors, res } = await networkedGraphqlRequest({
            app,
            query: `
              query {
                allPosts {
                  _authorMeta {
                    count
                  }
                }
              }
            `,
          }));

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allPosts');
          expect(res.headers['cache-control']).toBe('max-age=90, public');

          // Author subquery detects operation name
          ({ data, errors, res } = await networkedGraphqlRequest({
            app,
            query: `
              query complexQuery {
                allPosts {
                  author {
                    name
                  }
                }
              }
            `,
          }));

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allPosts');
          expect(res.headers['cache-control']).toBe('max-age=1, public');

          // Post author query using cache hint dynamically caculated from results
          ({ data, errors, res } = await networkedGraphqlRequest({
            app,
            query: `
              query {
                allPosts {
                  author(where: { name: "nope" }) {
                    name
                  }
                }
              }
            `,
          }));

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allPosts');
          expect(res.headers['cache-control']).toBe('max-age=5, public');
        })
      );

      test(
        'mutations',
        runner(setupKeystone, async ({ context, app }) => {
          const { posts } = await addFixtures(context);

          // Mutation responses shouldn't be cached.
          // Here's a smoke test to make sure they still work.

          // Basic query
          const { data, errors } = await networkedGraphqlRequest({
            app,
            query: `
              mutation {
                deletePost(id: "${posts[0].id}") {
                  id
                }
              }
            `,
          });

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('deletePost');
        })
      );

      // These tests should be unskipped when we implement cacheHints
      // eslint-disable-next-line jest/no-disabled-tests
      test.skip(
        'extendGraphQLSchemaQueries',
        runner(setupKeystone, async ({ context, app }) => {
          await addFixtures(context);

          // Basic query
          let { data, errors, res } = await networkedGraphqlRequest({
            app,
            query: `
              query {
                double(x: 2) {
                  original
                  double
                }
              }
            `,
          });

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('double');
          expect(res.headers['cache-control']).toBe('max-age=100, public');
        })
      );

      // These tests should be unskipped when we implement cacheHints
      // eslint-disable-next-line jest/no-disabled-tests
      test.skip(
        'extendGraphQLSchemaMutations',
        runner(setupKeystone, async ({ context, app }) => {
          await addFixtures(context);

          // Mutation responses shouldn't be cached.
          // Here's a smoke test to make sure they still work.
          let { data, errors } = await networkedGraphqlRequest({
            app,
            query: `
              mutation {
                triple(x: 3)
              }
            `,
          });

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('triple');
        })
      );
    });
  })
);
