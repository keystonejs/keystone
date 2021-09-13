import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig, expectGraphQLValidationError } from '../../utils';

const alphanumGenerator = gen.alphaNumString.notEmpty();

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
    },
  }),
});

describe('no access control', () => {
  test(
    'removes item from list',
    runner(async ({ context }) => {
      const groupName = `foo${sampleOne(alphanumGenerator)}`;

      const createGroup = await context.lists.Group.createOne({ data: { name: groupName } });

      // Create an item to update
      const createEvent = await context.lists.Event.createOne({
        data: { title: 'A thing', group: { connect: { id: createGroup.id } } },
        query: 'id group { id }',
      });

      // Avoid false-positives by checking the database directly
      expect(createEvent).toHaveProperty('group');
      expect(createEvent.group.id.toString()).toBe(createGroup.id);

      // Update the item and link the relationship field
      const event = await context.lists.Event.updateOne({
        where: { id: createEvent.id },
        data: { group: { disconnect: true } },
        query: 'id group { id }',
      });

      expect(event).toMatchObject({ id: expect.any(String), group: null });

      // Avoid false-positives by checking the database directly
      const eventData = await context.lists.Event.findOne({
        where: { id: createEvent.id },
        query: 'id group { id }',
      });

      expect(eventData).toHaveProperty('group', null);
    })
  );

  test(
    'causes a validation error if used during create',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
        query: `
          mutation {
            createEvent(data: { group: { disconnect: true } }) {
              id
              group {
                id
              }
            }
          }
        `,
      }).expect(400);
      expectGraphQLValidationError(body.errors, [
        {
          message: `Field "disconnect" is not defined by type "GroupRelateToOneForCreateInput". Did you mean \"connect\"?`,
        },
      ]);
    })
  );

  test(
    'silently succeeds if no item to disconnect during update',
    runner(async ({ context }) => {
      // Create an item to link against
      const createEvent = await context.lists.Event.createOne({ data: {} });

      // Create an item that does the linking
      const event = await context.lists.Event.updateOne({
        where: { id: createEvent.id },
        data: { group: { disconnect: true } },
        query: 'id group { id }',
      });

      expect(event).toMatchObject({ id: expect.any(String), group: null });
    })
  );
});

describe('with access control', () => {
  describe('read: false on related list', () => {
    test(
      'has no effect when using disconnect: true',
      runner(async ({ context }) => {
        const groupName = sampleOne(alphanumGenerator);

        // Create an item to link against
        const createGroup = await context.sudo().lists.GroupNoRead.createOne({
          data: { name: groupName },
        });

        // Create an item to update
        const createEvent = await context.sudo().lists.EventToGroupNoRead.createOne({
          data: { group: { connect: { id: createGroup.id } } },
          query: 'id group { id }',
        });

        // Avoid false-positives by checking the database directly
        expect(createEvent).toHaveProperty('group');
        expect(createEvent.group.id.toString()).toBe(createGroup.id);

        // Update the item and link the relationship field
        await context.lists.EventToGroupNoRead.updateOne({
          where: { id: createEvent.id },
          data: { group: { disconnect: true } },
        });

        // Avoid false-positives by checking the database directly
        const eventData = await context.sudo().lists.EventToGroupNoRead.findOne({
          where: { id: createEvent.id },
          query: 'id group { id }',
        });

        expect(eventData).toHaveProperty('group');
        expect(eventData!.group).toBe(null);
      })
    );
  });
});
