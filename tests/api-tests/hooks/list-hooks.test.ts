import { AdapterName, testConfig } from '@keystone-next/test-utils-legacy';
import { text } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig } from '@keystone-next/test-utils-legacy';

function setupKeystone(adapterName: AdapterName) {
  return setupFromConfig({
    adapterName,
    config: testConfig({
      lists: createSchema({
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
      }),
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
