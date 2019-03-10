const { gen, sampleOne } = require('testcheck');
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
    describe('no access control', () => {
      test(
        'link nested from within create mutation',
        runner(setupKeystone, async ({ server: { server }, create }) => {
          const groupName = sampleOne(gen.alphaNumString.notEmpty());

          // Create an item to link against
          const createGroup = await create('Group', { name: groupName });

          // Create an item that does the linking
          const { body } = await graphqlRequest({
            server,
            query: `
          mutation {
            createEvent(data: {
              title: "A thing",
              group: { connect: { id: "${createGroup.id}" } }
            }) {
              id
            }
          }
      `,
          });

          expect(body.data).toMatchObject({
            createEvent: { id: expect.any(String) },
          });
          expect(body).not.toHaveProperty('errors');
        })
      );

      test(
        'link nested from within update mutation',
        runner(setupKeystone, async ({ server: { server }, create }) => {
          const groupName = sampleOne(gen.alphaNumString.notEmpty());

          // Create an item to link against
          const createGroup = await create('Group', { name: groupName });

          // Create an item to update
          const {
            body: {
              data: { createEvent },
            },
          } = await graphqlRequest({
            server,
            query: 'mutation { createEvent(data: { title: "A thing", }) { id } }',
          });

          // Update the item and link the relationship field
          const { body } = await graphqlRequest({
            server,
            query: `
        mutation {
          updateEvent(
            id: "${createEvent.id}"
            data: {
              title: "A thing",
              group: { connect: { id: "${createGroup.id}" } }
            }
          ) {
            id
            group {
              id
              name
            }
          }
        }
    `,
          });

          expect(body.data).toMatchObject({
            updateEvent: {
              id: expect.any(String),
              group: {
                id: expect.any(String),
                name: groupName,
              },
            },
          });
          expect(body).not.toHaveProperty('errors');
        })
      );
    });

    describe('non-matching filter', () => {
      test(
        'errors if connecting an item which cannot be found during creating',
        runner(setupKeystone, async ({ server: { server } }) => {
          const FAKE_ID = adapterName === 'mongoose' ? '5b84f38256d3c2df59a0d9bf' : 100;

          // Create an item that does the linking
          const createEvent = await graphqlRequest({
            server,
            query: `
        mutation {
          createEvent(data: {
            group: {
              connect: { id: "${FAKE_ID}" }
            }
          }) {
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
                    message: 'Unable to connect a Event.group<Group>',
                    path: ['createEvent', 'group'],
                    name: 'Error',
                  },
                  {
                    name: 'AccessDeniedError',
                    path: ['createEvent', 'group', 'connect'],
                  },
                ],
              },
            },
          ]);
        })
      );

      test(
        'errors if connecting an item which cannot be found during update',
        runner(setupKeystone, async ({ server: { server }, create }) => {
          const FAKE_ID = adapterName === 'mongoose' ? '5b84f38256d3c2df59a0d9bf' : 100;

          // Create an item to link against
          const createEvent = await create('Event', {});

          // Create an item that does the linking
          const updateEvent = await graphqlRequest({
            server,
            query: `
        mutation {
          updateEvent(
            id: "${createEvent.id}",
            data: {
              group: {
                connect: { id: "${FAKE_ID}" }
              }
            }
          ) {
            id
          }
        }
    `,
          });

          expect(updateEvent.body).toHaveProperty('data.updateEvent', null);
          expect(updateEvent.body.errors).toMatchObject([
            {
              name: 'NestedError',
              data: {
                errors: [
                  {
                    message: 'Unable to connect a Event.group<Group>',
                    path: ['updateEvent', 'group'],
                    name: 'Error',
                  },
                  {
                    name: 'AccessDeniedError',
                    path: ['updateEvent', 'group', 'connect'],
                  },
                ],
              },
            },
          ]);
        })
      );
    });

    describe('with access control', () => {
      describe('read: false on related list', () => {
        test(
          'throws error when linking nested within create mutation',
          runner(setupKeystone, async ({ server: { server }, create }) => {
            const groupName = sampleOne(gen.alphaNumString.notEmpty());

            // Create an item to link against
            const createGroupNoRead = await create('GroupNoRead', {
              name: groupName,
            });

            // Create an item that does the linking
            const { body } = await graphqlRequest({
              server,
              query: `
          mutation {
            createEventToGroupNoRead(data: {
              title: "A thing",
              group: { connect: { id: "${createGroupNoRead.id}" } }
            }) {
              id
            }
          }
      `,
            });

            expect(body).toHaveProperty('data.createEventToGroupNoRead', null);
            expect(body.errors).toMatchObject([
              {
                name: 'NestedError',
                data: {
                  errors: [
                    {
                      message: 'Unable to connect a EventToGroupNoRead.group<GroupNoRead>',
                      path: ['createEventToGroupNoRead', 'group'],
                      name: 'Error',
                    },
                    {
                      name: 'AccessDeniedError',
                      path: ['createEventToGroupNoRead', 'group', 'connect'],
                    },
                  ],
                },
              },
            ]);
          })
        );

        test(
          'does not throw error when linking nested within update mutation',
          runner(setupKeystone, async ({ server: { server }, create }) => {
            const groupName = sampleOne(gen.alphaNumString.notEmpty());

            // Create an item to link against
            const createGroupNoRead = await create('GroupNoRead', {
              name: groupName,
            });

            expect(createGroupNoRead.id).toBeTruthy();

            // Create an item to update
            const {
              body: {
                data: { createEventToGroupNoRead },
              },
            } = await graphqlRequest({
              server,
              query: 'mutation { createEventToGroupNoRead(data: { title: "A thing", }) { id } }',
            });

            expect(createEventToGroupNoRead.id).toBeTruthy();

            // Update the item and link the relationship field
            const { body } = await graphqlRequest({
              server,
              query: `
          mutation {
            updateEventToGroupNoRead(
              id: "${createEventToGroupNoRead.id}"
              data: {
                title: "A thing",
                group: { connect: { id: "${createGroupNoRead.id}" } }
              }
            ) {
              id
            }
          }
      `,
            });

            expect(body).toHaveProperty('data.updateEventToGroupNoRead', null);
            expect(body.errors).toMatchObject([
              {
                name: 'NestedError',
                data: {
                  errors: [
                    {
                      message: 'Unable to connect a EventToGroupNoRead.group<GroupNoRead>',
                      path: ['updateEventToGroupNoRead', 'group'],
                      name: 'Error',
                    },
                    {
                      name: 'AccessDeniedError',
                      path: ['updateEventToGroupNoRead', 'group', 'connect'],
                    },
                  ],
                },
              },
            ]);
          })
        );
      });

      describe('create: false on related list', () => {
        test(
          'does not throw error when linking nested within create mutation',
          runner(setupKeystone, async ({ server: { server }, create }) => {
            const groupName = sampleOne(gen.alphaNumString.notEmpty());

            // Create an item to link against
            // We can't use the graphQL query here (it's `create: () => false`)
            const { id } = await create('GroupNoCreate', { name: groupName });

            // Create an item that does the linking
            const { body } = await graphqlRequest({
              server,
              query: `
          mutation {
            createEventToGroupNoCreate(data: {
              title: "A thing",
              group: { connect: { id: "${id}" } }
            }) {
              id
              group {
                id
              }
            }
          }
      `,
            });

            expect(body.data).toMatchObject({
              createEventToGroupNoCreate: { id: expect.any(String), group: { id } },
            });
            expect(body).not.toHaveProperty('errors');
          })
        );

        test(
          'does not throw error when linking nested within update mutation',
          runner(setupKeystone, async ({ server: { server }, create, findOne, findById }) => {
            const groupName = sampleOne(gen.alphaNumString.notEmpty());

            // Create an item to link against
            // We can't use the graphQL query here (it's `create: () => false`)
            const createGroupNoCreate = await create('GroupNoCreate', {
              name: groupName,
            });

            // Create an item to update
            const createEventToGroupNoCreate = await create('EventToGroupNoCreate', {
              title: 'A Thing',
            });

            // Update the item and link the relationship field
            const { body } = await graphqlRequest({
              server,
              query: `
          mutation {
            updateEventToGroupNoCreate(
              id: "${createEventToGroupNoCreate.id}"
              data: {
                title: "A thing",
                group: { connect: { id: "${createGroupNoCreate.id}" } }
              }
            ) {
              id
              group {
                id
                name
              }
            }
          }
      `,
            });

            expect(body.data).toMatchObject({
              updateEventToGroupNoCreate: {
                id: expect.any(String),
                group: {
                  id: expect.any(String),
                  name: groupName,
                },
              },
            });
            expect(body).not.toHaveProperty('errors');

            // See that it actually stored the group ID on the Event record
            const event = await findOne('EventToGroupNoCreate', { title: 'A thing' });
            expect(event).toBeTruthy();
            expect(event.group).toBeTruthy();

            const group = await findById('GroupNoCreate', event.group);
            expect(group).toBeTruthy();
            expect(group.name).toBe(groupName);
          })
        );
      });
    });
  })
);
