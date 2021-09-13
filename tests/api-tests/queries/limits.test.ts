import { text, integer, relationship } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig, expectGraphQLValidationError, expectLimitsExceededError } from '../utils';
import { depthLimit, definitionLimit, fieldLimit } from './validation';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      Post: list({
        fields: {
          title: text({ isFilterable: true, isOrderable: true }),
          author: relationship({ ref: 'User.posts', many: true }),
        },
      }),
      User: list({
        fields: {
          name: text({ isFilterable: true, isOrderable: true }),
          favNumber: integer(),
          posts: relationship({ ref: 'Post.author', many: true }),
        },
        graphql: {
          queryLimits: {
            maxResults: 2,
          },
        },
      }),
    },
    graphql: {
      queryLimits: { maxTotalResults: 6 },
      apolloConfig: {
        validationRules: [depthLimit(3), definitionLimit(3), fieldLimit(8)],
      },
    },
  }),
});

describe('maxResults Limit', () => {
  describe('Basic querying', () => {
    test(
      'users',
      runner(async ({ context }) => {
        const users = await context.lists.User.createMany({
          data: [
            { name: 'Jess', favNumber: 1 },
            { name: 'Johanna', favNumber: 8 },
            { name: 'Sam', favNumber: 5 },
            { name: 'Theo', favNumber: 2 },
          ],
        });

        // 2 results is okay
        let data = await context.graphql.run({
          query: `
          query {
            users(
              where: { name: { contains: "J" } },
              orderBy: { name: asc },
            ) {
              name
            }
          }
      `,
        });

        expect(data).toHaveProperty('users');
        expect(data.users).toEqual([{ name: 'Jess' }, { name: 'Johanna' }]);

        // No results is okay
        data = await context.graphql.run({
          query: `
          query {
            users(
              where: { name: { equals: "Nope" } }
            ) {
              name
            }
          }
      `,
        });

        expect(data).toHaveProperty('users');
        expect(data.users.length).toEqual(0);

        // Count is still correct
        data = await context.graphql.run({
          query: `query { usersCount }`,
        });

        expect(data).toHaveProperty('usersCount');
        expect(data.usersCount).toBe(users.length);

        // This query is only okay because of the "take" parameter
        data = await context.graphql.run({
          query: `
          query {
            users(take: 1) {
              name
            }
          }
      `,
        });

        expect(data).toHaveProperty('users');
        expect(data.users.length).toEqual(1);

        // This query returns too many results
        let errors;
        ({ errors } = await context.graphql.raw({
          query: `
          query {
            users {
              name
            }
          }
      `,
        }));

        expectLimitsExceededError(errors, [{ path: ['users'] }]);

        // The query results don't break the limits, but the "take" parameter does
        ({ errors } = await context.graphql.raw({
          query: `
          query {
            users(
              where: { name: { equals: "Nope" } },
              take: 100000
            ) {
              name
            }
          }
      `,
        }));

        expectLimitsExceededError(errors, [{ path: ['users'] }]);
      })
    );
    test(
      'negative take still causes the early error',
      runner(async ({ context }) => {
        // there are no users so this will never hit the late error so if it errors
        // it must be the early error
        let { errors } = await context.graphql.raw({
          query: `
          query {
            users(take: -10) {
              name
            }
          }
      `,
        });

        expectLimitsExceededError(errors, [{ path: ['users'] }]);
      })
    );
  });

  describe('Relationship querying', () => {
    test(
      'posts by user',
      runner(async ({ context }) => {
        const users = await context.lists.User.createMany({
          data: [
            { name: 'Jess', favNumber: 1 },
            { name: 'Johanna', favNumber: 8 },
            { name: 'Sam', favNumber: 5 },
          ],
        });
        await context.lists.Post.createMany({
          data: [
            { author: { connect: [{ id: users[0].id }] }, title: 'One author' },
            {
              author: { connect: [{ id: users[0].id }, { id: users[1].id }] },
              title: 'Two authors',
            },
            {
              author: { connect: [{ id: users[0].id }, { id: users[1].id }, { id: users[2].id }] },
              title: 'Three authors',
            },
          ],
        });
        // Reset the count for each query
        context.totalResults = 0;
        // A basic query that should work
        let posts = await context.lists.Post.findMany({
          where: { title: { equals: 'One author' } },
          query: 'title author { name }',
        });

        expect(posts).toEqual([{ title: 'One author', author: [{ name: 'Jess' }] }]);

        // Reset the count for each query
        context.totalResults = 0;
        // Each subquery is within the limit (even though the total isn't)
        posts = await context.lists.Post.findMany({
          where: {
            OR: [{ title: { equals: 'One author' } }, { title: { equals: 'Two authors' } }],
          },
          orderBy: { title: 'asc' },
          query: 'title author(orderBy: { name: asc }) { name }',
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
            posts(
              where: { title: { equals: "Three authors" } },
            ) {
              title
              author {
                name
              }
            }
          }
      `,
        }));

        expectLimitsExceededError(errors, [{ path: ['posts', expect.any(Number), 'author'] }]);

        // Requesting the too-many-authors post is okay as long as the authors aren't returned
        // Reset the count for each query
        context.totalResults = 0;
        posts = await context.lists.Post.findMany({
          where: { title: { equals: 'Three authors' } },
          query: 'title',
        });

        expect(posts).toEqual([{ title: 'Three authors' }]);

        // Some posts are okay, but one breaks the limit
        // Reset the count for each query
        context.totalResults = 0;
        ({ errors } = await context.graphql.raw({
          query: `
          query {
            posts {
              title
              author {
                name
              }
            }
          }
      `,
        }));

        expectLimitsExceededError(errors, [{ path: ['posts', expect.any(Number), 'author'] }]);

        // All subqueries are within limits, but the total isn't
        // Reset the count for each query
        context.totalResults = 0;
        ({ errors } = await context.graphql.raw({
          query: `
          query {
            posts(where: { title: { equals: "Two authors" } }) {
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

        expectLimitsExceededError(errors, [{ path: ['posts', 0, 'author', 1, 'posts'] }]);
      })
    );
  });
});

// FIXME: we need upstream support in the graphql package to make KS validation rules work for internal requests
// (Low priority, but makes the API less surprising if rules work everywhere by default.)

describe('maxDepth Limit', () => {
  test(
    'script kiddie',
    runner(async ({ graphQLRequest }) => {
      // Block a script-kiddie attempt to DoS the server with nested queries
      const { body } = await graphQLRequest({
        query: `
            query {
              posts {
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
      }).expect(400);

      expectGraphQLValidationError(body.errors, [{ message: 'Operation has depth 5 (max: 3)' }]);
    })
  );

  test(
    'mutation script kiddie',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
        query: `
            mutation {
              updatePost(where: { id: "foo" }, data: { title: "bar" }) {
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
      }).expect(400);

      expectGraphQLValidationError(body.errors, [{ message: 'Operation has depth 5 (max: 3)' }]);
    })
  );

  test(
    'one fragment',
    runner(async ({ graphQLRequest }) => {
      // Slightly sneakier depth violation using a fragment
      const { body } = await graphQLRequest({
        query: `
            query nestingbomb {
              posts {
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
      }).expect(400);

      expectGraphQLValidationError(body.errors, [{ message: 'Operation has depth 4 (max: 3)' }]);
    })
  );

  test(
    'multiple fragments',
    runner(async ({ graphQLRequest }) => {
      // Sneakier violation using multiple fragments
      const { body } = await graphQLRequest({
        query: `
            query nestingbomb {
              posts {
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
      }).expect(400);

      expectGraphQLValidationError(body.errors, [{ message: 'Operation has depth 4 (max: 3)' }]);
    })
  );

  test(
    'mutual fragment reference',
    runner(async ({ graphQLRequest }) => {
      // Infinite loop (illegal as GraphQL, but needs to be handled)
      const { body } = await graphQLRequest({
        query: `
            query nestingbomb {
              posts {
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
      }).expect(400);

      expectGraphQLValidationError(body.errors, [
        { message: 'Operation has depth Infinity (max: 3)' },
        { message: 'Operation has depth Infinity (max: 3)' },
        { message: 'Operation has depth Infinity (max: 3)' },
        { message: 'Request contains Infinity fields (max: 8)' },
        { message: 'Cannot spread fragment "f1" within itself via "f2".' },
      ]);
    })
  );

  test(
    'undefined fragment',
    runner(async ({ graphQLRequest }) => {
      // (also illegal as GraphQL, but needs to be handled)
      const { body } = await graphQLRequest({
        query: `
            query {
              posts {
                ...nosuchfragment
              }
            }
            `,
      }).expect(400);

      expectGraphQLValidationError(body.errors, [
        { message: 'Undefined fragment "nosuchfragment"' },
        { message: 'Undefined fragment "nosuchfragment"' },
        { message: 'Unknown fragment "nosuchfragment".' },
      ]);
    })
  );
});

describe('maxDefinitions Limit', () => {
  test(
    'queries',
    runner(async ({ graphQLRequest }) => {
      // Too many queries
      const { body } = await graphQLRequest({
        operationName: 'a',
        query: `
            query a {
              posts {
                title
              }
            }
            query b {
              posts {
                title
              }
            }
            query c {
              posts {
                title
              }
            }
            query d {
              posts {
                title
              }
            }
          `,
      }).expect(400);

      expectGraphQLValidationError(body.errors, [
        { message: 'Request contains 4 definitions (max: 3)' },
      ]);
    })
  );

  test(
    'fragments',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
        operationName: 'q1',
        query: `
            fragment f1 on Post {
              title
            }
            fragment f2 on Post {
              title
            }
            query q1 {
              posts {
                ...f1
              }
            }
            query q2 {
              posts {
                ...f2
              }
            }
          `,
      }).expect(400);

      expectGraphQLValidationError(body.errors, [
        { message: 'Request contains 4 definitions (max: 3)' },
      ]);
    })
  );

  test(
    'mutations',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
        operationName: 'm1',
        query: `
            mutation m1 {
              updatePost(where: { id: "foo" }, data: { title: "bar" }) {
                title
              }
            }
            mutation m2 {
              updatePost(where: { id: "foo" }, data: { title: "bar" }) {
                title
              }
            }
            mutation m3 {
              updatePost(where: { id: "foo" }, data: { title: "bar" }) {
                title
              }
            }
            mutation m4 {
              updatePost(where: { id: "foo" }, data: { title: "bar" }) {
                title
              }
            }
          `,
      }).expect(400);

      // This isn't the only error, but that's okay
      expectGraphQLValidationError(body.errors, [
        { message: 'Request contains 4 definitions (max: 3)' },
      ]);
    })
  );
});

describe('maxFields Limit', () => {
  test(
    'one operation',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
        query: `
            query {
              posts {
                title
                author {
                  name
                  favNumber
                }
              }
              users {
                name
                favNumber
                posts {
                  title
                }
              }
            }
          `,
      }).expect(400);

      expectGraphQLValidationError(body.errors, [
        { message: 'Request contains 10 fields (max: 8)' },
      ]);
    })
  );

  test(
    'many operations',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
        operationName: 'a',
        query: `
            query a {
              posts {
                title
              }
              users {
                name
              }
            }
            query b {
              posts {
                title
              }
              users {
                name
              }
            }
            query c {
              posts {
                title
              }
            }
          `,
      }).expect(400);

      expectGraphQLValidationError(body.errors, [
        { message: 'Request contains 10 fields (max: 8)' },
      ]);
    })
  );

  test(
    'fragments',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
        operationName: 'a',
        query: `
            fragment f on User {
              name
              favNumber
            }
            query a {
              posts {
                title
                author {
                  ...f
                }
              }
              users1: users {
                ...f
              }
              users2: users {
                ...f
              }
            }
          `,
      }).expect(400);

      expectGraphQLValidationError(body.errors, [
        { message: 'Request contains 11 fields (max: 8)' },
      ]);
    })
  );

  test(
    'unused fragment',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
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
              posts {
                title
                author {
                  ...f
                }
              }
              users1: users {
                ...f
              }
              users2: users {
                ...f
              }
            }
          `,
      }).expect(400);

      expectGraphQLValidationError(body.errors, [
        { message: 'Request contains 13 fields (max: 8)' },
        { message: 'Fragment "unused" is never used.' },
      ]);
    })
  );

  test(
    'billion laughs',
    runner(async ({ graphQLRequest }) => {
      // https://en.wikipedia.org/wiki/Billion_laughs
      const { body } = await graphQLRequest({
        operationName: 'a',
        query: `
            query a {
              u1: users {
                ...lol1
              }
              u2: users {
                ...lol1
              }
              u3: users {
                ...lol1
              }
              u4: users {
                ...lol1
              }
              u5: users {
                ...lol1
              }
            }
            fragment lol1 on User {
              p1: posts {
                ...lol2
              }
              p2: posts {
                ...lol2
              }
              p3: posts {
                ...lol2
              }
              p4: posts {
                ...lol2
              }
              p5: posts {
                ...lol2
              }
            }
            fragment lol2 on Post {
              title
              author { id }
            }
          `,
      }).expect(400);

      expectGraphQLValidationError(body.errors, [
        { message: 'Operation has depth 4 (max: 3)' },
        { message: 'Request contains 105 fields (max: 8)' },
      ]);
    })
  );
});
