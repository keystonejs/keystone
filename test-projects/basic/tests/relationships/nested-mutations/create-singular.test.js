const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@voussoir/fields');
const cuid = require('cuid');
const { keystoneMongoTest, setupServer, graphqlRequest } = require('@voussoir/test-utils');

function setupKeystone() {
  return setupServer({
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

describe('no access control', () => {
  test(
    'create nested from within create mutation',
    keystoneMongoTest(setupKeystone, async ({ server: { server } }) => {
      const groupName = sampleOne(gen.alphaNumString.notEmpty());

      // Create an item that does the nested create
      const createEvent = await graphqlRequest({
        server,
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

      expect(createEvent.body).not.toHaveProperty('errors');
      expect(createEvent.body.data).toMatchObject({
        createEvent: {
          id: expect.any(String),
          group: {
            id: expect.any(String),
            name: groupName,
          },
        },
      });

      const {
        body: {
          data: { Group },
        },
      } = await graphqlRequest({
        server,
        query: `
        query {
          Group(where: { id: "${createEvent.body.data.createEvent.group.id}" }) {
            id
            name
          }
        }
    `,
      });

      expect(Group).toMatchObject({
        id: createEvent.body.data.createEvent.group.id,
        name: groupName,
      });
    })
  );

  test(
    'create nested from within update mutation',
    keystoneMongoTest(setupKeystone, async ({ server: { server }, create }) => {
      const groupName = sampleOne(gen.alphaNumString.notEmpty());

      // Create an item to update
      const createEvent = await create('Event', { title: 'A thing' });

      // Update an item that does the nested create
      const updateEvent = await graphqlRequest({
        server,
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

      expect(updateEvent.body).not.toHaveProperty('errors');
      expect(updateEvent.body.data).toMatchObject({
        updateEvent: {
          id: expect.any(String),
          group: {
            id: expect.any(String),
            name: groupName,
          },
        },
      });

      const {
        body: {
          data: { Group },
        },
      } = await graphqlRequest({
        server,
        query: `
        query {
          Group(where: { id: "${updateEvent.body.data.updateEvent.group.id}" }) {
            id
            name
          }
        }
    `,
      });

      expect(Group).toMatchObject({
        id: updateEvent.body.data.updateEvent.group.id,
        name: groupName,
      });
    })
  );
});

describe('with access control', () => {
  describe('read: false on related list', () => {
    test(
      'does not throw error when creating nested within create mutation',
      keystoneMongoTest(setupKeystone, async ({ server: { server }, findOne, findById }) => {
        const groupName = sampleOne(gen.alphaNumString.notEmpty());

        // Create an item that does the nested create
        const createEventToGroupNoRead = await graphqlRequest({
          server,
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

        expect(createEventToGroupNoRead.body).not.toHaveProperty('errors');
        expect(createEventToGroupNoRead.body.data).toMatchObject({
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
      keystoneMongoTest(
        setupKeystone,
        async ({ server: { server }, create, findOne, findById }) => {
          const groupName = sampleOne(gen.alphaNumString.notEmpty());

          // Create an item to update
          const createEventToGroupNoRead = await create('EventToGroupNoRead', {
            title: 'A thing',
          });

          // Update an item that does the nested create
          const updateEventToGroupNoRead = await graphqlRequest({
            server,
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

          expect(updateEventToGroupNoRead.body).not.toHaveProperty('errors');
          expect(updateEventToGroupNoRead.body.data).toMatchObject({
            updateEventToGroupNoRead: { id: expect.any(String) },
          });

          // See that it actually stored the group ID on the Event record
          const event = await findOne('EventToGroupNoRead', { title: 'A thing' });
          expect(event).toBeTruthy();
          expect(event.group).toBeTruthy();

          const group = await findById('GroupNoRead', event.group);
          expect(group).toBeTruthy();
          expect(group.name).toBe(groupName);
        }
      )
    );
  });

  describe('create: false on related list', () => {
    test(
      'throws error when creating nested within create mutation',
      keystoneMongoTest(setupKeystone, async ({ server: { server } }) => {
        const alphaNumGenerator = gen.alphaNumString.notEmpty();
        const eventName = sampleOne(alphaNumGenerator);
        const groupName = sampleOne(alphaNumGenerator);

        // Create an item that does the nested create
        const createEventToGroupNoCreate = await graphqlRequest({
          server,
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
        expect(createEventToGroupNoCreate.body).toHaveProperty(
          'data.createEventToGroupNoCreate',
          null
        );
        expect(createEventToGroupNoCreate.body.errors).toMatchObject([
          {
            name: 'NestedError',
            data: {
              errors: [
                {
                  path: ['createEventToGroupNoCreate', 'group', 'create'],
                },
              ],
            },
          },
        ]);

        // Confirm it didn't insert either of the records anyway
        const {
          body: {
            data: { allGroupNoCreates },
          },
        } = await graphqlRequest({
          server,
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
          body: {
            data: { allEventToGroupNoCreates },
          },
        } = await graphqlRequest({
          server,
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
      keystoneMongoTest(setupKeystone, async ({ server: { server }, create }) => {
        const groupName = sampleOne(gen.alphaNumString.notEmpty());

        // Create an item to update
        const createEventToGroupNoCreate = await create('EventToGroupNoCreate', {
          title: 'A thing',
        });

        // Update an item that does the nested create
        const updateEventToGroupNoCreate = await graphqlRequest({
          server,
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
        expect(updateEventToGroupNoCreate.body).toHaveProperty(
          'data.updateEventToGroupNoCreate',
          null
        );
        expect(updateEventToGroupNoCreate.body.errors).toMatchObject([
          {
            name: 'NestedError',
            data: {
              errors: [
                {
                  path: ['updateEventToGroupNoCreate', 'group', 'create'],
                },
              ],
            },
          },
        ]);

        // Confirm it didn't insert the record anyway
        const {
          body: {
            data: { allGroupNoCreates },
          },
        } = await graphqlRequest({
          server,
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
