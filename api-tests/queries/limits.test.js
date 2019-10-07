const { Integer, Text, Relationship } = require('@keystone-alpha/fields');
const {
  multiAdapterRunners,
  setupServer,
  graphqlRequest,
  networkedGraphqlRequest,
} = require('@keystone-alpha/test-utils');
const {
  validation: { depthLimit, definitionLimit, fieldLimit },
} = require('@keystone-alpha/app-graphql');

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
      });

      keystone.createList('User', {
        fields: {
          name: { type: Text },
          favNumber: { type: Integer },
          posts: { type: Relationship, ref: 'Post.author', many: true },
        },
        queryLimits: {
          maxResults: 2,
        },
      });
    },
    keystoneOptions: {
      queryLimits: {
        maxTotalResults: 6,
      },
    },
    graphqlOptions: {
      apollo: {
        validationRules: [depthLimit(3), definitionLimit(3), fieldLimit(8)],
      },
    },
  });
}
multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('maxResults Limit', () => {
      describe('Basic querying', () => {
        test(
          'users',
          runner(setupKeystone, async ({ keystone, create }) => {
            const users = await Promise.all([
              create('User', { name: 'Jess', favNumber: 1 }),
              create('User', { name: 'Johanna', favNumber: 8 }),
              create('User', { name: 'Sam', favNumber: 5 }),
              create('User', { name: 'Theo', favNumber: 2 }),
            ]);

            // 2 results is okay
            let { data, errors } = await graphqlRequest({
              keystone,
              query: `
          query {
            allUsers(
              where: { name_contains: "J" },
              orderBy: "name_ASC",
            ) {
              name
            }
          }
      `,
            });

            expect(errors).toBe(undefined);
            expect(data).toHaveProperty('allUsers');
            expect(data.allUsers).toEqual([{ name: 'Jess' }, { name: 'Johanna' }]);

            // No results is okay
            ({ data, errors } = await graphqlRequest({
              keystone,
              query: `
          query {
            allUsers(
              where: { name: "Nope" }
            ) {
              name
            }
          }
      `,
            }));

            expect(errors).toBe(undefined);
            expect(data).toHaveProperty('allUsers');
            expect(data.allUsers.length).toEqual(0);

            // Count is still correct
            ({ data, errors } = await graphqlRequest({
              keystone,
              query: `
          query {
            meta: _allUsersMeta {
              count
            }
          }
      `,
            }));

            expect(errors).toBe(undefined);
            expect(data).toHaveProperty('meta');
            expect(data.meta.count).toBe(users.length);

            // This query is only okay because of the "first" parameter
            ({ data, errors } = await graphqlRequest({
              keystone,
              query: `
          query {
            allUsers(first: 1) {
              name
            }
          }
      `,
            }));

            expect(errors).toBe(undefined);
            expect(data).toHaveProperty('allUsers');
            expect(data.allUsers.length).toEqual(1);

            // This query returns too many results
            ({ errors } = await graphqlRequest({
              keystone,
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
            ({ errors } = await graphqlRequest({
              keystone,
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
          runner(setupKeystone, async ({ keystone, create, update }) => {
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

            for (const user of users) {
              user.posts = [];
            }
            for (const post of posts) {
              for (const authorId of post.author) {
                users.find(u => Number(u.id) === authorId).posts.push(post.id);
              }
            }
            for (const user of users) {
              update('User', user.id, { posts: user.posts });
            }

            // A basic query that should work
            let { data, errors } = await graphqlRequest({
              keystone,
              query: `
          query {
            allPosts(
              where: { title: "One author" },
            ) {
              title
              author {
                name
              }
            }
          }
      `,
            });

            expect(errors).toBe(undefined);
            expect(data).toHaveProperty('allPosts');
            expect(data.allPosts).toEqual([
              {
                title: 'One author',
                author: [{ name: 'Jess' }],
              },
            ]);

            // Each subquery is within the limit (even though the total isn't)
            ({ data, errors } = await graphqlRequest({
              keystone,
              query: `
          query {
            allPosts(
              where: {
                OR: [
                  { title: "One author" },
                  { title: "Two authors" },
                ]
              }
              orderBy: "title_ASC",
            ) {
              title
              author(orderBy: "name_ASC") {
                name
              }
            }
          }
      `,
            }));

            expect(errors).toBe(undefined);
            expect(data).toHaveProperty('allPosts');
            expect(data.allPosts).toEqual([
              {
                title: 'One author',
                author: [{ name: 'Jess' }],
              },
              {
                title: 'Two authors',
                author: [{ name: 'Jess' }, { name: 'Johanna' }],
              },
            ]);

            // This post has too many authors
            ({ errors } = await graphqlRequest({
              keystone,
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
            ({ data, errors } = await graphqlRequest({
              keystone,
              query: `
          query {
            allPosts(
              where: { title: "Three authors" },
            ) {
              title
            }
          }
      `,
            }));

            expect(errors).toBe(undefined);
            expect(data).toHaveProperty('allPosts');
            expect(data.allPosts).toEqual([{ title: 'Three authors' }]);

            // Some posts are okay, but one breaks the limit
            ({ errors } = await graphqlRequest({
              keystone,
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
            ({ data, errors } = await graphqlRequest({
              keystone,
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

            console.log(JSON.stringify(errors));
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
    });
  })
);
