import { ProviderName, testConfig } from '@keystone-next/test-utils-legacy';
import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig } from '@keystone-next/test-utils-legacy';

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
        'link nested from within create mutation',
        runner(setupKeystone, async ({ context }) => {
          const groupName = sampleOne(gen.alphaNumString.notEmpty());

          // Create an item to link against
          const createGroup = await context.lists.Group.createOne({ data: { name: groupName } });

          // Create an item that does the linking
          const event = await context.lists.Event.createOne({
            data: { title: 'A thing', group: { connect: { id: createGroup.id } } },
          });

          expect(event).toMatchObject({ id: expect.any(String) });
        })
      );

      test(
        'link nested from within update mutation',
        runner(setupKeystone, async ({ context }) => {
          const groupName = sampleOne(gen.alphaNumString.notEmpty());

          // Create an item to link against
          const createGroup = await context.lists.Group.createOne({ data: { name: groupName } });

          // Create an item to update
          const event = await context.lists.Event.createOne({ data: { title: 'A thing' } });

          // Update the item and link the relationship field
          const _event = await context.lists.Event.updateOne({
            id: event.id,
            data: { title: 'A thing', group: { connect: { id: createGroup.id } } },
            query: 'id group { id name }',
          });

          expect(_event).toMatchObject({
            id: expect.any(String),
            group: { id: expect.any(String), name: groupName },
          });
        })
      );
    });

    describe('non-matching filter', () => {
      test(
        'errors if connecting an item which cannot be found during creating',
        runner(setupKeystone, async ({ context }) => {
          const FAKE_ID = 100;

          // Create an item that does the linking
          const { errors } = await context.graphql.raw({
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
        runner(setupKeystone, async ({ context }) => {
          const FAKE_ID = 100;

          // Create an item to link against
          const createEvent = await context.lists.Event.createOne({ data: {} });

          // Create an item that does the linking
          const { errors } = await context.graphql.raw({
            query: `
              mutation {
                updateEvent(
                  where: { id: "${createEvent.id}" },
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
              runner(setupKeystone, async ({ context }) => {
                const groupName = sampleOne(gen.alphaNumString.notEmpty());

                // Create an item to link against
                // We can't use the graphQL query here (it's `create: () => false`)
                const { id } = await context.lists[group.name].createOne({
                  data: { name: groupName },
                });
                expect(id).toBeTruthy();

                // Create an item that does the linking
                const data = await context.exitSudo().lists[`EventTo${group.name}`].createOne({
                  data: { title: 'A thing', group: { connect: { id } } },
                  query: 'id group { id }',
                });

                expect(data).toMatchObject({ id: expect.any(String), group: { id } });
              })
            );
            test(
              'does not throw error when linking nested within update mutation',
              runner(setupKeystone, async ({ context }) => {
                const groupName = sampleOne(gen.alphaNumString.notEmpty());

                // Create an item to link against
                const groupModel = await context.lists[group.name].createOne({
                  data: { name: groupName },
                });
                expect(groupModel.id).toBeTruthy();

                // Create an item to update
                const eventModel = await context.lists[`EventTo${group.name}`].createOne({
                  data: { title: 'A Thing' },
                });
                expect(eventModel.id).toBeTruthy();

                // Update the item and link the relationship field
                const data = await context.exitSudo().lists[`EventTo${group.name}`].updateOne({
                  id: eventModel.id,
                  data: { title: 'A thing', group: { connect: { id: groupModel.id } } },
                  query: 'id group { id name }',
                });

                expect(data).toMatchObject({
                  id: expect.any(String),
                  group: { id: expect.any(String), name: groupName },
                });

                // See that it actually stored the group ID on the Event record
                const event = await context.lists[`EventTo${group.name}`].findOne({
                  where: { id: data.id },
                  query: 'id group { id name }',
                });
                expect(event).toBeTruthy();
                expect(event!.group).toBeTruthy();
                expect(event!.group.name).toBe(groupName);
              })
            );
          } else {
            test(
              'throws error when linking nested within update mutation',
              runner(setupKeystone, async ({ context }) => {
                const groupName = sampleOne(gen.alphaNumString.notEmpty());

                // Create an item to link against
                const groupModel = await context.lists[group.name].createOne({
                  data: { name: groupName },
                });
                expect(groupModel.id).toBeTruthy();

                // Create an item to update
                const eventModel = await context.lists[`EventTo${group.name}`].createOne({
                  data: { title: 'A thing' },
                });
                expect(eventModel.id).toBeTruthy();

                // Update the item and link the relationship field
                const { errors } = await context.exitSudo().graphql.raw({
                  query: `
                    mutation {
                      updateEventTo${group.name}(
                        where: { id: "${eventModel.id}" }
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
                const error = errors![0];
                expect(error.message).toEqual(
                  `Unable to connect a EventTo${group.name}.group<${group.name}>`
                );
                expect(error.path).toHaveLength(1);
                expect(error.path![0]).toEqual(`updateEventTo${group.name}`);
              })
            );

            test(
              'throws error when linking nested within create mutation',
              runner(setupKeystone, async ({ context }) => {
                const groupName = sampleOne(gen.alphaNumString.notEmpty());

                // Create an item to link against
                const { id } = await context.lists[group.name].createOne({
                  data: { name: groupName },
                });
                expect(id).toBeTruthy();

                // Create an item that does the linking
                const { errors } = await context.exitSudo().graphql.raw({
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
                const error = errors![0];
                expect(error.message).toEqual(
                  `Unable to connect a EventTo${group.name}.group<${group.name}>`
                );
                expect(error.path).toHaveLength(1);
                expect(error.path![0]).toEqual(`createEventTo${group.name}`);
              })
            );
          }
        });
      });
    });
  })
);
