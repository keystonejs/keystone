const { Integer, Text, Relationship } = require('@keystone-alpha/fields');
const {
  multiAdapterRunners,
  setupServer,
  networkedGraphqlRequest,
} = require('@keystone-alpha/test-utils');

const cuid = require('cuid');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('Post', {
        fields: {
          title: { type: Text },
          author: { type: Relationship, ref: 'User', many: true },
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
    },
  });
}

const addFixtures = async create => {
  const users = await Promise.all([
    create('User', { name: 'Jess', favNumber: 1 }),
    create('User', { name: 'Johanna', favNumber: 8 }),
    create('User', { name: 'Sam', favNumber: 5 }),
  ]);

  await Promise.all([
    create('Post', { author: [users[0].id], title: 'One author' }),
    create('Post', { author: [users[0].id, users[1].id], title: 'Two authors' }),
    create('Post', {
      author: [users[0].id, users[1].id, users[2].id],
      title: 'Three authors',
    }),
  ]);
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
    });
  })
);
