import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig, expectRelationshipError } from '../../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
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
          operation: { query: () => false },
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
        graphql: { omit: ['query'] },
      }),
      EventToGroupNoReadHard: list({
        fields: {
          title: text(),
          group: relationship({ ref: 'GroupNoReadHard' }),
        },
      }),
      GroupNoCreate: list({
        fields: {
          name: text({ isFilterable: true }),
        },
        access: {
          operation: { create: () => false },
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
        graphql: { omit: ['create'] },
      }),
      EventToGroupNoCreateHard: list({
        fields: {
          title: text(),
          group: relationship({ ref: 'GroupNoCreateHard' }),
        },
      }),
      GroupNoUpdate: list({
        fields: { name: text() },
        access: { operation: { update: () => false } },
      }),
      EventToGroupNoUpdate: list({
        fields: {
          title: text(),
          group: relationship({ ref: 'GroupNoUpdate' }),
        },
      }),
      GroupNoUpdateHard: list({
        fields: { name: text() },
        graphql: { omit: ['update'] },
      }),
      EventToGroupNoUpdateHard: list({
        fields: {
          title: text(),
          group: relationship({ ref: 'GroupNoUpdateHard' }),
        },
      }),
    },
  }),
});

describe('no access control', () => {
  test(
    'link nested from within create mutation',
    runner(async ({ context }) => {
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
    runner(async ({ context }) => {
      const groupName = sampleOne(gen.alphaNumString.notEmpty());

      // Create an item to link against
      const createGroup = await context.lists.Group.createOne({ data: { name: groupName } });

      // Create an item to update
      const event = await context.lists.Event.createOne({ data: { title: 'A thing' } });

      // Update the item and link the relationship field
      const _event = await context.lists.Event.updateOne({
        where: { id: event.id },
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
    runner(async ({ context }) => {
      const FAKE_ID = 'cabc123';

      // Create an item that does the linking
      const { data, errors } = await context.graphql.raw({
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

      expect(data).toEqual({ createEvent: null });
      expectRelationshipError(errors, [
        { path: ['createEvent'], message: 'Unable to connect a Event.group<Group>' },
      ]);
    })
  );

  test(
    'errors if connecting an item which cannot be found during update',
    runner(async ({ context }) => {
      const FAKE_ID = 'cabc123';

      // Create an item to link against
      const createEvent = await context.lists.Event.createOne({ data: {} });

      // Create an item that does the linking
      const { data, errors } = await context.graphql.raw({
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
      expect(data).toEqual({ updateEvent: null });
      expectRelationshipError(errors, [
        { path: ['updateEvent'], message: 'Unable to connect a Event.group<Group>' },
      ]);
    })
  );

  test(
    'errors on incomplete data',
    runner(async ({ context }) => {
      // Create an item to link against
      const createEvent = await context.lists.Event.createOne({ data: {} });

      // Create an item that does the linking
      const { data, errors } = await context.graphql.raw({
        query: `
              mutation {
                updateEvent(
                  where: { id: "${createEvent.id}" },
                  data: { group: {} }
                ) {
                  id
                }
              }`,
      });
      expect(data).toEqual({ updateEvent: null });
      expectRelationshipError(errors, [
        {
          path: ['updateEvent'],
          message: `Input error: Nested to-one mutations must provide exactly one field if they're provided but Event.group<Group> did not`,
        },
      ]);
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
          runner(async ({ context }) => {
            const groupName = sampleOne(gen.alphaNumString.notEmpty());

            // Create an item to link against
            // We can't use the graphQL query here (it's `create: () => false`)
            const { id } = await context.sudo().lists[group.name].createOne({
              data: { name: groupName },
            });
            expect(id).toBeTruthy();

            // Create an item that does the linking
            const data = await context.lists[`EventTo${group.name}`].createOne({
              data: { title: 'A thing', group: { connect: { id } } },
              query: 'id group { id }',
            });

            expect(data).toMatchObject({ id: expect.any(String), group: { id } });
          })
        );
        test(
          'does not throw error when linking nested within update mutation',
          runner(async ({ context }) => {
            const groupName = sampleOne(gen.alphaNumString.notEmpty());

            // Create an item to link against
            const groupModel = await context.sudo().lists[group.name].createOne({
              data: { name: groupName },
            });
            expect(groupModel.id).toBeTruthy();

            // Create an item to update
            const eventModel = await context.sudo().lists[`EventTo${group.name}`].createOne({
              data: { title: 'A Thing' },
            });
            expect(eventModel.id).toBeTruthy();

            // Update the item and link the relationship field
            const data = await context.lists[`EventTo${group.name}`].updateOne({
              where: { id: eventModel.id },
              data: { title: 'A thing', group: { connect: { id: groupModel.id } } },
              query: 'id group { id name }',
            });

            expect(data).toMatchObject({
              id: expect.any(String),
              group: { id: expect.any(String), name: groupName },
            });

            // See that it actually stored the group ID on the Event record
            const event = await context.sudo().lists[`EventTo${group.name}`].findOne({
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
          runner(async ({ context }) => {
            const groupName = sampleOne(gen.alphaNumString.notEmpty());

            // Create an item to link against
            const groupModel = await context.sudo().lists[group.name].createOne({
              data: { name: groupName },
            });
            expect(groupModel.id).toBeTruthy();

            // Create an item to update
            const eventModel = await context.lists[`EventTo${group.name}`].createOne({
              data: { title: 'A thing' },
            });
            expect(eventModel.id).toBeTruthy();

            // Update the item and link the relationship field
            const { data, errors } = await context.graphql.raw({
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
            expect(data).toEqual({ [`updateEventTo${group.name}`]: null });
            expectRelationshipError(errors, [
              {
                path: [`updateEventTo${group.name}`],
                message: `Unable to connect a EventTo${group.name}.group<${group.name}>`,
              },
            ]);
          })
        );

        test(
          'throws error when linking nested within create mutation',
          runner(async ({ context }) => {
            const groupName = sampleOne(gen.alphaNumString.notEmpty());

            // Create an item to link against
            const { id } = await context.sudo().lists[group.name].createOne({
              data: { name: groupName },
            });
            expect(id).toBeTruthy();

            // Create an item that does the linking
            const { data, errors } = await context.graphql.raw({
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

            expect(data).toEqual({ [`createEventTo${group.name}`]: null });
            expectRelationshipError(errors, [
              {
                path: [`createEventTo${group.name}`],
                message: `Unable to connect a EventTo${group.name}.group<${group.name}>`,
              },
            ]);
          })
        );
      }
    });
  });
});
