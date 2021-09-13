import { CacheScope } from 'apollo-server-types';
import { text, relationship, integer } from '@keystone-next/keystone/fields';
import { list, graphQLSchemaExtension } from '@keystone-next/keystone';
import { KeystoneContext } from '@keystone-next/keystone/types';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      Post: list({
        fields: {
          title: text(),
          author: relationship({ ref: 'User.posts', many: true }),
        },
        graphql: {
          cacheHint: { scope: CacheScope.Public, maxAge: 100 },
        },
      }),
      User: list({
        fields: {
          name: text({ graphql: { cacheHint: { maxAge: 80 } }, isFilterable: true }),
          favNumber: integer({
            graphql: { cacheHint: { maxAge: 10, scope: CacheScope.Private } },
          }),
          posts: relationship({ ref: 'Post.author', many: true }),
        },
        graphql: {
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
    },
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

const addFixtures = async (context: KeystoneContext) => {
  const users = await context.lists.User.createMany({
    data: [
      { name: 'Jess', favNumber: 1 },
      { name: 'Johanna', favNumber: 8 },
      { name: 'Sam', favNumber: 5 },
    ],
  });

  const posts = await context.lists.Post.createMany({
    data: [
      { author: { connect: [{ id: users[0].id }] }, title: 'One author' },
      { author: { connect: [{ id: users[0].id }, { id: users[1].id }] }, title: 'Two authors' },
      {
        author: { connect: [{ id: users[0].id }, { id: users[1].id }, { id: users[2].id }] },
        title: 'Three authors',
      },
    ],
  });

  return { users, posts };
};

describe('cache hints', () => {
  test(
    'users',
    runner(async ({ context, graphQLRequest }) => {
      await addFixtures(context);

      // Basic query
      const { body, headers } = await graphQLRequest({
        query: `
          query {
            users {
              name
            }
          }
        `,
      });
      expect(body.data).toHaveProperty('users');
      expect(headers['cache-control']).toBe('max-age=80, public');

      // favNumber has the most restrictive hint
      {
        const { body, headers } = await graphQLRequest({
          query: `
            query favNumbers {
              users {
                name
                favNumber
              }
            }
          `,
        });

        expect(body.data).toHaveProperty('users');
        expect(headers['cache-control']).toBe('max-age=10, private');
      }
      // Count query
      {
        const { body, headers } = await graphQLRequest({
          query: `query { usersCount }`,
        });

        expect(body.data).toHaveProperty('usersCount');
        expect(headers['cache-control']).toBe('max-age=90, public');
      }
      // User post relationship
      {
        const { body, headers } = await graphQLRequest({
          query: `
          query {
            users {
              posts {
                title
              }
            }
          }
        `,
        });

        expect(body.data).toHaveProperty('users');
        expect(headers['cache-control']).toBe('max-age=100, public');
      }
      // Operation name detected
      {
        const { body, headers } = await graphQLRequest({
          query: `
          query complexQuery {
            users {
              name
            }
          }
        `,
        });

        expect(body.data).toHaveProperty('users');
        expect(headers['cache-control']).toBe('max-age=1, public');
      }
      // Hint based on query results
      {
        const { body, headers } = await graphQLRequest({
          query: `
          query {
            users(where: { name: { equals: "nope" } })  {
              name
            }
          }
        `,
        });

        expect(body.data).toHaveProperty('users');
        expect(headers['cache-control']).toBe('max-age=5, public');
      }
    })
  );

  test(
    'posts',
    runner(async ({ context, graphQLRequest }) => {
      await addFixtures(context);
      // The Post list has a static cache hint

      // Basic query
      {
        const { body, headers } = await graphQLRequest({
          query: `
          query {
            posts {
              title
            }
          }
        `,
        });

        expect(body.data).toHaveProperty('posts');
        expect(headers['cache-control']).toBe('max-age=100, public');
      }

      // Hints on post authors are more restrictive
      {
        const { body, headers } = await graphQLRequest({
          query: `
          query {
            posts {
              author {
                name
                favNumber
              }
            }
          }
        `,
        });

        expect(body.data).toHaveProperty('posts');
        expect(headers['cache-control']).toBe('max-age=10, private');
      }

      // Post author meta query
      {
        const { body, headers } = await graphQLRequest({
          query: `
          query {
            posts {
              authorCount
            }
          }
        `,
        });

        expect(body.data).toHaveProperty('posts');
        expect(headers['cache-control']).toBe('max-age=90, public');
      }

      // Author subquery detects operation name
      {
        const { body, headers } = await graphQLRequest({
          query: `
          query complexQuery {
            posts {
              author {
                name
              }
            }
          }
        `,
        });

        expect(body.data).toHaveProperty('posts');
        expect(headers['cache-control']).toBe('max-age=1, public');
      }
      // Post author query using cache hint dynamically caculated from results
      {
        const { body, headers } = await graphQLRequest({
          query: `
          query {
            posts {
              author(where: { name: { equals: "nope" } }) {
                name
              }
            }
          }
        `,
        });

        expect(body.data).toHaveProperty('posts');
        expect(headers['cache-control']).toBe('max-age=5, public');
      }
    })
  );

  test(
    'mutations',
    runner(async ({ context, graphQLRequest }) => {
      const { posts } = await addFixtures(context);

      // Mutation responses shouldn't be cached.
      // Here's a smoke test to make sure they still work.

      // Basic query
      const { body } = await graphQLRequest({
        query: `
          mutation {
            deletePost(where: { id: "${posts[0].id}" }) {
              id
            }
          }
        `,
      });

      expect(body.data).toHaveProperty('deletePost');
    })
  );

  test(
    'extendGraphQLSchemaQueries',
    runner(async ({ context, graphQLRequest }) => {
      await addFixtures(context);

      // Basic query
      let { body, headers } = await graphQLRequest({
        query: `
          query {
            double(x: 2) {
              original
              double
            }
          }
        `,
      });

      expect(body.data).toHaveProperty('double');
      expect(headers['cache-control']).toBe('max-age=100, public');
    })
  );

  test(
    'extendGraphQLSchemaMutations',
    runner(async ({ context, graphQLRequest }) => {
      await addFixtures(context);

      // Mutation responses shouldn't be cached.
      // Here's a smoke test to make sure they still work.
      let { body } = await graphQLRequest({
        query: `
          mutation {
            triple(x: 3)
          }
        `,
      });

      expect(body.data).toHaveProperty('triple');
    })
  );
});
