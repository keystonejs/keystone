const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystonejs/fields');
const {
  multiAdapterRunners,
  setupServer,
  graphqlRequest,
  networkedGraphqlRequest,
} = require('@keystonejs/test-utils');

const alphanumGenerator = gen.alphaNumString.notEmpty();

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
    },
  });
}
multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('no access control', () => {
      test(
        'removes matched item from list',
        runner(setupKeystone, async ({ keystone, create, findById }) => {
          const groupName = `foo${sampleOne(alphanumGenerator)}`;

          const createGroup = await create('Group', { name: groupName });

          // Create an item to update
          const createEvent = await create('Event', {
            title: 'A thing',
            group: createGroup.id,
          });

          // Avoid false-positives by checking the database directly
          expect(createEvent).toHaveProperty('group');
          expect(createEvent.group.toString()).toBe(createGroup.id);

          // Update the item and link the relationship field
          const { data, errors } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          updateEvent(
            id: "${createEvent.id}"
            data: {
              group: { disconnect: { id: "${createGroup.id}" } }
            }
          ) {
            id
            group {
              id
            }
          }
        }
    `,
          });

          expect(data).toMatchObject({
            updateEvent: {
              id: expect.any(String),
              group: null,
            },
          });
          expect(errors).toBe(undefined);

          // Avoid false-positives by checking the database directly
          const eventData = await findById('Event', createEvent.id);

          expect(eventData).toHaveProperty('group', null);
        })
      );

      test(
        'silently succeeds if used during create',
        runner(setupKeystone, async ({ keystone }) => {
          const FAKE_ID = '5b84f38256d3c2df59a0d9bf';

          // Create an item that does the linking
          const { data, errors } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          createEvent(data: {
            group: {
              disconnect: { id: "${FAKE_ID}" }
            }
          }) {
            id
            group {
              id
            }
          }
        }
    `,
          });
          expect(errors).toBe(undefined);

          expect(data.createEvent).toMatchObject({
            id: expect.any(String),
            group: null,
          });
          expect(data.createEvent).not.toHaveProperty('errors');
        })
      );

      test(
        'silently succeeds if no item to disconnect during update',
        runner(setupKeystone, async ({ keystone, create }) => {
          const FAKE_ID = '5b84f38256d3c2df59a0d9bf';

          // Create an item to link against
          const createEvent = await create('Event', {});

          // Create an item that does the linking
          const { data, errors } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          updateEvent(
            id: "${createEvent.id}",
            data: {
              group: {
                disconnect: { id: "${FAKE_ID}" }
              }
            }
          ) {
            id
            group {
             id
           }
          }
        }
    `,
          });
          expect(errors).toBe(undefined);
          expect(data.updateEvent).toMatchObject({
            id: expect.any(String),
            group: null,
          });
          expect(data.updateEvent).not.toHaveProperty('errors');
        })
      );

      test(
        'silently succeeds if item to disconnect does not match during update',
        runner(setupKeystone, async ({ keystone, create }) => {
          const groupName = `foo${sampleOne(alphanumGenerator)}`;
          const FAKE_ID = '5b84f38256d3c2df59a0d9bf';

          // Create an item to link against
          const createGroup = await create('Group', { name: groupName });
          const createEvent = await create('Event', { group: createGroup.id });

          // Create an item that does the linking
          const { data, errors } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          updateEvent(
            id: "${createEvent.id}",
            data: {
              group: {
                disconnect: { id: "${FAKE_ID}" }
              }
            }
          ) {
            id
            group {
             id
           }
          }
        }
    `,
          });
          expect(errors).toBe(undefined);
          expect(data.updateEvent).toMatchObject({
            id: expect.any(String),
            group: { id: createGroup.id },
          });
          expect(data.updateEvent).not.toHaveProperty('errors');
        })
      );
    });

    describe('with access control', () => {
      describe('read: false on related list', () => {
        test(
          'has no effect when disconnecting a specific id',
          runner(setupKeystone, async ({ app, create, findById }) => {
            const groupName = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createGroup = await create('GroupNoRead', { name: groupName });

            // Create an item to update
            const createEvent = await create('EventToGroupNoRead', {
              group: createGroup.id,
            });

            // Avoid false-positives by checking the database directly
            expect(createEvent).toHaveProperty('group');
            expect(createEvent.group.toString()).toBe(createGroup.id);

            // Update the item and link the relationship field
            const { errors } = await networkedGraphqlRequest({
              app,
              query: `
                mutation {
                  updateEventToGroupNoRead(
                    id: "${createEvent.id}"
                    data: {
                      group: { disconnect: { id: "${createGroup.id}" } }
                    }
                  ) {
                    id
                  }
                }
              `,
            });
            expect(errors).toBe(undefined);

            // Avoid false-positives by checking the database directly
            const eventData = await findById('EventToGroupNoRead', createEvent.id);

            expect(eventData).toHaveProperty('group');
            expect(eventData.group).toBe(null);
          })
        );

        test.failing('silently ignores an item that otherwise would match the filter', () => {
          // TODO: Fill this in when we support more filtering on Unique items than
          // just ID.
          expect(false).toBe(true);
        });
      });
    });
  })
);
