const { Text, Relationship } = require('@keystonejs/fields');
const { resolveAllKeys, mapKeys } = require('@keystonejs/utils');
const { setupServer, graphqlRequest } = require('../../util');

let server;

// Random IDs
const postIds = ['gjfp463bxqtf', '43cg2hr9tmt3', '3qr8zpg7n4k6'];

function create(list, item) {
  // bypass the access control settings
  return server.keystone.getListByKey(list).adapter.create(item);
}

beforeAll(() => {
  server = setupServer({
    name: 'Tests relationship field nested create many',
    createLists: keystone => {
      keystone.createList('User', {
        fields: {
          company: { type: Relationship, ref: 'Company' },
        },
      });

      keystone.createList('Company', {
        fields: {
          name: { type: Text },
        },
      });
    },
  });

  server.keystone.connect();
});

afterAll(() =>
  resolveAllKeys(
    mapKeys(server.keystone.adapters, adapter =>
      adapter.dropDatabase().then(() => adapter.close())
    )
  ));

beforeEach(() =>
  // clean the db
  resolveAllKeys(
    mapKeys(server.keystone.adapters, adapter => adapter.dropDatabase())
  ));


// TODO: Test the case outlined in https://github.com/keystonejs/keystone-5/issues/224
describe('relationship filtering', () => {
  test('implicitly filters to only the IDs in the database by default', () => {

  });

  test('explicitly filters when given a `where` clause', () => {

  });

  // NOTE: Will continue failing until
  // @keystonejs/fields/Relationship#getQueryConditionsMany() is implemented
  test.only('nested to-single relationships can be filtered within AND clause', async () => {
    const company = await create('Company', { name: 'Thinkmill' });
    const otherCompany = await create('Company', { name: 'Cete' });

    const user = await create('User', { company: company.id });
    await create('User', { company: otherCompany.id });

    // NOTE: This will fail with current AND implementation
    const queryUser = await graphqlRequest({
      server,
      query: `
        query {
          allUsers(where: {
            AND: [
              { company: { name_contains: "in" } },
              { company: { name_contains: "ll" } }
            ]
          }) {
            id
            company {
              id
              name
            }
          }
        }
      `
    });

    expect(queryUser.body).not.toHaveProperty('errors');
    expect(queryUser.body.data.allUsers).toHaveLength(1);
    expect(queryUser.body.data).toMatchObject({
      allUsers: [{
        id: user.id,
        company: {
          id: company.id,
          name: 'Thinkmill',
        }
      }],
    });
  });

  test.failing('nested to-many relationships can be filtered within AND clause', async () => {
    const ids = [];

    ids.push((await create('Post', { content: 'Hello world' })).id);
    ids.push((await create('Post', { content: 'hi world' })).id);
    ids.push((await create('Post', { content: 'Hello? Or hi?' })).id);

    const user = await create('User', { posts: ids });

    // NOTE: This will fail with current AND implementation
    const queryUser = await graphqlRequest({
      server,
      query: `
        query {
          allUsers(where: {
            AND: [
              { posts_some: { content_contains: "hi" } },
              { posts_some: { content_contains: "lo" } }
            ]
          }) {
            id
            posts {
              id
              content
            }
          }
        }
      `
    });

    expect(queryUser.body).not.toHaveProperty('errors');
    expect(queryUser.body.data).toMatchObject({
      allUsers: [{
        id: user.id,
        posts: [
          { id: ids[2] },
        ]
      }],
    });
  });

});
