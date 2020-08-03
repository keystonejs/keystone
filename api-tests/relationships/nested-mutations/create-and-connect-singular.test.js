const { Text, Relationship } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('Group', {
        fields: {
          name: { type: Text },
        },
      });

      keystone.createList('Event', {
        fields: {
          title: { type: Text },
          group: { type: Relationship, ref: 'Group' },
        },
      });
    },
  });
}
multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('errors on incomplete data', () => {
      test(
        'when neither id or create data passed',
        runner(setupKeystone, async ({ keystone }) => {
          // Create an item that does the linking
          const { errors } = await keystone.executeGraphQL({
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
        runner(setupKeystone, async ({ keystone }) => {
          // Create an item that does the linking
          const { data, errors } = await keystone.executeGraphQL({
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

          expect(data.createEvent).toBe(null);
          expect(errors).toMatchObject([
            { message: 'Nested mutation operation invalid for Event.group<Group>' },
          ]);
        })
      );
    });
  })
);
