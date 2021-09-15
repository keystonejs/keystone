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
    },
  }),
});

describe('errors on incomplete data', () => {
  test(
    'when neither id or create data passed',
    runner(async ({ context }) => {
      // Create an item that does the linking
      const { data, errors } = await context.graphql.raw({
        query: `
              mutation {
                createEvent(data: { group: {} }) {
                  id
                }
              }`,
      });

      expect(data).toEqual({ createEvent: null });
      expectRelationshipError(errors, [
        {
          path: ['createEvent'],
          message:
            "Input error: Nested to-one mutations must provide exactly one field if they're provided but Event.group<Group> did not",
        },
      ]);
    })
  );

  test(
    'when both id and create data passed',
    runner(async ({ context }) => {
      // Create an item that does the linking
      const { data, errors } = await context.graphql.raw({
        query: `
              mutation {
                createEvent(data: { group: {
                  connect: { id: "cabc123"},
                  create: { name: "foo" }
                } }) {
                  id
                }
              }`,
      });

      expect(data).toEqual({ createEvent: null });
      expectRelationshipError(errors, [
        {
          path: ['createEvent'],
          message:
            "Input error: Nested to-one mutations must provide exactly one field if they're provided but Event.group<Group> did not",
        },
      ]);
    })
  );
});
