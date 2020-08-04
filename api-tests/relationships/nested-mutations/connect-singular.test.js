const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');
const { createItem, getItem } = require('@keystonejs/server-side-graphql-client');

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

      keystone.createList('GroupNoReadHard', {
        fields: { name: { type: Text } },
        access: { read: false },
      });

      keystone.createList('EventToGroupNoReadHard', {
        fields: {
          title: { type: Text },
          group: { type: Relationship, ref: 'GroupNoReadHard' },
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

      keystone.createList('GroupNoCreateHard', {
        fields: { name: { type: Text } },
        access: { create: false },
      });

      keystone.createList('EventToGroupNoCreateHard', {
        fields: {
          title: { type: Text },
          group: { type: Relationship, ref: 'GroupNoCreateHard' },
        },
      });

      keystone.createList('GroupNoUpdate', {
        fields: { name: { type: Text } },
        access: { update: () => false },
      });

      keystone.createList('EventToGroupNoUpdate', {
        fields: {
          title: { type: Text },
          group: { type: Relationship, ref: 'GroupNoUpdate' },
        },
      });

      keystone.createList('GroupNoUpdateHard', {
        fields: { name: { type: Text } },
        access: { update: false },
      });

      keystone.createList('EventToGroupNoUpdateHard', {
        fields: {
          title: { type: Text },
          group: { type: Relationship, ref: 'GroupNoUpdateHard' },
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
        runner(setupKeystone, async ({ keystone }) => {
          const groupName = sampleOne(gen.alphaNumString.notEmpty());

          // Create an item to link against
          const createGroup = await createItem({
            keystone,
            listKey: 'Group',
            item: { name: groupName },
          });

          // Create an item that does the linking
          const { data, errors } = await keystone.executeGraphQL({
            query: `
              mutation {
                createEvent(data: {
                  title: "A thing",
                  group: { connect: { id: "${createGroup.id}" } }
                }) {
                  id
                }
              }`,
          });

          expect(data).toMatchObject({ createEvent: { id: expect.any(String) } });
          expect(errors).toBe(undefined);
        })
      );

      test(
        'link nested from within update mutation',
        runner(setupKeystone, async ({ keystone }) => {
          const groupName = sampleOne(gen.alphaNumString.notEmpty());

          // Create an item to link against
          const createGroup = await createItem({
            keystone,
            listKey: 'Group',
            item: { name: groupName },
          });

          // Create an item to update
          const {
            data: { createEvent },
            errors,
          } = await keystone.executeGraphQL({
            query: 'mutation { createEvent(data: { title: "A thing", }) { id } }',
          });
          expect(errors).toBe(undefined);

          // Update the item and link the relationship field
          const { data, errors: errors2 } = await keystone.executeGraphQL({
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
              }`,
          });
          expect(errors2).toBe(undefined);
          expect(data).toMatchObject({
            updateEvent: {
              id: expect.any(String),
              group: { id: expect.any(String), name: groupName },
            },
          });
        })
      );
    });

    describe('non-matching filter', () => {
      test(
        'errors if connecting an item which cannot be found during creating',
        runner(setupKeystone, async ({ keystone }) => {
          const FAKE_ID = adapterName === 'mongoose' ? '5b84f38256d3c2df59a0d9bf' : 100;

          // Create an item that does the linking
          const { errors } = await keystone.executeGraphQL({
            query: `
              mutation {
                createEvent(data: {
                  group: {
                    connect: { id: "${FAKE_ID}" }
                  }
                }) {
                  id
                }
              }`,
          });

          expect(errors).toMatchObject([{ message: 'Unable to connect a Event.group<Group>' }]);
        })
      );

      test(
        'errors if connecting an item which cannot be found during update',
        runner(setupKeystone, async ({ keystone }) => {
          const FAKE_ID = adapterName === 'mongoose' ? '5b84f38256d3c2df59a0d9bf' : 100;

          // Create an item to link against
          const createEvent = await createItem({ keystone, listKey: 'Event', item: {} });

          // Create an item that does the linking
          const { errors } = await keystone.executeGraphQL({
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
              }`,
          });

          expect(errors).toMatchObject([{ message: 'Unable to connect a Event.group<Group>' }]);
        })
      );
    });

    describe('with access control', () => {
      [
        { name: 'GroupNoRead', allowed: false, func: 'read: () => false' },
        { name: 'GroupNoReadHard', allowed: false, func: 'read: false' },
        { name: 'GroupNoCreate', allowed: true, func: 'create: () => false' },
        { name: 'GroupNoCreateHard', allowed: true, func: 'create: false' },
        { name: 'GroupNoUpdate', allowed: true, func: 'update: () => false' },
        { name: 'GroupNoUpdateHard', allowed: true, func: 'update: false' },
      ].forEach(group => {
        describe(`${group.func} on related list`, () => {
          if (group.allowed) {
            test(
              'does not throw error when linking nested within create mutation',
              runner(setupKeystone, async ({ keystone }) => {
                const groupName = sampleOne(gen.alphaNumString.notEmpty());

                // Create an item to link against
                // We can't use the graphQL query here (it's `create: () => false`)
                const { id } = await createItem({
                  keystone,
                  listKey: group.name,
                  item: { name: groupName },
                  context: keystone.createContext({ schemaName: 'internal' }),
                });
                expect(id).toBeTruthy();

                // Create an item that does the linking
                const { data, errors } = await keystone.executeGraphQL({
                  query: `
                    mutation {
                      createEventTo${group.name}(data: {
                        title: "A thing",
                        group: { connect: { id: "${id}" } }
                      }) {
                        id
                        group {
                          id
                        }
                      }
                    }`,
                });

                expect(data).toMatchObject({
                  [`createEventTo${group.name}`]: { id: expect.any(String), group: { id } },
                });
                expect(errors).toBe(undefined);
              })
            );
            test(
              'does not throw error when linking nested within update mutation',
              runner(setupKeystone, async ({ keystone }) => {
                const groupName = sampleOne(gen.alphaNumString.notEmpty());

                // Create an item to link against
                const groupModel = await createItem({
                  keystone,
                  listKey: group.name,
                  item: { name: groupName },
                  context: keystone.createContext({ schemaName: 'internal' }),
                });
                expect(groupModel.id).toBeTruthy();

                // Create an item to update
                const eventModel = await createItem({
                  keystone,
                  listKey: `EventTo${group.name}`,
                  item: { title: 'A Thing' },
                });
                expect(eventModel.id).toBeTruthy();

                // Update the item and link the relationship field
                const { data, errors } = await keystone.executeGraphQL({
                  query: `
                    mutation {
                      updateEventTo${group.name}(
                        id: "${eventModel.id}"
                        data: {
                          title: "A thing",
                          group: { connect: { id: "${groupModel.id}" } }
                        }
                      ) {
                        id
                        group {
                          id
                          name
                        }
                      }
                    }`,
                });

                expect(data).toMatchObject({
                  [`updateEventTo${group.name}`]: {
                    id: expect.any(String),
                    group: { id: expect.any(String), name: groupName },
                  },
                });
                expect(errors).toBe(undefined);

                // See that it actually stored the group ID on the Event record
                const event = await getItem({
                  keystone,
                  listKey: `EventTo${group.name}`,
                  itemId: data[`updateEventTo${group.name}`].id,
                  returnFields: 'id group { id name }',
                });
                expect(event).toBeTruthy();
                expect(event.group).toBeTruthy();
                expect(event.group.name).toBe(groupName);
              })
            );
          } else {
            test(
              'throws error when linking nested within update mutation',
              runner(setupKeystone, async ({ keystone }) => {
                const groupName = sampleOne(gen.alphaNumString.notEmpty());

                // Create an item to link against
                const groupModel = await createItem({
                  keystone,
                  listKey: group.name,
                  item: { name: groupName },
                });
                expect(groupModel.id).toBeTruthy();

                // Create an item to update
                const eventModel = await createItem({
                  keystone,
                  listKey: `EventTo${group.name}`,
                  item: { title: 'A thing' },
                });
                expect(eventModel.id).toBeTruthy();

                // Update the item and link the relationship field
                const { errors } = await keystone.executeGraphQL({
                  query: `
                    mutation {
                      updateEventTo${group.name}(
                        id: "${eventModel.id}"
                        data: {
                          title: "A thing",
                          group: { connect: { id: "${groupModel.id}" } }
                        }
                      ) {
                        id
                      }
                    }`,
                });
                expect(errors).toHaveLength(1);
                const error = errors[0];
                expect(error.message).toEqual(
                  `Unable to connect a EventTo${group.name}.group<${group.name}>`
                );
                expect(error.path).toHaveLength(1);
                expect(error.path[0]).toEqual(`updateEventTo${group.name}`);
              })
            );

            test(
              'throws error when linking nested within create mutation',
              runner(setupKeystone, async ({ keystone }) => {
                const groupName = sampleOne(gen.alphaNumString.notEmpty());

                // Create an item to link against
                const { id } = await createItem({
                  keystone,
                  listKey: group.name,
                  item: { name: groupName },
                });
                expect(id).toBeTruthy();

                // Create an item that does the linking
                const { errors } = await keystone.executeGraphQL({
                  query: `
                    mutation {
                      createEventTo${group.name}(data: {
                        title: "A thing",
                        group: { connect: { id: "${id}" } }
                      }) {
                        id
                      }
                    }`,
                });
                expect(errors).toHaveLength(1);
                const error = errors[0];
                expect(error.message).toEqual(
                  `Unable to connect a EventTo${group.name}.group<${group.name}>`
                );
                expect(error.path).toHaveLength(1);
                expect(error.path[0]).toEqual(`createEventTo${group.name}`);
              })
            );
          }
        });
      });
    });
  })
);
