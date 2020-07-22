const { Integer, Text, Relationship } = require('@keystonejs/fields');
const {
  multiAdapterRunners,
  setupServer,
  networkedGraphqlRequest,
} = require('@keystonejs/test-utils');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('Post', {
        fields: {
          title: { type: Text },
          author: { type: Relationship, ref: 'User.posts', many: true },
        },
        cacheHint: {
          scope: 'PUBLIC',
          maxAge: 100,
        },
      });

      keystone.createList('User', {
        fields: {
          name: {
            type: Text,
            cacheHint: {
              maxAge: 80,
            },
          },
          favNumber: {
            type: Integer,
            cacheHint: {
              maxAge: 10,
              scope: 'PRIVATE',
            },
          },
          posts: { type: Relationship, ref: 'Post.author', many: true },
        },
        cacheHint: ({ results, operationName, meta }) => {
          if (meta) {
            return {
              scope: 'PUBLIC',
              maxAge: 90,
            };
          }
          if (operationName === 'complexQuery') {
            return {
              maxAge: 1,
            };
          }
          if (results.length === 0) {
            return {
              maxAge: 5,
            };
          }
          return {
            maxAge: 100,
          };
        },
      });

      keystone.extendGraphQLSchema({
        types: [{ type: 'type MyType { original: Int, double: Float }' }],
        queries: [
          {
            schema: 'double(x: Int): MyType',
            resolver: (_, { x }) => ({ original: x, double: 2.0 * x }),
            cacheHint: {
              scope: 'PUBLIC',
              maxAge: 100,
            },
          },
        ],
        mutations: [
          {
            schema: 'triple(x: Int): Int',
            resolver: (_, { x }) => 3 * x,
          },
        ],
      });
    },
  });
}

const addFixtures = async create => {
  const users = await Promise.all([
    create('User', { name: 'Jess', favNumber: 1 }),
    create('User', { name: 'Johanna', favNumber: 8 }),
    create('User', { name: 'Sam', favNumber: 5 }),
  ]);

  const posts = await Promise.all([
    create('Post', { author: [users[0].id], title: 'One author' }),
    create('Post', { author: [users[0].id, users[1].id], title: 'Two authors' }),
    create('Post', {
      author: [users[0].id, users[1].id, users[2].id],
      title: 'Three authors',
    }),
  ]);

  return { users, posts };
};

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('cache hints', () => {
      test(
        'users',
        runner(setupKeystone, async ({ app, create }) => {
          await addFixtures(create);

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
        runner(setupKeystone, async ({ app, create }) => {
          await addFixtures(create);
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
        runner(setupKeystone, async ({ app, create }) => {
          const { posts } = await addFixtures(create);

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

      test(
        'extendGraphQLSchemaQueries',
        runner(setupKeystone, async ({ app, create }) => {
          await addFixtures(create);

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

      test(
        'extendGraphQLSchemaMutations',
        runner(setupKeystone, async ({ app, create }) => {
          await addFixtures(create);

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
