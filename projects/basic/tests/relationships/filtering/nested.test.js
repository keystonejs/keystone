const { Text, Relationship } = require('@voussoir/fields');
const { keystoneMongoTest, setupServer, graphqlRequest } = require('../../util');
const cuid = require('cuid');

function setupKeystone() {
  return setupServer({
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

describe('relationship filtering', () => {
  test(
    'nested to-many relationships can be filtered',
    keystoneMongoTest(setupKeystone, async ({ server, create }) => {
      const ids = [];

      ids.push((await create('Post', { content: 'Hello world' })).id);
      ids.push((await create('Post', { content: 'hi world' })).id);
      ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

      const user = await create('User', { posts: ids });

      // Create a dummy user to make sure we're actually filtering it out
      const user2 = await create('User', { posts: [ids[0]] });

      const queryUser = await graphqlRequest({
        server,
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

      expect(queryUser.body).not.toHaveProperty('errors');
      expect(queryUser.body.data).toHaveProperty('allUsers.0.posts');
      expect(queryUser.body.data.allUsers[0].posts).toHaveLength(2);
      expect(queryUser.body.data).toMatchObject({
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
    keystoneMongoTest(setupKeystone, async ({ server, create }) => {
      const ids = [];

      ids.push((await create('Post', { content: 'Hello world' })).id);
      ids.push((await create('Post', { content: 'hi world' })).id);
      ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

      const user = await create('User', { posts: ids });

      // Create a dummy user to make sure we're actually filtering it out
      const user2 = await create('User', { posts: [ids[0]] });

      const queryUser = await graphqlRequest({
        server,
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

      expect(queryUser.body).not.toHaveProperty('errors');
      expect(queryUser.body.data).toHaveProperty('allUsers.0.posts');
      expect(queryUser.body.data.allUsers[0].posts).toHaveLength(1);
      expect(queryUser.body.data).toMatchObject({
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
    keystoneMongoTest(setupKeystone, async ({ server, create }) => {
      const ids = [];

      ids.push((await create('Post', { content: 'Hello world' })).id);
      ids.push((await create('Post', { content: 'hi world' })).id);
      ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

      const user = await create('User', { posts: ids });

      // Create a dummy user to make sure we're actually filtering it out
      const user2 = await create('User', { posts: [ids[0]] });

      const queryUser = await graphqlRequest({
        server,
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

      expect(queryUser.body).not.toHaveProperty('errors');
      expect(queryUser.body.data).toHaveProperty('allUsers.0.posts');
      expect(queryUser.body.data.allUsers[0].posts).toHaveLength(1);
      expect(queryUser.body.data).toMatchObject({
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
});

describe('relationship meta filtering', () => {
  test(
    'nested to-many relationships return meta info',
    keystoneMongoTest(setupKeystone, async ({ server, create }) => {
      const ids = [];

      ids.push((await create('Post', { content: 'Hello world' })).id);
      ids.push((await create('Post', { content: 'hi world' })).id);
      ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

      const user = await create('User', { posts: ids });

      // Create a dummy user to make sure we're actually filtering it out
      const user2 = await create('User', { posts: [ids[0]] });

      const queryUser = await graphqlRequest({
        server,
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

      expect(queryUser.body).not.toHaveProperty('errors');
      expect(queryUser.body.data.allUsers).toHaveLength(2);
      expect(queryUser.body.data).toHaveProperty('allUsers.0._postsMeta');
      expect(queryUser.body.data).toMatchObject({
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
    keystoneMongoTest(setupKeystone, async ({ server, create }) => {
      const ids = [];

      ids.push((await create('Post', { content: 'Hello world' })).id);
      ids.push((await create('Post', { content: 'hi world' })).id);
      ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

      const user = await create('User', { posts: ids });

      // Create a dummy user to make sure we're actually filtering it out
      const user2 = await create('User', { posts: [ids[0]] });

      const queryUser = await graphqlRequest({
        server,
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

      expect(queryUser.body).not.toHaveProperty('errors');
      expect(queryUser.body.data.allUsers).toHaveLength(2);
      expect(queryUser.body.data).toHaveProperty('allUsers.0._postsMeta');
      expect(queryUser.body.data).toMatchObject({
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
    keystoneMongoTest(setupKeystone, async ({ server, create }) => {
      const ids = [];

      ids.push((await create('Post', { content: 'Hello world' })).id);
      ids.push((await create('Post', { content: 'hi world' })).id);
      ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

      const user = await create('User', { posts: ids });

      // Create a dummy user to make sure we're actually filtering it out
      const user2 = await create('User', { posts: [ids[0]] });

      const queryUser = await graphqlRequest({
        server,
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

      expect(queryUser.body).not.toHaveProperty('errors');
      expect(queryUser.body.data).toHaveProperty('allUsers.0._postsMeta');
      expect(queryUser.body.data.allUsers).toHaveLength(2);
      expect(queryUser.body.data).toMatchObject({
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
    keystoneMongoTest(setupKeystone, async ({ server, create }) => {
      const ids = [];

      ids.push((await create('Post', { content: 'Hello world' })).id);
      ids.push((await create('Post', { content: 'hi world' })).id);
      ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

      const user = await create('User', { posts: ids });

      // Create a dummy user to make sure we're actually filtering it out
      const user2 = await create('User', { posts: [ids[0]] });

      const queryUser = await graphqlRequest({
        server,
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

      expect(queryUser.body).not.toHaveProperty('errors');
      expect(queryUser.body.data.allUsers).toHaveLength(2);
      expect(queryUser.body.data).toHaveProperty('allUsers.0._postsMeta');
      expect(queryUser.body.data).toMatchObject({
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
});
