const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystone/fields');
const cuid = require('cuid');
const {
  multiAdapterRunners,
  setupServer,
  graphqlRequest,
  networkedGraphqlRequest,
} = require('@keystone/test-utils');

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
        'create nested from within create mutation',
        runner(setupKeystone, async ({ keystone }) => {
          const groupName = sampleOne(gen.alphaNumString.notEmpty());

          // Create an item that does the nested create
          const { data, errors } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          createEvent(data: {
            title: "A thing",
            group: { create: { name: "${groupName}" } }
          }) {
            id
            group {
              id
              name
            }
          }
        }
    `,
          });

          expect(errors).toBe(undefined);
          expect(data).toMatchObject({
            createEvent: {
              id: expect.any(String),
              group: {
                id: expect.any(String),
                name: groupName,
              },
            },
          });

          const {
            data: { Group },
          } = await graphqlRequest({
            keystone,
            query: `
        query {
          Group(where: { id: "${data.createEvent.group.id}" }) {
            id
            name
          }
        }
    `,
          });

          expect(Group).toMatchObject({
            id: data.createEvent.group.id,
            name: groupName,
          });
        })
      );

      test(
        'create nested from within update mutation',
        runner(setupKeystone, async ({ keystone, create }) => {
          const groupName = sampleOne(gen.alphaNumString.notEmpty());

          // Create an item to update
          const createEvent = await create('Event', { title: 'A thing' });

          // Update an item that does the nested create
          const { data, errors } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          updateEvent(
            id: "${createEvent.id}"
            data: {
              title: "A thing",
              group: { create: { name: "${groupName}" } }
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

          expect(errors).toBe(undefined);
          expect(data).toMatchObject({
            updateEvent: {
              id: expect.any(String),
              group: {
                id: expect.any(String),
                name: groupName,
              },
            },
          });

          const {
            data: { Group },
          } = await graphqlRequest({
            keystone,
            query: `
        query {
          Group(where: { id: "${data.updateEvent.group.id}" }) {
            id
            name
          }
        }
    `,
          });

          expect(Group).toMatchObject({
            id: data.updateEvent.group.id,
            name: groupName,
          });
        })
      );
    });

    describe('with access control', () => {
      describe('read: false on related list', () => {
        test(
          'does not throw error when creating nested within create mutation',
          runner(setupKeystone, async ({ app, findOne, findById }) => {
            const groupName = sampleOne(gen.alphaNumString.notEmpty());

            // Create an item that does the nested create
            const { data, errors } = await networkedGraphqlRequest({
              app,
              query: `
                mutation {
                  createEventToGroupNoRead(data: {
                    title: "A thing",
                    group: { create: { name: "${groupName}" } }
                  }) {
                    id
                  }
                }
              `,
            });

            expect(errors).toBe(undefined);
            expect(data).toMatchObject({
              createEventToGroupNoRead: { id: expect.any(String) },
            });

            // See that it actually stored the group ID on the Event record
            const event = await findOne('EventToGroupNoRead', { title: 'A thing' });
            expect(event).toBeTruthy();
            expect(event.group).toBeTruthy();

            const group = await findById('GroupNoRead', event.group);
            expect(group).toBeTruthy();
            expect(group.name).toBe(groupName);
          })
        );

        test(
          'does not throw error when creating nested within update mutation',
          runner(setupKeystone, async ({ app, create, findOne, findById }) => {
            const groupName = sampleOne(gen.alphaNumString.notEmpty());

            // Create an item to update
            const createEventToGroupNoRead = await create('EventToGroupNoRead', {
              title: 'A thing',
            });

            // Update an item that does the nested create
            const { data, errors } = await networkedGraphqlRequest({
              app,
              query: `
                mutation {
                  updateEventToGroupNoRead(
                    id: "${createEventToGroupNoRead.id}"
                    data: {
                      title: "A thing",
                      group: { create: { name: "${groupName}" } }
                    }
                  ) {
                    id
                  }
                }
              `,
            });

            expect(errors).toBe(undefined);
            expect(data).toMatchObject({ updateEventToGroupNoRead: { id: expect.any(String) } });

            // See that it actually stored the group ID on the Event record
            const event = await findOne('EventToGroupNoRead', { title: 'A thing' });
            expect(event).toBeTruthy();
            expect(event.group).toBeTruthy();

            const group = await findById('GroupNoRead', event.group);
            expect(group).toBeTruthy();
            expect(group.name).toBe(groupName);
          })
        );
      });

      describe('create: false on related list', () => {
        test(
          'throws error when creating nested within create mutation',
          runner(setupKeystone, async ({ keystone, app }) => {
            const alphaNumGenerator = gen.alphaNumString.notEmpty();
            const eventName = sampleOne(alphaNumGenerator);
            const groupName = sampleOne(alphaNumGenerator);

            // Create an item that does the nested create
            const { data, errors } = await networkedGraphqlRequest({
              app,
              query: `
                mutation {
                  createEventToGroupNoCreate(data: {
                    title: "${eventName}",
                    group: { create: { name: "${groupName}" } }
                  }) {
                    id
                  }
                }
              `,
            });

            // Assert it throws an access denied error
            expect(data.createEventToGroupNoCreate).toBe(null);
            expect(errors).toMatchObject([
              {
                data: {
                  errors: expect.arrayContaining([
                    expect.objectContaining({
                      message: 'Unable to create a EventToGroupNoCreate.group<GroupNoCreate>',
                    }),
                  ]),
                },
              },
            ]);

            // Confirm it didn't insert either of the records anyway
            const {
              data: { allGroupNoCreates },
            } = await graphqlRequest({
              keystone,
              query: `
          query {
            allGroupNoCreates(where: { name: "${groupName}" }) {
              id
              name
            }
          }
      `,
            });

            expect(allGroupNoCreates).toMatchObject([]);

            // Confirm it didn't insert either of the records anyway
            const {
              data: { allEventToGroupNoCreates },
            } = await graphqlRequest({
              keystone,
              query: `
          query {
            allEventToGroupNoCreates(where: { title: "${eventName}" }) {
              id
              title
            }
          }
      `,
            });

            expect(allEventToGroupNoCreates).toMatchObject([]);
          })
        );

        test(
          'throws error when creating nested within update mutation',
          runner(setupKeystone, async ({ keystone, app, create }) => {
            const groupName = sampleOne(gen.alphaNumString.notEmpty());

            // Create an item to update
            const createEventToGroupNoCreate = await create('EventToGroupNoCreate', {
              title: 'A thing',
            });

            // Update an item that does the nested create
            const { data, errors } = await networkedGraphqlRequest({
              app,
              query: `
                mutation {
                  updateEventToGroupNoCreate(
                    id: "${createEventToGroupNoCreate.id}"
                    data: {
                      title: "A thing",
                      group: { create: { name: "${groupName}" } }
                    }
                  ) {
                    id
                  }
                }
              `,
            });

            // Assert it throws an access denied error
            expect(data.updateEventToGroupNoCreate).toBe(null);
            expect(errors).toMatchObject([
              {
                data: {
                  errors: expect.arrayContaining([
                    expect.objectContaining({
                      message: 'Unable to create a EventToGroupNoCreate.group<GroupNoCreate>',
                    }),
                  ]),
                },
              },
            ]);

            // Confirm it didn't insert the record anyway
            const {
              data: { allGroupNoCreates },
            } = await graphqlRequest({
              keystone,
              query: `
          query {
            allGroupNoCreates(where: { name: "${groupName}" }) {
              id
              name
            }
          }
      `,
            });

            expect(allGroupNoCreates).toMatchObject([]);
          })
        );
      });
    });
  })
);
