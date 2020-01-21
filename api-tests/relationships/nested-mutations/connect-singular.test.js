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
        fields: { name: { type: Text } },
        access: { read: () => false },
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
        fields: { name: { type: Text } },
        access: { create: () => false },
      });

      keystone.createList('EventToGroupNoCreate', {
        fields: {
          title: { type: Text },
          group: { type: Relationship, ref: 'GroupNoCreate' },
        },
      });

      keystone.createList('GroupNoCreateHard', {
        fields: { name: { type: Text }, },
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
        fields: { name: { type: Text }, },
        access: { update: false, },
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
        runner(setupKeystone, async ({ keystone, create }) => {
          const groupName = sampleOne(gen.alphaNumString.notEmpty());

          // Create an item to link against
          const createGroup = await create('Group', { name: groupName });

          // Create an item that does the linking
          const { data, errors } = await graphqlRequest({
            keystone,
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

          expect(data).toMatchObject({ createEvent: { id: expect.any(String) } });
          expect(errors).toBe(undefined);
        })
      );

      test(
        'link nested from within update mutation',
        runner(setupKeystone, async ({ keystone, create }) => {
          const groupName = sampleOne(gen.alphaNumString.notEmpty());

          // Create an item to link against
          const createGroup = await create('Group', { name: groupName });

          // Create an item to update
          const {
            data: { createEvent },
          } = await graphqlRequest({
            keystone,
            query: 'mutation { createEvent(data: { title: "A thing", }) { id } }',
          });

          // Update the item and link the relationship field
          const { data, errors } = await graphqlRequest({
            keystone,
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

          expect(data).toMatchObject({
            updateEvent: {
              id: expect.any(String),
              group: {
                id: expect.any(String),
                name: groupName,
              },
            },
          });
          expect(errors).toBe(undefined);
        })
      );
    });

    describe('non-matching filter', () => {
      test(
        'errors if connecting an item which cannot be found during creating',
        runner(setupKeystone, async ({ keystone }) => {
          const FAKE_ID = adapterName === 'mongoose' ? '5b84f38256d3c2df59a0d9bf' : 100;

          // Create an item that does the linking
          const { errors } = await graphqlRequest({
            keystone,
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

          expect(errors).toMatchObject([
            {
              message: 'Unable to connect a Event.group<Group>',
            },
          ]);
        })
      );

      test(
        'errors if connecting an item which cannot be found during update',
        runner(setupKeystone, async ({ keystone, create }) => {
          const FAKE_ID = adapterName === 'mongoose' ? '5b84f38256d3c2df59a0d9bf' : 100;

          // Create an item to link against
          const createEvent = await create('Event', {});

          // Create an item that does the linking
          const { errors } = await graphqlRequest({
            keystone,
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

          expect(errors).toMatchObject([
            {
              message: 'Unable to connect a Event.group<Group>',
            },
          ]);
        })
      );
    });

    describe('with access control', () => {

      const accessGroups = [
        { name: 'GroupNoRead', canBeCreated: false, accessFunction: 'read: () => false' },
        //{ name: 'GroupNoReadHard', canBeCreated: false, accessFunction: 'read: false' },
        { name: 'GroupNoCreate', canBeCreated: false, accessFunction: 'create: () => false' },
        // { name: 'GroupNoCreateHard', canBeCreated: false, accessFunction: 'create: false' },
        { name: 'GroupNoUpdate', canBeCreated: true, accessFunction: 'update: () => false' },
        // { name: 'GroupNoUpdateHard', canBeCreated: true, accessFunction: 'update: false' },
      ];

      accessGroups.forEach(group => {
        describe(`${group.accessFunction} on related list`, () => {
          if (!group.canBeCreated) {
            test(
              'throws error when linking nested within create mutation',
              runner(setupKeystone, async ({ app, create }) => {
                const groupModelName = sampleOne(gen.alphaNumString.notEmpty());

                // Create an item to link against
                const { id } = await create(group.name, {
                  name: groupModelName,
                });

                expect(id).toBeTruthy();

                // Create an item that does the linking
                const { data, errors } = await networkedGraphqlRequest({
                  app,
                  query: `
                mutation {
                  createEventTo${group.name}(data: {
                    title: "A thing",
                    group: { connect: { id: "${id}" } }
                  }) {
                    id
                  }
                }
              `,
                });

                // expect(errors).toBeTruthy();
                expect(errors).toMatchObject([
                  {
                    data: {
                      errors: expect.arrayContaining([
                        expect.objectContaining({
                          message: `Unable to connect a EventTo${group.name}.group<${group.name}>`,
                        }),
                      ]),
                    },
                  },
                ]);
                expect(data).toBe(undefined);
              })
            );
          } else {
            test(
              'does not throw error when linking nested within create mutation',
              runner(setupKeystone, async ({ app, create }) => {
                const groupModelName = sampleOne(gen.alphaNumString.notEmpty());

                // Create an item to link against
                // We can't use the graphQL query here (it's `create: () => false`)
                const { id } = await create(group.name, { name: groupModelName });
                expect(id).toBeTruthy();

                // Create an item that does the linking
                const { data, errors } = await networkedGraphqlRequest({
                  app,
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
                }
              `,
                });

                expect(data).toMatchObject({
                  [`createEventTo${group.name}`]: { id: expect.any(String), group: { id } },
                });
                expect(errors).toBe(undefined);
              })
            );
          }
          // all access groups allows to connect existing item to relation
          test(
            'does not throw error when linking nested within update mutation',
            runner(setupKeystone, async ({ app, create }) => {
              const groupModelName = sampleOne(gen.alphaNumString.notEmpty());

              // Create an item to link against
              const groupModel = await create(group.name, {
                name: groupModelName,
              });

              expect(groupModel.id).toBeTruthy();

              // Create an item to update
              const eventData = await networkedGraphqlRequest({
                app,
                query: `mutation { createEventTo${group.name}(data: { title: "A thing" }) { id } }`,
              });
              const event = eventData.data[`createEventTo${group.name}`];
              expect(event).toBeTruthy();

              // Update the item and link the relationship field
              const { errors, data } = await networkedGraphqlRequest({
                app,
                query: `
                mutation {
                  updateEventTo${group.name}(
                    id: "${event.id}"
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
                }
              `,
              });

              console.log(JSON.stringify(data), null, 2);
              expect(data).toMatchObject({
                [`updateEventTo${group.name}`]: {
                  id: expect.any(String),
                  group: {
                    id: expect.any(String),
                    name: groupModelName,
                  },
                },
              });
              expect(errors).toBe(undefined);
            })
          );
        });
      });

      // describe('create: false on related list', () => {
      //   test(
      //     'does not throw error when linking nested within create mutation',
      //     runner(setupKeystone, async ({ app, create }) => {
      //       const groupName = sampleOne(gen.alphaNumString.notEmpty());
      //
      //       // Create an item to link against
      //       // We can't use the graphQL query here (it's `create: () => false`)
      //       const { id } = await create('GroupNoCreate', { name: groupName });
      //
      //       // Create an item that does the linking
      //       const { data, errors } = await networkedGraphqlRequest({
      //         app,
      //         query: `
      //           mutation {
      //             createEventToGroupNoCreate(data: {
      //               title: "A thing",
      //               group: { connect: { id: "${id}" } }
      //             }) {
      //               id
      //               group {
      //                 id
      //               }
      //             }
      //           }
      //         `,
      //       });
      //
      //       expect(data).toMatchObject({
      //         createEventToGroupNoCreate: { id: expect.any(String), group: { id } },
      //       });
      //       expect(errors).toBe(undefined);
      //     })
      //   );
      //
      //   test(
      //     'does not throw error when linking nested within update mutation',
      //     runner(setupKeystone, async ({ app, create, findOne, findById }) => {
      //       const groupName = sampleOne(gen.alphaNumString.notEmpty());
      //
      //       // Create an item to link against
      //       // We can't use the graphQL query here (it's `create: () => false`)
      //       const createGroupNoCreate = await create('GroupNoCreate', {
      //         name: groupName,
      //       });
      //
      //       // Create an item to update
      //       const createEventToGroupNoCreate = await create('EventToGroupNoCreate', {
      //         title: 'A Thing',
      //       });
      //
      //       // Update the item and link the relationship field
      //       const { data, errors } = await networkedGraphqlRequest({
      //         app,
      //         query: `
      //           mutation {
      //             updateEventToGroupNoCreate(
      //               id: "${createEventToGroupNoCreate.id}"
      //               data: {
      //                 title: "A thing",
      //                 group: { connect: { id: "${createGroupNoCreate.id}" } }
      //               }
      //             ) {
      //               id
      //               group {
      //                 id
      //                 name
      //               }
      //             }
      //           }
      //         `,
      //       });
      //
      //       expect(data).toMatchObject({
      //         updateEventToGroupNoCreate: {
      //           id: expect.any(String),
      //           group: {
      //             id: expect.any(String),
      //             name: groupName,
      //           },
      //         },
      //       });
      //       expect(errors).toBe(undefined);
      //
      //       // See that it actually stored the group ID on the Event record
      //       const event = await findOne('EventToGroupNoCreate', { title: 'A thing' });
      //       expect(event).toBeTruthy();
      //       expect(event.group).toBeTruthy();
      //
      //       const group = await findById('GroupNoCreate', event.group);
      //       expect(group).toBeTruthy();
      //       expect(group.name).toBe(groupName);
      //     })
      //   );
      // });
    });
  })
);
