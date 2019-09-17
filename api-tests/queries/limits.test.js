const { Integer, Text, Relationship } = require('@keystone-alpha/fields');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystone-alpha/test-utils');

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
        },
        queryLimits: {
          maxResults: 2,
        },
      });
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
          runner(setupKeystone, async ({ keystone, create }) => {
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
          })
        );
      });
    });
  })
);
