const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystonejs/fields');
const cuid = require('cuid');
const {
  multiAdapterRunners,
  setupServer,
  graphqlRequest,
  networkedGraphqlRequest,
} = require('@keystonejs/test-utils');

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
      const accessControlGroups = [
        { name: 'GroupNoRead', allowed: true, func: 'read: () => false' },
        { name: 'GroupNoReadHard', allowed: true, func: 'read: false' },
        { name: 'GroupNoCreate', allowed: false, func: 'create: () => false' },
        { name: 'GroupNoCreateHard', allowed: false, func: 'create: false' },
        { name: 'GroupNoUpdate', allowed: true, func: 'update: () => false' },
        { name: 'GroupNoUpdateHard', allowed: true, func: 'update: false' },
      ];

      accessControlGroups.forEach(group => {
        describe(`${group.func} on related list`, () => {
          if (group.allowed) {
            test(
              'does not throw error when creating nested within create mutation',
              runner(setupKeystone, async ({ app, findOne, findById }) => {
                const groupName = sampleOne(gen.alphaNumString.notEmpty());

                // Create an item that does the nested create
                const { data, errors } = await networkedGraphqlRequest({
                  app,
                  query: `
                mutation {
                  createEventTo${group.name}(data: {
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
                  [`createEventTo${group.name}`]: { id: expect.any(String) },
                });

                // See that it actually stored the group ID on the Event record
                const event = await findOne(`EventTo${group.name}`, { title: 'A thing' });
                expect(event).toBeTruthy();
                expect(event.group).toBeTruthy();

                const _group = await findById(group.name, event.group);
                expect(_group).toBeTruthy();
                expect(_group.name).toBe(groupName);
              })
            );

            test(
              'does not throw error when creating nested within update mutation',
              runner(setupKeystone, async ({ app, create, findOne, findById }) => {
                const groupName = sampleOne(gen.alphaNumString.notEmpty());

                // Create an item to update
                const eventModel = await create(`EventTo${group.name}`, { title: 'A thing' });

                // Update an item that does the nested create
                const { data, errors } = await networkedGraphqlRequest({
                  app,
                  query: `
                mutation {
                  updateEventTo${group.name}(
                    id: "${eventModel.id}"
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
                expect(data).toMatchObject({
                  [`updateEventTo${group.name}`]: { id: expect.any(String) },
                });

                // See that it actually stored the group ID on the Event record
                const event = await findOne(`EventTo${group.name}`, { title: 'A thing' });
                expect(event).toBeTruthy();
                expect(event.group).toBeTruthy();

                const _group = await findById(group.name, event.group);
                expect(_group).toBeTruthy();
                expect(_group.name).toBe(groupName);
              })
            );
          } else {
            describe(`${group.func} on related list`, () => {
              test(
                'throws error when creating nested within create mutation',
                runner(setupKeystone, async ({ app, findOne }) => {
                  const alphaNumGenerator = gen.alphaNumString.notEmpty();
                  const eventName = sampleOne(alphaNumGenerator);
                  const groupName = sampleOne(alphaNumGenerator);

                  // Create an item that does the nested create
                  const { errors } = await networkedGraphqlRequest({
                    app,
                    query: `
                mutation {
                  createEventTo${group.name}(data: {
                    title: "${eventName}",
                    group: { create: { name: "${groupName}" } }
                  }) {
                    id
                  }
                }
              `,
                  });

                  // Assert it throws an access denied error
                  //console.log(data, errors, group);
                  expect(errors).toBeTruthy();
                  if (!group.name.match(/Hard/)) {
                    expect(errors).toMatchObject([
                      {
                        data: {
                          errors: expect.arrayContaining([
                            expect.objectContaining({
                              message: `Unable to create a EventTo${group.name}.group<${group.name}>`,
                            }),
                          ]),
                        },
                      },
                    ]);
                  }

                  // Confirm it didn't insert either of the records anyway
                  const findGroup = await findOne(group.name, { name: groupName });
                  expect(findGroup).toBeFalsy();

                  // Confirm it didn't insert either of the records anyway
                  const findEvent = await findOne(`EventTo${group.name}`, { title: eventName });
                  expect(findEvent).toBeFalsy();
                })
              );

              test(
                'throws error when creating nested within update mutation',
                runner(setupKeystone, async ({ app, create, findOne }) => {
                  const groupName = sampleOne(gen.alphaNumString.notEmpty());

                  // Create an item to update
                  const eventModel = await create(`EventTo${group.name}`, {
                    title: 'A thing',
                  });

                  // Update an item that does the nested create
                  const { data, errors } = await networkedGraphqlRequest({
                    app,
                    query: `
                mutation {
                  updateEventToGroupNoCreate(
                    id: "${eventModel.id}"
                    data: {
                      errors: expect.arrayContaining([
                        expect.objectContaining({
                          message: `Unable to create a EventTo${group.name}.group<${group.name}>`,
                        }),
                      ]),
                    },
                  },
                ]);

                // Confirm it didn't insert either of the records anyway
                const result = await graphqlRequest({
                  keystone,
                  query: `
                    query {
                      all${group.name}s(where: { name: "${groupName}" }) {
                        id
                        name
                      }
                    }
                  ) {
                    id
                  }
                }
              `,
                  });

                  // Assert it throws an access denied error
                  expect(data[`updateEventTo${group.name}`]).toBeFalsy();
                  expect(errors).toBeTruthy();
                  if (!group.name.match(/Hard/)) {
                    expect(errors).toMatchObject([
                      {
                        data: {
                          errors: expect.arrayContaining([
                            expect.objectContaining({
                              message: `Unable to create a EventTo${group.name}.group<${group.name}>`,
                            }),
                          ]),
                        },
                      },
                    ]);
                  }

                  // Confirm it didn't insert the record anyway
                  const findGroup = await findOne(group.name, { name: groupName });
                  expect(findGroup).toBeFalsy();
                })
              );
            });
          }
        });
      });
    });
  })
);
