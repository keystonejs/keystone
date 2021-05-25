import { text, integer, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import {
  multiAdapterRunners,
  setupFromConfig,
  networkedGraphqlRequest,
  testConfig,
  ProviderName,
} from '@keystone-next/test-utils-legacy';
import { depthLimit, definitionLimit, fieldLimit } from './validation';

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
        }),
        User: list({
          fields: {
            name: text(),
            favNumber: integer(),
            posts: relationship({ ref: 'Post.author', many: true }),
          },
          graphql: {
            queryLimits: {
              maxResults: 2,
            },
          },
        }),
      }),
      graphql: {
        queryLimits: { maxTotalResults: 6 },
        apolloConfig: {
          validationRules: [depthLimit(3), definitionLimit(3), fieldLimit(8)],
        },
      },
    }),
  });
}

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe('maxResults Limit', () => {
      describe('Basic querying', () => {
        test(
          'users',
          runner(setupKeystone, async ({ context }) => {
            const users = await context.lists.User.createMany({
              data: [
                { data: { name: 'Jess', favNumber: 1 } },
                { data: { name: 'Johanna', favNumber: 8 } },
                { data: { name: 'Sam', favNumber: 5 } },
                { data: { name: 'Theo', favNumber: 2 } },
              ],
            });

            // 2 results is okay
            let data = await context.graphql.run({
              query: `
          query {
            allUsers(
              where: { name_contains: "J" },
              sortBy: name_ASC,
            ) {
              name
            }
          }
      `,
            });

            expect(data).toHaveProperty('allUsers');
            expect(data.allUsers).toEqual([{ name: 'Jess' }, { name: 'Johanna' }]);

            // No results is okay
            data = await context.graphql.run({
              query: `
          query {
            allUsers(
              where: { name: "Nope" }
            ) {
              name
            }
          }
      `,
            });

            expect(data).toHaveProperty('allUsers');
            expect(data.allUsers.length).toEqual(0);

            // Count is still correct
            data = await context.graphql.run({
              query: `query { usersCount }`,
            });

            expect(data).toHaveProperty('usersCount');
            expect(data.usersCount).toBe(users.length);

            // This query is only okay because of the "first" parameter
            data = await context.graphql.run({
              query: `
          query {
            allUsers(first: 1) {
              name
            }
          }
      `,
            });

            expect(data).toHaveProperty('allUsers');
            expect(data.allUsers.length).toEqual(1);

            // This query returns too many results
            let errors;
            ({ errors } = await context.graphql.raw({
              query: `
          query {
            allUsers {
              name
            }
          }
      `,
            }));

            expect(errors).toMatchObject([{ message: 'Your request exceeded server limits' }]);

            // The query results don't break the limits, but the "first" parameter does
            ({ errors } = await context.graphql.raw({
              query: `
          query {
            allUsers(
              where: { name: "Nope" },
              first: 100000
            ) {
              name
            }
          }
      `,
            }));

            expect(errors).toMatchObject([{ message: 'Your request exceeded server limits' }]);
          })
        );
      });

      describe('Relationship querying', () => {
        test(
          'posts by user',
          runner(setupKeystone, async ({ context }) => {
            const users = await context.lists.User.createMany({
              data: [
                { data: { name: 'Jess', favNumber: 1 } },
                { data: { name: 'Johanna', favNumber: 8 } },
                { data: { name: 'Sam', favNumber: 5 } },
              ],
            });
            await context.lists.Post.createMany({
              data: [
                { data: { author: { connect: [{ id: users[0].id }] }, title: 'One author' } },
                {
                  data: {
                    author: { connect: [{ id: users[0].id }, { id: users[1].id }] },
                    title: 'Two authors',
                  },
                },
                {
                  data: {
                    author: {
                      connect: [{ id: users[0].id }, { id: users[1].id }, { id: users[2].id }],
                    },
                    title: 'Three authors',
                  },
                },
              ],
            });
            // Reset the count for each query
            context.totalResults = 0;
            // A basic query that should work
            let posts = await context.lists.Post.findMany({
              where: { title: 'One author' },
              query: 'title author { name }',
            });

            expect(posts).toEqual([{ title: 'One author', author: [{ name: 'Jess' }] }]);

            // Reset the count for each query
            context.totalResults = 0;
            // Each subquery is within the limit (even though the total isn't)
            posts = await context.lists.Post.findMany({
              where: {
                OR: [{ title: 'One author' }, { title: 'Two authors' }],
              },
              sortBy: ['title_ASC'],
              query: 'title author(sortBy: [name_ASC]) { name }',
            });
            expect(posts).toEqual([
              { title: 'One author', author: [{ name: 'Jess' }] },
              { title: 'Two authors', author: [{ name: 'Jess' }, { name: 'Johanna' }] },
            ]);

            // Reset the count for each query
            context.totalResults = 0;
            // This post has too many authors
            let errors;
            ({ errors } = await context.graphql.raw({
              query: `
          query {
            allPosts(
              where: { title: "Three authors" },
            ) {
              title
              author {
                name
              }
            }
          }
      `,
            }));

            expect(errors).toMatchObject([{ message: 'Your request exceeded server limits' }]);

            // Requesting the too-many-authors post is okay as long as the authors aren't returned
            // Reset the count for each query
            context.totalResults = 0;
            posts = await context.lists.Post.findMany({
              where: { title: 'Three authors' },
              query: 'title',
            });

            expect(posts).toEqual([{ title: 'Three authors' }]);

            // Some posts are okay, but one breaks the limit
            // Reset the count for each query
            context.totalResults = 0;
            ({ errors } = await context.graphql.raw({
              query: `
          query {
            allPosts {
              title
              author {
                name
              }
            }
          }
      `,
            }));

            expect(errors).toMatchObject([{ message: 'Your request exceeded server limits' }]);

            // All subqueries are within limits, but the total isn't
            // Reset the count for each query
            context.totalResults = 0;
            ({ errors } = await context.graphql.raw({
              query: `
          query {
            allPosts(where: { title: "Two authors" }) {
              title
              author {
                posts {
                  title
                }
              }
            }
          }
      `,
            }));

            expect(errors).toMatchObject([{ message: 'Your request exceeded server limits' }]);
          })
        );
      });
    });

    // FIXME: we need upstream support in the graphql package to make KS validation rules work for internal requests
    // (Low priority, but makes the API less surprising if rules work everywhere by default.)

    describe('maxDepth Limit', () => {
      test(
        'script kiddie',
        runner(setupKeystone, async ({ app }) => {
          // Block a script-kiddie attempt to DoS the server with nested queries
          const { errors } = await networkedGraphqlRequest({
            app,
            expectedStatusCode: 400,
            query: `
            query {
              allPosts {
                author {
                  posts {
                    author {
                      name
                    }
                  }
                }
              }
            }
          `,
          });

          expect(errors).toMatchObject([{ message: 'Operation has depth 5 (max: 3)' }]);
        })
      );

      test(
        'mutation script kiddie',
        runner(setupKeystone, async ({ app }) => {
          const { errors } = await networkedGraphqlRequest({
            app,
            expectedStatusCode: 400,
            query: `
            mutation {
              updatePost( title: "foo", data: { title: "bar" }) {
                author {
                  posts {
                    author {
                      name
                    }
                  }
                }
              }
            }
          `,
          });

          // This isn't the only error, but that's okay
          expect(errors).toContainEqual({
            message: 'Operation has depth 5 (max: 3)',
            extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
            name: 'ValidationError',
            uid: expect.anything(),
          });
        })
      );

      test(
        'one fragment',
        runner(setupKeystone, async ({ app }) => {
          // Slightly sneakier depth violation using a fragment
          const { errors } = await networkedGraphqlRequest({
            app,
            expectedStatusCode: 400,
            query: `
            query nestingbomb {
              allPosts {
                ...f
              }
            }
            fragment f on Post {
              author {
                posts {
                  title
                }
              }
            }
            `,
          });

          expect(errors).toMatchObject([{ message: 'Operation has depth 4 (max: 3)' }]);
        })
      );

      test(
        'multiple fragments',
        runner(setupKeystone, async ({ app }) => {
          // Sneakier violation using multiple fragments
          const { errors } = await networkedGraphqlRequest({
            app,
            expectedStatusCode: 400,
            query: `
            query nestingbomb {
              allPosts {
                ...f1
              }
            }
            fragment f1 on Post {
              author {
                ...f2
              }
            }
            fragment f2 on User {
              posts {
                title
              }
            }
            `,
          });

          expect(errors).toMatchObject([{ message: 'Operation has depth 4 (max: 3)' }]);
        })
      );

      test(
        'mutual fragment reference',
        runner(setupKeystone, async ({ app }) => {
          // Infinite loop (illegal as GraphQL, but needs to be handled)
          const { errors } = await networkedGraphqlRequest({
            app,
            expectedStatusCode: 400,
            query: `
            query nestingbomb {
              allPosts {
                ...f1
              }
            }
            fragment f1 on Post {
              author {
                ...f2
              }
            }
            fragment f2 on User {
              posts {
                ...f1
              }
            }
            `,
          });

          // We don't get the error back because the GraphQL server errors for other reasons :/
          // At least we get an error, not a hang or crash
          expect(errors).toEqual(expect.anything());
        })
      );

      test(
        'undefined fragment',
        runner(setupKeystone, async ({ app }) => {
          // (also illegal as GraphQL, but needs to be handled)
          const { errors } = await networkedGraphqlRequest({
            app,
            expectedStatusCode: 400,
            query: `
            query {
              allPosts {
                ...nosuchfragment
              }
            }
            `,
          });

          // We also get an "internal server error" from other code that doesn't handle this case
          expect(errors).toContainEqual({
            message: 'Undefined fragment "nosuchfragment"',
            extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
            name: 'ValidationError',
            uid: expect.anything(),
          });
        })
      );
    });

    describe('maxDefinitions Limit', () => {
      test(
        'queries',
        runner(setupKeystone, async ({ app }) => {
          // Too many queries
          const { errors } = await networkedGraphqlRequest({
            app,
            expectedStatusCode: 400,
            operationName: 'a',
            query: `
            query a {
              allPosts {
                title
              }
            }
            query b {
              allPosts {
                title
              }
            }
            query c {
              allPosts {
                title
              }
            }
            query d {
              allPosts {
                title
              }
            }
          `,
          });

          expect(errors).toMatchObject([{ message: 'Request contains 4 definitions (max: 3)' }]);
        })
      );

      test(
        'fragments',
        runner(setupKeystone, async ({ app }) => {
          const { errors } = await networkedGraphqlRequest({
            app,
            expectedStatusCode: 400,
            operationName: 'q1',
            query: `
            fragment f1 on Post {
              title
            }
            fragment f2 on Post {
              title
            }
            query q1 {
              allPosts {
                ...f1
              }
            }
            query q2 {
              allPosts {
                ...f2
              }
            }
          `,
          });

          expect(errors).toMatchObject([{ message: 'Request contains 4 definitions (max: 3)' }]);
        })
      );

      test(
        'mutations',
        runner(setupKeystone, async ({ app }) => {
          const { errors } = await networkedGraphqlRequest({
            app,
            expectedStatusCode: 400,
            operationName: 'm1',
            query: `
            mutation m1 {
              updatePost(title: "foo", data: { title: "bar" }) {
                title
              }
            }
            mutation m2 {
              updatePost(title: "foo", data: { title: "bar" }) {
                title
              }
            }
            mutation m3 {
              updatePost(title: "foo", data: { title: "bar" }) {
                title
              }
            }
            mutation m4 {
              updatePost(title: "foo", data: { title: "bar" }) {
                title
              }
            }
          `,
          });

          // This isn't the only error, but that's okay
          expect(errors).toContainEqual({
            message: 'Request contains 4 definitions (max: 3)',
            extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
            name: 'ValidationError',
            uid: expect.anything(),
          });
        })
      );
    });

    describe('maxFields Limit', () => {
      test(
        'one operation',
        runner(setupKeystone, async ({ app }) => {
          const { errors } = await networkedGraphqlRequest({
            app,
            expectedStatusCode: 400,
            query: `
            query {
              allPosts {
                title
                author {
                  name
                  favNumber
                }
              }
              allUsers {
                name
                favNumber
                posts {
                  title
                }
              }
            }
          `,
          });

          expect(errors).toMatchObject([{ message: 'Request contains 10 fields (max: 8)' }]);
        })
      );

      test(
        'many operations',
        runner(setupKeystone, async ({ app }) => {
          const { errors } = await networkedGraphqlRequest({
            app,
            expectedStatusCode: 400,
            operationName: 'a',
            query: `
            query a {
              allPosts {
                title
              }
              allUsers {
                name
              }
            }
            query b {
              allPosts {
                title
              }
              allUsers {
                name
              }
            }
            query c {
              allPosts {
                title
              }
            }
          `,
          });

          expect(errors).toMatchObject([{ message: 'Request contains 10 fields (max: 8)' }]);
        })
      );

      test(
        'fragments',
        runner(setupKeystone, async ({ app }) => {
          const { errors } = await networkedGraphqlRequest({
            app,
            expectedStatusCode: 400,
            operationName: 'a',
            query: `
            fragment f on User {
              name
              favNumber
            }
            query a {
              allPosts {
                title
                author {
                  ...f
                }
              }
              users1: allUsers {
                ...f
              }
              users2: allUsers {
                ...f
              }
            }
          `,
          });

          expect(errors).toMatchObject([{ message: 'Request contains 11 fields (max: 8)' }]);
        })
      );

      test(
        'unused fragment',
        runner(setupKeystone, async ({ app }) => {
          const { errors } = await networkedGraphqlRequest({
            app,
            expectedStatusCode: 400,
            operationName: 'a',
            query: `
            fragment unused on User {
              name
              favNumber
            }
            fragment f on User {
              name
              favNumber
            }
            query a {
              allPosts {
                title
                author {
                  ...f
                }
              }
              users1: allUsers {
                ...f
              }
              users2: allUsers {
                ...f
              }
            }
          `,
          });

          // We also get an "internal server error" from other code that doesn't handle this case
          expect(errors).toContainEqual({
            message: 'Request contains 13 fields (max: 8)',
            extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
            name: 'ValidationError',
            uid: expect.anything(),
          });
        })
      );

      test(
        'billion laughs',
        runner(setupKeystone, async ({ app }) => {
          // https://en.wikipedia.org/wiki/Billion_laughs
          const { errors } = await networkedGraphqlRequest({
            app,
            expectedStatusCode: 400,
            operationName: 'a',
            query: `
            query a {
              u1: allUsers {
                ...lol1
              }
              u2: allUsers {
                ...lol1
              }
              u3: allUsers {
                ...lol1
              }
              u4: allUsers {
                ...lol1
              }
              u5: allUsers {
                ...lol1
              }
            }
            fragment lol1 on User {
              p1: allPosts {
                ...lol2
              }
              p2: allPosts {
                ...lol2
              }
              p3: allPosts {
                ...lol2
              }
              p4: allPosts {
                ...lol2
              }
              p5: allPosts {
                ...lol2
              }
            }
            fragment lol2 on Post {
              title
              author
            }
          `,
          });

          // We also get an "internal server error" from other code that doesn't handle this case
          expect(errors).toContainEqual({
            message: 'Request contains 80 fields (max: 8)',
            extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
            name: 'ValidationError',
            uid: expect.anything(),
          });
        })
      );
    });
  })
);
