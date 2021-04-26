import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import {
  ProviderName,
  multiAdapterRunners,
  setupFromConfig,
  testConfig,
} from '@keystone-next/test-utils-legacy';

const alphanumGenerator = gen.alphaNumString.notEmpty();

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
      }),
    }),
  });
}

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe('no access control', () => {
      test(
        'removes matched item from list',
        runner(setupKeystone, async ({ context }) => {
          const groupName = `foo${sampleOne(alphanumGenerator)}`;

          const createGroup = await context.lists.Group.createOne({ data: { name: groupName } });

          // Create an item to update
          const createEvent = await context.lists.Event.createOne({
            data: {
              title: 'A thing',
              group: { connect: { id: createGroup.id } },
            },
            query: 'id group { id }',
          });

          // Avoid false-positives by checking the database directly
          expect(createEvent).toHaveProperty('group');
          expect(createEvent.group.id.toString()).toBe(createGroup.id);

          // Update the item and link the relationship field
          const data = await context.graphql.run({
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
              }`,
          });

          expect(data).toMatchObject({ updateEvent: { id: expect.any(String), group: null } });

          // Avoid false-positives by checking the database directly
          const eventData = await context.lists.Event.findOne({
            where: { id: createEvent.id },
            query: 'id group { id }',
          });

          expect(eventData).toHaveProperty('group', null);
        })
      );

      test(
        'silently succeeds if used during create',
        runner(setupKeystone, async ({ context }) => {
          const FAKE_ID = '5b84f38256d3c2df59a0d9bf';

          // Create an item that does the linking
          const data = await context.graphql.run({
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
              }`,
          });

          expect(data.createEvent).toMatchObject({ id: expect.any(String), group: null });
          expect(data.createEvent).not.toHaveProperty('errors');
        })
      );

      test(
        'silently succeeds if no item to disconnect during update',
        runner(setupKeystone, async ({ context }) => {
          const FAKE_ID = '5b84f38256d3c2df59a0d9bf';

          // Create an item to link against
          const createEvent = await context.lists.Event.createOne({ data: {} });

          // Create an item that does the linking
          const data = await context.graphql.run({
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
              }`,
          });
          expect(data.updateEvent).toMatchObject({ id: expect.any(String), group: null });
          expect(data.updateEvent).not.toHaveProperty('errors');
        })
      );

      test(
        'silently succeeds if item to disconnect does not match during update',
        runner(setupKeystone, async ({ context }) => {
          const groupName = `foo${sampleOne(alphanumGenerator)}`;
          const FAKE_ID = '5b84f38256d3c2df59a0d9bf';

          // Create an item to link against
          const createGroup = await context.lists.Group.createOne({ data: { name: groupName } });
          const createEvent = await context.lists.Event.createOne({
            data: { group: { connect: { id: createGroup.id } } },
          });

          // Create an item that does the linking
          const data = await context.graphql.run({
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
              }`,
          });
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
          runner(setupKeystone, async ({ context }) => {
            const groupName = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createGroup = await context.lists.GroupNoRead.createOne({
              data: { name: groupName },
            });

            // Create an item to update
            const createEvent = await context.lists.EventToGroupNoRead.createOne({
              data: { group: { connect: { id: createGroup.id } } },
              query: 'id group { id }',
            });

            // Avoid false-positives by checking the database directly
            expect(createEvent).toHaveProperty('group');
            expect(createEvent.group.id.toString()).toBe(createGroup.id);

            // Update the item and link the relationship field
            await context.exitSudo().graphql.run({
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
                }`,
            });

            // Avoid false-positives by checking the database directly
            const eventData = await context.lists.EventToGroupNoRead.findOne({
              where: { id: createEvent.id },
              query: 'id group { id }',
            });

            expect(eventData).toHaveProperty('group');
            expect(eventData!.group).toBe(null);
          })
        );
      });
    });
  })
);
