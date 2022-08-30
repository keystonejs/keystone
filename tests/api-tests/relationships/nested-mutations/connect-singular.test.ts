import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-6/core/fields';
import { list } from '@keystone-6/core';
import { setupTestRunner } from '@keystone-6/core/testing';
import { apiTestConfig, expectSingleRelationshipError } from '../../utils';

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
          name: text(),
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
      const createGroup = await context.query.Group.createOne({ data: { name: groupName } });

      // Create an item that does the linking
      const event = await context.query.Event.createOne({
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
      const createGroup = await context.query.Group.createOne({ data: { name: groupName } });

      // Create an item to update
      const event = await context.query.Event.createOne({ data: { title: 'A thing' } });

      // Update the item and link the relationship field
      const _event = await context.query.Event.updateOne({
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
      const message = `Access denied: You cannot perform the 'connect' operation on the item '{"id":"${FAKE_ID}"}'. It may not exist.`;
      expectSingleRelationshipError(errors, 'createEvent', 'Event.group', message);
    })
  );

  test(
    'errors if connecting an item which cannot be found during update',
    runner(async ({ context }) => {
      const FAKE_ID = 'cabc123';

      // Create an item to link against
      const createEvent = await context.query.Event.createOne({ data: {} });

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
      const message = `Access denied: You cannot perform the 'connect' operation on the item '{"id":"${FAKE_ID}"}'. It may not exist.`;
      expectSingleRelationshipError(errors, 'updateEvent', 'Event.group', message);
    })
  );

  test(
    'errors on incomplete data',
    runner(async ({ context }) => {
      // Create an item to link against
      const createEvent = await context.query.Event.createOne({ data: {} });

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
      const message =
        'Input error: You must provide one of "connect", "create" or "disconnect" in to-one relationship inputs for "update" operations.';
      expectSingleRelationshipError(errors, 'updateEvent', 'Event.group', message);
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
            const { id } = await context.sudo().query[group.name].createOne({
              data: { name: groupName },
            });
            expect(id).toBeTruthy();

            // Create an item that does the linking
            const data = await context.query[`EventTo${group.name}`].createOne({
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
            const groupModel = await context.sudo().query[group.name].createOne({
              data: { name: groupName },
            });
            expect(groupModel.id).toBeTruthy();

            // Create an item to update
            const eventModel = await context.sudo().query[`EventTo${group.name}`].createOne({
              data: { title: 'A Thing' },
            });
            expect(eventModel.id).toBeTruthy();

            // Update the item and link the relationship field
            const data = await context.query[`EventTo${group.name}`].updateOne({
              where: { id: eventModel.id },
              data: { title: 'A thing', group: { connect: { id: groupModel.id } } },
              query: 'id group { id name }',
            });

            expect(data).toMatchObject({
              id: expect.any(String),
              group: { id: expect.any(String), name: groupName },
            });

            // See that it actually stored the group ID on the Event record
            const event = await context.sudo().query[`EventTo${group.name}`].findOne({
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
            const groupModel = await context.sudo().query[group.name].createOne({
              data: { name: groupName },
            });
            expect(groupModel.id).toBeTruthy();

            // Create an item to update
            const eventModel = await context.query[`EventTo${group.name}`].createOne({
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
            const message = `Access denied: You cannot perform the 'connect' operation on the item '{"id":"${groupModel.id}"}'. It may not exist.`;
            expectSingleRelationshipError(
              errors,
              `updateEventTo${group.name}`,
              `EventTo${group.name}.group`,
              message
            );
          })
        );

        test(
          'throws error when linking nested within create mutation',
          runner(async ({ context }) => {
            const groupName = sampleOne(gen.alphaNumString.notEmpty());

            // Create an item to link against
            const { id } = await context.sudo().query[group.name].createOne({
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
            const message = `Access denied: You cannot perform the 'connect' operation on the item '{"id":"${id}"}'. It may not exist.`;
            expectSingleRelationshipError(
              errors,
              `createEventTo${group.name}`,
              `EventTo${group.name}.group`,
              message
            );
          })
        );
      }
    });
  });
});
