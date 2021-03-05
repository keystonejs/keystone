const { text } = require('@keystone-next/fields');
const { createSchema, list } = require('@keystone-next/keystone/schema');
const { multiAdapterRunners, setupFromConfig } = require('@keystone-next/test-utils-legacy');

function setupKeystone(adapterName) {
  return setupFromConfig({
    adapterName,
    config: createSchema({
      lists: {
        User: list({
          fields: {
            name: text({
              hooks: {
                resolveInput: ({ resolvedData }) => {
                  return `${resolvedData.name}-field`;
                },
              },
            }),
          },
          hooks: {
            resolveInput: ({ resolvedData }) => {
              return {
                name: `${resolvedData.name}-list`,
              };
            },
          },
        }),
      },
    }),
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('List Hooks: #resolveInput()', () => {
      it(
        'resolves fields first, then passes them to the list',
        runner(setupKeystone, async ({ context }) => {
          const { data, errors } = await context.executeGraphQL({
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
