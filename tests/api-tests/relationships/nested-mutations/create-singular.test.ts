import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { setupTestRunner } from '@keystone-next/testing';
import { apiTestConfig, expectGraphQLValidationError, expectRelationshipError } from '../../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
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
        access: { read: () => false },
      }),

      EventToGroupNoRead: list({
        fields: {
          title: text(),
          group: relationship({ ref: 'GroupNoRead' }),
        },
      }),

      GroupNoReadHard: list({
        fields: {
          name: text(),
        },
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
        access: { create: () => false },
      }),

      EventToGroupNoCreate: list({
        fields: {
          title: text(),
          group: relationship({ ref: 'GroupNoCreate' }),
        },
      }),

      GroupNoCreateHard: list({
        fields: {
          name: text(),
        },
        access: { create: false },
      }),

      EventToGroupNoCreateHard: list({
        fields: {
          title: text(),
          group: relationship({ ref: 'GroupNoCreateHard' }),
        },
      }),

      GroupNoUpdate: list({
        fields: {
          name: text(),
        },
        access: { update: () => false },
      }),

      EventToGroupNoUpdate: list({
        fields: {
          title: text(),
          group: relationship({ ref: 'GroupNoUpdate' }),
        },
      }),

      GroupNoUpdateHard: list({
        fields: {
          name: text(),
        },
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

describe('no access control', () => {
  test(
    'create nested from within create mutation',
    runner(async ({ context }) => {
      const groupName = sampleOne(gen.alphaNumString.notEmpty());

      // Create an item that does the nested create
      const event = await context.lists.Event.createOne({
        data: { title: 'A thing', group: { create: { name: groupName } } },
        query: 'id group { id name }',
      });

      expect(event).toMatchObject({
        id: expect.any(String),
        group: { id: expect.any(String), name: groupName },
      });

      const group = await context.lists.Group.findOne({
        where: { id: event.group.id },
        query: 'id name',
      });
      expect(group).toMatchObject({ id: event.group.id, name: groupName });
    })
  );

  test(
    'create nested from within update mutation',
    runner(async ({ context }) => {
      const groupName = sampleOne(gen.alphaNumString.notEmpty());

      // Create an item to update
      const createEvent = await context.lists.Event.createOne({ data: { title: 'A thing' } });

      // Update an item that does the nested create
      const event = await context.lists.Event.updateOne({
        id: createEvent.id,
        data: { title: 'A thing', group: { create: { name: groupName } } },
        query: 'id group { id name }',
      });

      expect(event).toMatchObject({
        id: expect.any(String),
        group: { id: expect.any(String), name: groupName },
      });

      const group = await context.lists.Group.findOne({
        where: { id: event.group.id },
        query: 'id name',
      });
      expect(group).toMatchObject({ id: event.group.id, name: groupName });
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
          runner(async ({ context }) => {
            const groupName = sampleOne(gen.alphaNumString.notEmpty());

            // Create an item that does the nested create{
            const data = await context.lists[`EventTo${group.name}`].createOne({
              data: { title: 'A thing', group: { create: { name: groupName } } },
            });

            expect(data).toMatchObject({ id: expect.any(String) });

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

        test(
          'does not throw error when creating nested within update mutation',
          runner(async ({ context }) => {
            const groupName = sampleOne(gen.alphaNumString.notEmpty());

            // Create an item to update
            const eventModel = await context.lists[`EventTo${group.name}`].createOne({
              data: { title: 'A thing' },
            });

            // Update an item that does the nested create
            const data = await context.lists[`EventTo${group.name}`].updateOne({
              id: eventModel.id,
              data: { title: 'A thing', group: { create: { name: groupName } } },
            });

            expect(data).toMatchObject({ id: expect.any(String) });

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
          'throws error when creating nested within create mutation',
          runner(async ({ context, graphQLRequest }) => {
            const alphaNumGenerator = gen.alphaNumString.notEmpty();
            const eventName = sampleOne(alphaNumGenerator);
            const groupName = sampleOne(alphaNumGenerator);

            // Create an item that does the nested create
            const query = `
              mutation {
                createEventTo${group.name}(data: {
                  title: "${eventName}",
                  group: { create: { name: "${groupName}" } }
                }) {
                  id
                }
              }`;

            if (group.name === 'GroupNoCreateHard') {
              const { body } = await graphQLRequest({ query });

              // For { create: false } the mutation won't even exist, so we expect a different behaviour
              expectGraphQLValidationError(body.errors, [
                {
                  message: `Field "create" is not defined by type "${group.name}RelateToOneInput".`,
                },
              ]);
            } else {
              const { data, errors } = await context.graphql.raw({ query });

              // Assert it throws an access denied error
              expect(data).toEqual({ [`createEventTo${group.name}`]: null });
              expectRelationshipError(errors, [
                {
                  path: [`createEventTo${group.name}`],
                  message: `Unable to create a EventTo${group.name}.group<${group.name}>`,
                },
              ]);
            }
            // Confirm it didn't insert either of the records anyway
            const data1 = await context.lists[group.name].findMany({
              where: { name: groupName },
              query: 'id name',
            });
            expect(data1).toMatchObject([]);

            // Confirm it didn't insert either of the records anyway
            const data2 = await context.lists[`EventTo${group.name}`].findMany({
              where: { title: eventName },
              query: 'id title',
            });
            expect(data2).toMatchObject([]);
          })
        );

        test(
          'throws error when creating nested within update mutation',
          runner(async ({ context, graphQLRequest }) => {
            const groupName = sampleOne(gen.alphaNumString.notEmpty());

            // Create an item to update
            const eventModel = await context.lists[`EventTo${group.name}`].createOne({
              data: { title: 'A thing' },
            });

            // Update an item that does the nested create
            const query = `
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
              }`;

            // Assert it throws an access denied error
            if (group.name === 'GroupNoCreateHard') {
              const { body } = await graphQLRequest({ query });
              // For { create: false } the mutation won't even exist, so we expect a different behaviour

              expectGraphQLValidationError(body.errors, [
                {
                  message: `Field "create" is not defined by type "${group.name}RelateToOneInput".`,
                },
              ]);
            } else {
              const { data, errors } = await context.graphql.raw({ query });
              expect(data).toEqual({ [`updateEventTo${group.name}`]: null });
              expectRelationshipError(errors, [
                {
                  path: [`updateEventTo${group.name}`],
                  message: `Unable to create a EventTo${group.name}.group<${group.name}>`,
                },
              ]);
            }

            // Confirm it didn't insert the record anyway
            const groups = await context.lists[group.name].findMany({
              where: { name: groupName },
              query: 'id name',
            });
            expect(groups).toMatchObject([]);
          })
        );
      }
    });
  });
});
