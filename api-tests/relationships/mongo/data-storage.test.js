const { Text, Relationship } = require('@keystone/fields');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystone/test-utils');
const cuid = require('cuid');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('User', {
        fields: {
          posts: { type: Relationship, ref: 'Post', many: true },
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

let adapterRunners = multiAdapterRunners().filter(({ adapterName }) => adapterName === 'mongoose');

// Sanity check that our tests are running against mongoose
test('Mongoose adapter exists', () => {
  expect(adapterRunners).toMatchObject([{ adapterName: 'mongoose' }]);
});

adapterRunners.forEach(({ runner, adapterName }) =>
  describe(`${adapterName} Data Storage`, () => {
    test(
      'to-many relationship must be stored as empty array',
      runner(setupKeystone, async ({ keystone, findById }) => {
        const { data, errors } = await graphqlRequest({
          keystone,
          query: `
            mutation {
              createUser(data: {}) {
                id
              }
            }
          `,
        });

        expect(errors).toBe(undefined);

        const {
          createUser: { id },
        } = data;

        const storedData = await findById('User', id);

        expect(Array.isArray(storedData.posts)).toBeTruthy();
        expect(storedData.posts).toHaveLength(0);
      })
    );

    test(
      'disconnecting all items in to-many relationship should store empty array',
      runner(setupKeystone, async ({ keystone, findById }) => {
        const createResult = await graphqlRequest({
          keystone,
          query: `
            mutation {
              createUser(data: { posts: { create: [{ content: "hi" }] } }) {
                id
              }
            }
          `,
        });

        expect(createResult.errors).toBe(undefined);

        const storedCreateData = await findById('User', createResult.data.createUser.id);
        expect(Array.isArray(storedCreateData.posts)).toBeTruthy();
        expect(storedCreateData.posts).toHaveLength(1);

        const updateResult = await graphqlRequest({
          keystone,
          query: `
            mutation {
              updateUser(
                id: "${createResult.data.createUser.id}"
                data: {
                  posts: { disconnectAll: true }
                }
              ) {
                id
              }
            }
          `,
        });

        expect(updateResult.errors).toBe(undefined);

        const storedUpdateData = await findById('User', createResult.data.createUser.id);
        expect(Array.isArray(storedUpdateData.posts)).toBeTruthy();
        expect(storedUpdateData.posts).toHaveLength(0);
      })
    );
  })
);
