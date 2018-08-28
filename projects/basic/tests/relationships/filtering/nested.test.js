const { Text, Relationship } = require('@keystonejs/fields');
const { resolveAllKeys, mapKeys } = require('@keystonejs/utils');
const { setupServer, graphqlRequest } = require('../../util');
const cuid = require('cuid');

let server;

function create(list, item) {
  // bypass the access control settings
  return server.keystone.getListByKey(list).adapter.create(item);
}

beforeAll(() => {
  server = setupServer({
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

  server.keystone.connect();
});

afterAll(async () => {
  // clean the db
  await resolveAllKeys(mapKeys(server.keystone.adapters, adapter => adapter.dropDatabase()));
  // then shut down
  await resolveAllKeys(
    mapKeys(server.keystone.adapters, adapter => adapter.dropDatabase().then(() => adapter.close()))
  );
});

beforeEach(() =>
  // clean the db
  resolveAllKeys(mapKeys(server.keystone.adapters, adapter => adapter.dropDatabase())));

// TODO: Test the case outlined in https://github.com/keystonejs/keystone-5/issues/224
describe('relationship filtering', () => {
  test('nested to-many relationships can be filtered', async () => {
    const ids = [];

    ids.push((await create('Post', { content: 'Hello world' })).id);
    ids.push((await create('Post', { content: 'hi world' })).id);
    ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

    const user = await create('User', { posts: ids });

    // Create a dummy user to make sure we're actually filtering it out
    const user2 = await create('User', { posts: [ids[0]] });

    // NOTE: This will fail with current AND implementation
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
  });

  test('nested to-many relationships can be limited', async () => {
    const ids = [];

    ids.push((await create('Post', { content: 'Hello world' })).id);
    ids.push((await create('Post', { content: 'hi world' })).id);
    ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

    const user = await create('User', { posts: ids });

    // Create a dummy user to make sure we're actually filtering it out
    const user2 = await create('User', { posts: [ids[0]] });

    // NOTE: This will fail with current AND implementation
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
  });

  test('nested to-many relationships can be filtered within AND clause', async () => {
    const ids = [];

    ids.push((await create('Post', { content: 'Hello world' })).id);
    ids.push((await create('Post', { content: 'hi world' })).id);
    ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

    const user = await create('User', { posts: ids });

    // Create a dummy user to make sure we're actually filtering it out
    const user2 = await create('User', { posts: [ids[0]] });

    // NOTE: This will fail with current AND implementation
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
  });
});
