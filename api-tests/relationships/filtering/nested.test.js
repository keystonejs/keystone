const { Text, Relationship } = require('@keystone-alpha/fields');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystone-alpha/test-utils');
const cuid = require('cuid');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('User', {
        fields: {
          company: { type: Relationship, ref: 'Company' },
          posts: { type: Relationship, ref: 'Post', many: true },
        },
      });

      keystone.createList('Company', {
        fields: {
          name: { type: Text },
        },
      });

      keystone.createList('Post', {
        fields: {
          content: { type: Text },
        },
      });
    },
  });
}
multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('relationship filtering', () => {
      test(
        'nested to-many relationships can be filtered',
        runner(setupKeystone, async ({ keystone, create }) => {
          const ids = [];

          ids.push((await create('Post', { content: 'Hello world' })).id);
          ids.push((await create('Post', { content: 'hi world' })).id);
          ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

          const user = await create('User', { posts: ids });

          // Create a dummy user to make sure we're actually filtering it out
          const user2 = await create('User', { posts: [ids[0]] });

          const { data, errors } = await graphqlRequest({
            keystone,
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
          });

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allUsers.0.posts');
          expect(data.allUsers[0].posts).toHaveLength(2);
          expect(data).toMatchObject({
            allUsers: [
              {
                id: user.id,
                posts: [{ id: ids[1] }, { id: ids[2] }],
              },
              {
                id: user2.id,
                posts: [],
              },
            ],
          });
        })
      );

      test(
        'nested to-many relationships can be limited',
        runner(setupKeystone, async ({ keystone, create }) => {
          const ids = [];

          ids.push((await create('Post', { content: 'Hello world' })).id);
          ids.push((await create('Post', { content: 'hi world' })).id);
          ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

          const user = await create('User', { posts: ids });

          // Create a dummy user to make sure we're actually filtering it out
          const user2 = await create('User', { posts: [ids[0]] });

          const { data, errors } = await graphqlRequest({
            keystone,
            query: `
        query {
          allUsers {
            id
            posts (first: 1) {
              id
              content
            }
          }
        }
      `,
          });

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allUsers.0.posts');
          expect(data.allUsers[0].posts).toHaveLength(1);
          expect(data).toMatchObject({
            allUsers: [
              {
                id: user.id,
                posts: [{ id: ids[0] }],
              },
              {
                id: user2.id,
                posts: [{ id: ids[0] }],
              },
            ],
          });
        })
      );

      test(
        'nested to-many relationships can be filtered within AND clause',
        runner(setupKeystone, async ({ keystone, create }) => {
          const ids = [];

          ids.push((await create('Post', { content: 'Hello world' })).id);
          ids.push((await create('Post', { content: 'hi world' })).id);
          ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

          const user = await create('User', { posts: ids });

          // Create a dummy user to make sure we're actually filtering it out
          const user2 = await create('User', { posts: [ids[0]] });

          const { data, errors } = await graphqlRequest({
            keystone,
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
              content
            }
          }
        }
      `,
          });

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allUsers.0.posts');
          expect(data.allUsers[0].posts).toHaveLength(1);
          expect(data).toMatchObject({
            allUsers: [
              {
                id: user.id,
                posts: [{ id: ids[2] }],
              },
              {
                id: user2.id,
                posts: [],
              },
            ],
          });
        })
      );

      test(
        'nested to-many relationships can be filtered within OR clause',
        runner(setupKeystone, async ({ keystone, create }) => {
          const ids = [];

          ids.push((await create('Post', { content: 'Hello world' })).id);
          ids.push((await create('Post', { content: 'hi world' })).id);
          ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

          const user = await create('User', { posts: ids });

          // Create a dummy user to make sure we're actually filtering it out
          const user2 = await create('User', { posts: [ids[0]] });

          const { data, errors } = await graphqlRequest({
            keystone,
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

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allUsers.0.posts');
          expect(data).toMatchObject({
            allUsers: [
              {
                id: user.id,
                posts: expect.arrayContaining([
                  expect.objectContaining({ id: ids[1] }),
                  expect.objectContaining({ id: ids[2] }),
                ]),
              },
              {
                id: user2.id,
                posts: [],
              },
            ],
          });
          // `expect.arrayContaining()` doesn't fail if there are _more_ results
          // than expected
          expect(data.allUsers[0].posts).toHaveLength(2);
        })
      );

      test(
        'Filtering out all items by nested field should return []',
        runner(setupKeystone, async ({ keystone, create }) => {
          await create('User', {});

          const result = await graphqlRequest({
            keystone,
            query: `
              query {
                allUsers(where: { posts_some: { content_contains: "foo" } }) {
                  posts { id }
                }
              }
            `,
          });
          expect(result.errors).toBe(undefined);

          expect(Array.isArray(result.data.allUsers)).toBeTruthy();
          expect(result.data.allUsers).toHaveLength(0);
        })
      );
    });

    describe('relationship meta filtering', () => {
      test(
        'nested to-many relationships return meta info',
        runner(setupKeystone, async ({ keystone, create }) => {
          const ids = [];

          ids.push((await create('Post', { content: 'Hello world' })).id);
          ids.push((await create('Post', { content: 'hi world' })).id);
          ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

          const user = await create('User', { posts: ids });

          // Create a dummy user to make sure we're actually filtering it out
          const user2 = await create('User', { posts: [ids[0]] });

          const { data, errors } = await graphqlRequest({
            keystone,
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

          expect(errors).toBe(undefined);
          expect(data.allUsers).toHaveLength(2);
          expect(data).toHaveProperty('allUsers.0._postsMeta');
          expect(data).toMatchObject({
            allUsers: [
              {
                id: user.id,
                _postsMeta: { count: 3 },
              },
              {
                id: user2.id,
                _postsMeta: { count: 1 },
              },
            ],
          });
        })
      );

      test(
        'nested to-many relationship meta can be filtered',
        runner(setupKeystone, async ({ keystone, create }) => {
          const ids = [];

          ids.push((await create('Post', { content: 'Hello world' })).id);
          ids.push((await create('Post', { content: 'hi world' })).id);
          ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

          const user = await create('User', { posts: ids });

          // Create a dummy user to make sure we're actually filtering it out
          const user2 = await create('User', { posts: [ids[0]] });

          const { data, errors } = await graphqlRequest({
            keystone,
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

          expect(errors).toBe(undefined);
          expect(data.allUsers).toHaveLength(2);
          expect(data).toHaveProperty('allUsers.0._postsMeta');
          expect(data).toMatchObject({
            allUsers: [
              {
                id: user.id,
                _postsMeta: { count: 2 },
              },
              {
                id: user2.id,
                _postsMeta: { count: 0 },
              },
            ],
          });
        })
      );

      test(
        'nested to-many relationship meta can be limited',
        runner(setupKeystone, async ({ keystone, create }) => {
          const ids = [];

          ids.push((await create('Post', { content: 'Hello world' })).id);
          ids.push((await create('Post', { content: 'hi world' })).id);
          ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

          const user = await create('User', { posts: ids });

          // Create a dummy user to make sure we're actually filtering it out
          const user2 = await create('User', { posts: [ids[0]] });

          const { data, errors } = await graphqlRequest({
            keystone,
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

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('allUsers.0._postsMeta');
          expect(data.allUsers).toHaveLength(2);
          expect(data).toMatchObject({
            allUsers: [
              {
                id: user.id,
                _postsMeta: { count: 1 },
              },
              {
                id: user2.id,
                _postsMeta: { count: 1 },
              },
            ],
          });
        })
      );

      test(
        'nested to-many relationship meta can be filtered within AND clause',
        runner(setupKeystone, async ({ keystone, create }) => {
          const ids = [];

          ids.push((await create('Post', { content: 'Hello world' })).id);
          ids.push((await create('Post', { content: 'hi world' })).id);
          ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

          const user = await create('User', { posts: ids });

          // Create a dummy user to make sure we're actually filtering it out
          const user2 = await create('User', { posts: [ids[0]] });

          const { data, errors } = await graphqlRequest({
            keystone,
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

          expect(errors).toBe(undefined);
          expect(data.allUsers).toHaveLength(2);
          expect(data).toHaveProperty('allUsers.0._postsMeta');
          expect(data).toMatchObject({
            allUsers: [
              {
                id: user.id,
                _postsMeta: { count: 1 },
              },
              {
                id: user2.id,
                _postsMeta: { count: 0 },
              },
            ],
          });
        })
      );

      test(
        'nested to-many relationship meta can be filtered within OR clause',
        runner(setupKeystone, async ({ keystone, create }) => {
          const ids = [];

          ids.push((await create('Post', { content: 'Hello world' })).id);
          ids.push((await create('Post', { content: 'hi world' })).id);
          ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

          const user = await create('User', { posts: ids });

          // Create a dummy user to make sure we're actually filtering it out
          const user2 = await create('User', { posts: [ids[0]] });

          const { data, errors } = await graphqlRequest({
            keystone,
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

          expect(errors).toBe(undefined);
          expect(data.allUsers).toHaveLength(2);
          expect(data).toHaveProperty('allUsers.0._postsMeta');
          expect(data).toMatchObject({
            allUsers: [
              {
                id: user.id,
                _postsMeta: { count: 2 },
              },
              {
                id: user2.id,
                _postsMeta: { count: 0 },
              },
            ],
          });
        })
      );
    });
  })
);
