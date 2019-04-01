const { Text } = require('@keystone-alpha/fields');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystone-alpha/test-utils');
const cuid = require('cuid');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('User', {
        fields: {
          username: { type: Text },
          email: { type: Text, isUnique: true },
        },
      });
    },
  });
}
multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('uniqueness', () => {
      test(
        'uniqueness is enforced over multiple mutations',
        runner(setupKeystone, async ({ keystone }) => {
          await graphqlRequest({
            keystone,
            query: `
        mutation {
          createUser(data: { email: "hi@test.com" }) { id }
        }
      `,
          });

          const { errors } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          createUser(data: { email: "hi@test.com" }) { id }
        }
      `,
          });

          expect(errors).toHaveProperty('0.message');
          expect(errors[0].message).toEqual(expect.stringMatching(/duplicate key/));
        })
      );

      test(
        'uniqueness is enforced over single mutation',
        runner(setupKeystone, async ({ keystone }) => {
          const { errors } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          foo: createUser(data: { email: "hi@test.com" }) { id }
          bar: createUser(data: { email: "hi@test.com" }) { id }
        }
      `,
          });

          expect(errors).toHaveProperty('0.message');
          expect(errors[0].message).toEqual(expect.stringMatching(/duplicate key/));
        })
      );

      test(
        'Configuring uniqueness on one field does not affect others',
        runner(setupKeystone, async ({ keystone }) => {
          const { data } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          foo: createUser(data: { email: "1", username: "jess" }) { id }
          bar: createUser(data: { email: "2", username: "jess" }) { id }
        }
      `,
          });

          expect(data).toHaveProperty('foo.id');
          expect(data).toHaveProperty('bar.id');
        })
      );
    });
  })
);
