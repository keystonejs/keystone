const { gen, sampleOne } = require('testcheck');
const { Text, DateTime } = require('@keystonejs/fields');
const { resolveAllKeys, mapKeys } = require('@keystonejs/utils');
const cuid = require('cuid');

const { setupServer, graphqlRequest } = require('../util');

let server;

beforeAll(() => {
  server = setupServer({
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('Post', {
        fields: {
          title: { type: Text },
          postedAt: { type: DateTime },
        },
      });
    },
  });

  server.keystone.connect();
});

function create(list, item) {
  return server.keystone.getListByKey(list).adapter.create(item);
}

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

describe('DateTime type', () => {
  test('response is serialized as a String', async () => {
    const title = sampleOne(gen.alphaNumString.notEmpty());
    const postedAt = '2018-08-31T06:49:07.000Z';

    const createPost = await create('Post', { title, postedAt });

    // Create an item that does the linking
    const { body } = await graphqlRequest({
      server,
      query: `
        query {
          Post(where: { id: "${createPost.id}" }) {
            postedAt
          }
        }
    `,
    });

    expect(body).toHaveProperty('data.Post.postedAt', postedAt);
  });

  test('input type is accepted as a String', async () => {
    const postedAt = '2018-08-31T06:49:07.000Z';

    // Create an item that does the linking
    const { body } = await graphqlRequest({
      server,
      query: `
        mutation {
          createPost(data: { postedAt: "${postedAt}" }) {
            postedAt
          }
        }
    `,
    });

    expect(body).not.toHaveProperty('errors');
    expect(body).toHaveProperty('data.createPost.postedAt', postedAt);
  });
});
