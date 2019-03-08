const { Text, Relationship } = require('@keystone-alpha/fields');
const cuid = require('cuid');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystone-alpha/test-utils');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
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

      keystone.createList('GroupNoRead', {
        fields: {
          name: { type: Text },
        },
        access: {
          read: () => false,
        },
      });

      keystone.createList('EventToGroupNoRead', {
        fields: {
          title: { type: Text },
          group: { type: Relationship, ref: 'GroupNoRead' },
        },
      });

      keystone.createList('GroupNoCreate', {
        fields: {
          name: { type: Text },
        },
        access: {
          create: () => false,
        },
      });

      keystone.createList('EventToGroupNoCreate', {
        fields: {
          title: { type: Text },
          group: { type: Relationship, ref: 'GroupNoCreate' },
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
        runner(setupKeystone, async ({ server: { server } }) => {
          // Create an item that does the linking
          const createEvent = await graphqlRequest({
            server,
            query: `
        mutation {
          createEvent(data: { group: {} }) {
            id
          }
        }
    `,
          });

          expect(createEvent.body).toHaveProperty('data.createEvent', null);
          expect(createEvent.body.errors).toMatchObject([
            {
              name: 'NestedError',
              data: {
                errors: [
                  {
                    message: 'Nested mutation operation invalid for Event.group<Group>',
                    path: ['createEvent', 'group'],
                    name: 'Error',
                  },
                  {
                    name: 'ParameterError',
                    path: ['createEvent', 'group', '<validate>'],
                  },
                ],
              },
            },
          ]);
        })
      );

      test(
        'when both id and create data passed',
        runner(setupKeystone, async ({ server: { server } }) => {
          // Create an item that does the linking
          const createEvent = await graphqlRequest({
            server,
            query: `
        mutation {
          createEvent(data: { group: {
            connect: { id: "abc123"},
            create: { name: "foo" }
          } }) {
            id
          }
        }
    `,
          });

          expect(createEvent.body).toHaveProperty('data.createEvent', null);
          expect(createEvent.body.errors).toMatchObject([
            {
              name: 'NestedError',
              data: {
                errors: [
                  {
                    message: 'Nested mutation operation invalid for Event.group<Group>',
                    path: ['createEvent', 'group'],
                    name: 'Error',
                  },
                  {
                    name: 'ParameterError',
                    path: ['createEvent', 'group', '<validate>'],
                  },
                ],
              },
            },
          ]);
        })
      );
    });
  })
);
