import { AdapterName, testConfig } from '@keystone-next/test-utils-legacy';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig } from '@keystone-next/test-utils-legacy';

function setupKeystone(adapterName: AdapterName) {
  return setupFromConfig({
    adapterName,
    config: testConfig({
      lists: createSchema({
        Group: list({
          fields: {
            name: text(),
          },
        }),
        Event: list({
          fields: {
            title: text(),
            group: relationship({ ref: 'Group' }),
          },
        }),
      }),
    }),
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('errors on incomplete data', () => {
      test(
        'when neither id or create data passed',
        runner(setupKeystone, async ({ context }) => {
          // Create an item that does the linking
          const { errors } = await context.graphql.raw({
            query: `
              mutation {
                createEvent(data: { group: {} }) {
                  id
                }
              }`,
          });

          expect(errors).toMatchObject([
            { message: 'Nested mutation operation invalid for Event.group<Group>' },
          ]);
        })
      );

      test(
        'when both id and create data passed',
        runner(setupKeystone, async ({ context }) => {
          // Create an item that does the linking
          const { data, errors } = await context.graphql.raw({
            query: `
              mutation {
                createEvent(data: { group: {
                  connect: { id: "abc123"},
                  create: { name: "foo" }
                } }) {
                  id
                }
              }`,
          });

          expect(data?.createEvent).toBe(null);
          expect(errors).toMatchObject([
            { message: 'Nested mutation operation invalid for Event.group<Group>' },
          ]);
        })
      );
    });
  })
);
