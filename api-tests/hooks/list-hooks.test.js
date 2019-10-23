const { Text } = require('@keystone/fields');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystone/test-utils');
const cuid = require('cuid');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('User', {
        fields: {
          name: {
            type: Text,
            hooks: {
              resolveInput: ({ resolvedData }) => {
                return `${resolvedData.name}-field`;
              },
            },
          },
        },
        hooks: {
          resolveInput: ({ resolvedData }) => {
            return {
              name: `${resolvedData.name}-list`,
            };
          },
        },
      });
    },
  });
}
multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('List Hooks: #resolveInput()', () => {
      it(
        'resolves fields first, then passes them to the list',
        runner(setupKeystone, async ({ keystone }) => {
          const { data, errors } = await graphqlRequest({
            keystone,
            query: `
              mutation {
                createUser(data: { name: "jess" }) { name }
              }
            `,
          });

          if (errors && errors.length) {
            throw errors;
          }

          // Field should be executed first, appending `-field`, then the list
          // should be executed which appends `-list`, and finally that total
          // result should be stored.
          expect(data.createUser.name).toBe('jess-field-list');
        })
      );
    });
  })
);
