import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import {
  ProviderName,
  multiAdapterRunners,
  setupFromConfig,
  testConfig,
} from '@keystone-next/test-utils-legacy';
import { createItem } from '@keystone-next/server-side-graphql-client-legacy';

function setupKeystone(provider: ProviderName) {
  return setupFromConfig({
    provider,
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

        GroupNoRead: list({
          fields: {
            name: text(),
          },
          access: {
            read: () => false,
          },
        }),

        EventToGroupNoRead: list({
          fields: {
            title: text(),
            group: relationship({ ref: 'GroupNoRead' }),
          },
        }),

        GroupNoReadHard: list({
          fields: { name: text() },
          access: { read: false },
        }),

        EventToGroupNoReadHard: list({
          fields: {
            title: text(),
            group: relationship({ ref: 'GroupNoReadHard' }),
          },
        }),

        GroupNoCreate: list({
          fields: {
            name: text(),
          },
          access: {
            create: () => false,
          },
        }),

        EventToGroupNoCreate: list({
          fields: {
            title: text(),
            group: relationship({ ref: 'GroupNoCreate' }),
          },
        }),

        GroupNoCreateHard: list({
          fields: { name: text() },
          access: { create: false },
        }),

        EventToGroupNoCreateHard: list({
          fields: {
            title: text(),
            group: relationship({ ref: 'GroupNoCreateHard' }),
          },
        }),

        GroupNoUpdate: list({
          fields: { name: text() },
          access: { update: () => false },
        }),

        EventToGroupNoUpdate: list({
          fields: {
            title: text(),
            group: relationship({ ref: 'GroupNoUpdate' }),
          },
        }),

        GroupNoUpdateHard: list({
          fields: { name: text() },
          access: { update: false },
        }),

        EventToGroupNoUpdateHard: list({
          fields: {
            title: text(),
            group: relationship({ ref: 'GroupNoUpdateHard' }),
          },
        }),
      }),
    }),
  });
}
multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe('no access control', () => {
      test(
        'create nested from within create mutation',
        runner(setupKeystone, async ({ context }) => {
          const groupName = sampleOne(gen.alphaNumString.notEmpty());

          // Create an item that does the nested create
          const data = await context.graphql.run({
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
              }`,
          });

          expect(data).toMatchObject({
            createEvent: {
              id: expect.any(String),
              group: { id: expect.any(String), name: groupName },
            },
          });

          const { Group } = await context.graphql.run({
            query: `
              query {
                Group(where: { id: "${data.createEvent.group.id}" }) {
                  id
                  name
                }
              }`,
          });
          expect(Group).toMatchObject({ id: data.createEvent.group.id, name: groupName });
        })
      );

      test(
        'create nested from within update mutation',
        runner(setupKeystone, async ({ context }) => {
          const groupName = sampleOne(gen.alphaNumString.notEmpty());

          // Create an item to update
          const createEvent = await createItem({
            context,
            listKey: 'Event',
            item: { title: 'A thing' },
          });

          // Update an item that does the nested create
          const data = await context.graphql.run({
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
              }`,
          });

          expect(data).toMatchObject({
            updateEvent: {
              id: expect.any(String),
              group: { id: expect.any(String), name: groupName },
            },
          });

          const { Group } = await context.graphql.run({
            query: `
              query {
                Group(where: { id: "${data.updateEvent.group.id}" }) {
                  id
                  name
                }
              }`,
          });
          expect(Group).toMatchObject({ id: data.updateEvent.group.id, name: groupName });
        })
      );
    });

    describe('with access control', () => {
      [
        { name: 'GroupNoRead', allowed: true, func: 'read: () => false' },
        { name: 'GroupNoReadHard', allowed: true, func: 'read: false' },
        { name: 'GroupNoCreate', allowed: false, func: 'create: () => false' },
        { name: 'GroupNoCreateHard', allowed: false, func: 'create: false' },
        { name: 'GroupNoUpdate', allowed: true, func: 'update: () => false' },
        { name: 'GroupNoUpdateHard', allowed: true, func: 'update: false' },
      ].forEach(group => {
        describe(`${group.func} on related list`, () => {
          if (group.allowed) {
            test(
              'does not throw error when creating nested within create mutation',
              runner(setupKeystone, async ({ context }) => {
                const groupName = sampleOne(gen.alphaNumString.notEmpty());

                // Create an item that does the nested create
                const data = await context.exitSudo().graphql.run({
                  query: `
                    mutation {
                      createEventTo${group.name}(data: {
                        title: "A thing",
                        group: { create: { name: "${groupName}" } }
                      }) {
                        id
                      }
                    }`,
                });

                expect(data).toMatchObject({
                  [`createEventTo${group.name}`]: { id: expect.any(String) },
                });

                // See that it actually stored the group ID on the Event record
                const event = await context.lists[`EventTo${group.name}`].findOne({
                  where: { id: data[`createEventTo${group.name}`].id },
                  query: 'id group { id name }',
                });
                expect(event).toBeTruthy();
                expect(event!.group).toBeTruthy();
                expect(event!.group.name).toBe(groupName);
              })
            );

            test(
              'does not throw error when creating nested within update mutation',
              runner(setupKeystone, async ({ context }) => {
                const groupName = sampleOne(gen.alphaNumString.notEmpty());

                // Create an item to update
                const eventModel = await createItem({
                  context,
                  listKey: `EventTo${group.name}`,
                  item: { title: 'A thing' },
                });

                // Update an item that does the nested create
                const data = await context.exitSudo().graphql.run({
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
                    }`,
                });

                expect(data).toMatchObject({
                  [`updateEventTo${group.name}`]: { id: expect.any(String) },
                });

                // See that it actually stored the group ID on the Event record
                const event = await context.lists[`EventTo${group.name}`].findOne({
                  where: { id: data[`updateEventTo${group.name}`].id },
                  query: 'id group { id name }',
                });
                expect(event).toBeTruthy();
                expect(event!.group).toBeTruthy();
                expect(event!.group.name).toBe(groupName);
              })
            );
          } else {
            test(
              'throws error when creating nested within create mutation',
              runner(setupKeystone, async ({ context }) => {
                const alphaNumGenerator = gen.alphaNumString.notEmpty();
                const eventName = sampleOne(alphaNumGenerator);
                const groupName = sampleOne(alphaNumGenerator);

                // Create an item that does the nested create
                const { data, errors } = await context.exitSudo().graphql.raw({
                  query: `
                    mutation {
                      createEventTo${group.name}(data: {
                        title: "${eventName}",
                        group: { create: { name: "${groupName}" } }
                      }) {
                        id
                      }
                    }`,
                });

                if (group.name === 'GroupNoCreateHard') {
                  // For { create: false } the mutation won't even exist, so we expect a different behaviour
                  expect(data).toBe(undefined);
                  expect(errors).toHaveLength(1);
                  expect(errors![0].message).toEqual(
                    `Field "create" is not defined by type "${group.name}RelateToOneInput".`
                  );
                } else {
                  // Assert it throws an access denied error
                  expect(data).not.toBe(null);
                  expect(data![`createEventTo${group.name}`]).toBe(null);
                  expect(errors).toHaveLength(1);
                  const error = errors![0];
                  expect(error.message).toEqual(
                    `Unable to create a EventTo${group.name}.group<${group.name}>`
                  );
                  expect(error.path).toHaveLength(1);
                  expect(error.path![0]).toEqual(`createEventTo${group.name}`);
                }
                // Confirm it didn't insert either of the records anyway
                const data1 = await context.graphql.run({
                  query: `
                    query {
                      all${group.name}s(where: { name: "${groupName}" }) {
                        id
                        name
                      }
                    }`,
                });
                expect(data1[`all${group.name}s`]).toMatchObject([]);

                // Confirm it didn't insert either of the records anyway
                const data2 = await context.graphql.run({
                  query: `
                    query {
                      allEventTo${group.name}s(where: { title: "${eventName}" }) {
                        id
                        title
                      }
                    }`,
                });
                expect(data2[`allEventTo${group.name}s`]).toMatchObject([]);
              })
            );

            test(
              'throws error when creating nested within update mutation',
              runner(setupKeystone, async ({ context }) => {
                const groupName = sampleOne(gen.alphaNumString.notEmpty());

                // Create an item to update
                const eventModel = await createItem({
                  context,
                  listKey: `EventTo${group.name}`,
                  item: { title: 'A thing' },
                });

                // Update an item that does the nested create
                const { data, errors } = await context.exitSudo().graphql.raw({
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
                    }`,
                });

                // Assert it throws an access denied error
                if (group.name === 'GroupNoCreateHard') {
                  // For { create: false } the mutation won't even exist, so we expect a different behaviour
                  expect(data).toBe(undefined);
                  expect(errors).toHaveLength(1);
                  expect(errors![0].message).toEqual(
                    `Field "create" is not defined by type "${group.name}RelateToOneInput".`
                  );
                } else {
                  expect(data).not.toBe(null);
                  expect(data![`updateEventTo${group.name}`]).toBe(null);
                  expect(errors).toHaveLength(1);
                  const error = errors![0];
                  expect(error.message).toEqual(
                    `Unable to create a EventTo${group.name}.group<${group.name}>`
                  );
                  expect(error.path).toHaveLength(1);
                  expect(error.path![0]).toEqual(`updateEventTo${group.name}`);
                }

                // Confirm it didn't insert the record anyway
                const data2 = await context.graphql.run({
                  query: `
                    query {
                      all${group.name}s(where: { name: "${groupName}" }) {
                        id
                        name
                      }
                    }`,
                });
                expect(data2[`all${group.name}s`]).toMatchObject([]);
              })
            );
          }
        });
      });
    });
  })
);
