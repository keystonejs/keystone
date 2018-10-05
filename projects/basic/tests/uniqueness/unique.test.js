const { Text } = require('@voussoir/fields');
const { resolveAllKeys, mapKeys } = require('@voussoir/utils');
const { setupServer, graphqlRequest } = require('../util');
const cuid = require('cuid');

let server;

beforeAll(async () => {
  server = setupServer({
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('User', {
        fields: {
          username: { type: Text },
          email: { type: Text, unique: true },
        },
      });
    },
  });

  await server.keystone.connect();
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

describe('uniqueness', () => {
  test('uniqueness is enforced over multiple mutations', async () => {
    const queryUser = await graphqlRequest({
      server,
      query: `
        mutation {
          createUser(data: { email: "hi@test.com" }) { id }
        }
      `,
    });

    expect(queryUser.body).not.toHaveProperty('errors');

    const queryUser2 = await graphqlRequest({
      server,
      query: `
        mutation {
          createUser(data: { email: "hi@test.com" }) { id }
        }
      `,
    });

    expect(queryUser2.body).toHaveProperty('errors.0.message');
    expect(queryUser2.body.errors[0].message).toEqual(expect.stringMatching(/duplicate key error/));
  });

  test('uniqueness is enforced over single mutation', async () => {
    const queryUser = await graphqlRequest({
      server,
      query: `
        mutation {
          foo: createUser(data: { email: "hi@test.com" }) { id }
          bar: createUser(data: { email: "hi@test.com" }) { id }
        }
      `,
    });

    expect(queryUser.body).toHaveProperty('errors.0.message');
    expect(queryUser.body.errors[0].message).toEqual(expect.stringMatching(/duplicate key error/));
  });

  test('Configuring uniqueness on one field does not affect others', async () => {
    const queryUser = await graphqlRequest({
      server,
      query: `
        mutation {
          foo: createUser(data: { email: "1", username: "jess" }) { id }
          bar: createUser(data: { email: "2", username: "jess" }) { id }
        }
      `,
    });

    expect(queryUser.body).not.toHaveProperty('errors');
    expect(queryUser.body).toHaveProperty('data.foo.id');
    expect(queryUser.body).toHaveProperty('data.bar.id');
  });

  test.failing(
    'adding uniqueness to a field containing non-unique data will fail connection',
    async () => {
      // I have no idea how to test this :/
      expect(false).toBe(true);
    }
  );
});
