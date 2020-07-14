const { Text } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystonejs/test-utils');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
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
          const { errors } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          createUser(data: { email: "hi@test.com" }) { id }
        }
      `,
          });
          expect(errors).toBe(undefined);

          const { errors: errors2 } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          createUser(data: { email: "hi@test.com" }) { id }
        }
      `,
          });

          expect(errors2).toHaveProperty('0.message');
          expect(errors2[0].message).toEqual(expect.stringMatching(/duplicate key|to be unique/));
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
          expect(errors[0].message).toEqual(expect.stringMatching(/duplicate key|to be unique/));
        })
      );

      test(
        'Configuring uniqueness on one field does not affect others',
        runner(setupKeystone, async ({ keystone }) => {
          const { data, errors } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          foo: createUser(data: { email: "1", username: "jess" }) { id }
          bar: createUser(data: { email: "2", username: "jess" }) { id }
        }
      `,
          });

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('foo.id');
          expect(data).toHaveProperty('bar.id');
        })
      );
    });
  })
);
