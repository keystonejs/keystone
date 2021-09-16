import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig, expectGraphQLValidationError, expectRelationshipError } from '../../utils';

const alphanumGenerator = gen.alphaNumString.notEmpty();

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      Note: list({
        fields: {
          content: text(),
        },
      }),
      User: list({
        fields: {
          username: text(),
          notes: relationship({ ref: 'Note', many: true }),
        },
      }),
      NoteNoRead: list({
        fields: {
          content: text(),
        },
        access: {
          operation: { query: () => false },
        },
      }),
      UserToNotesNoRead: list({
        fields: {
          username: text(),
          notes: relationship({ ref: 'NoteNoRead', many: true }),
        },
      }),
      NoteNoCreate: list({
        fields: {
          content: text(),
        },
        access: {
          operation: { create: () => false },
        },
      }),
      UserToNotesNoCreate: list({
        fields: {
          username: text(),
          notes: relationship({ ref: 'NoteNoCreate', many: true }),
        },
      }),
    },
  }),
});

describe('no access control', () => {
  test(
    'set: [] removes all items from list',
    runner(async ({ context }) => {
      const noteContent = `foo${sampleOne(alphanumGenerator)}`;
      const noteContent2 = `foo${sampleOne(alphanumGenerator)}`;

      // Create two items with content that can be matched
      const createNote = await context.lists.Note.createOne({ data: { content: noteContent } });
      const createNote2 = await context.lists.Note.createOne({
        data: { content: noteContent2 },
      });

      // Create an item to update
      const createUser = await context.lists.User.createOne({
        data: {
          username: 'A thing',
          notes: { connect: [{ id: createNote.id }, { id: createNote2.id }] },
        },
      });

      // Update the item and link the relationship field
      const user = await context.lists.User.updateOne({
        where: { id: createUser.id },
        data: { username: 'A thing', notes: { set: [] } },
        query: 'id notes { id content }',
      });

      expect(user).toMatchObject({ id: expect.any(String), notes: [] });
    })
  );

  test(
    'set and connect removes all existing items and adds the items specified in set and connect',
    runner(async ({ context }) => {
      const createNote = await context.lists.Note.createOne({ data: {} });
      const createNote2 = await context.lists.Note.createOne({ data: {} });
      const createNote3 = await context.lists.Note.createOne({ data: {} });

      // Create an item to update
      const createUser = await context.lists.User.createOne({
        data: {
          username: 'A thing',
          notes: { connect: [{ id: createNote.id }] },
        },
      });

      // Update the item and link the relationship field
      const user = await context.lists.User.updateOne({
        where: { id: createUser.id },
        data: {
          username: 'A thing',
          notes: { set: [{ id: createNote2.id }], connect: [{ id: createNote3.id }] },
        },
        query: 'id notes { id }',
      });
      expect(user.id).toEqual(createUser.id);
      expect(user.notes.map((note: any) => note.id).sort()).toEqual(
        [createNote2.id, createNote3.id].sort()
      );
    })
  );

  test(
    'set and disconnect throws an error',
    runner(async ({ context }) => {
      const createNote = await context.lists.Note.createOne({ data: {} });

      // Create an item to update
      const createUser = await context.lists.User.createOne({
        data: {
          username: 'A thing',
          notes: { connect: [{ id: createNote.id }] },
        },
      });

      // Update the item and link the relationship field
      const { data, errors } = await context.graphql.raw({
        query: `
          mutation ($id: ID!) {
            updateUser(
              where: { id: $id }
              data: { notes: { disconnect: [{ id: "c5b84f38256d3c2df59a0d9bf" }], set: [] } }
            ) {
              id
            }
          }
        `,
        variables: { id: createUser.id },
      });
      expect(data).toEqual({ updateUser: null });
      expectRelationshipError(errors, [
        {
          path: ['updateUser'],
          message:
            'Input error: The set and disconnect fields cannot both be provided to to-many relationship inputs but both were provided at User.notes<Note>',
        },
      ]);
    })
  );

  test(
    'causes a validation error if used during create',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
        query: `
          mutation {
            createUser(data: { notes: { set: [] } }) {
              id
            }
          }
        `,
      }).expect(400);
      expectGraphQLValidationError(body.errors, [
        {
          message: `Field "set" is not defined by type "NoteRelateToManyForCreateInput".`,
        },
      ]);
    })
  );
});

describe('with access control', () => {
  describe('read: false on related list', () => {
    test(
      'has no effect when specifying set: []',
      runner(async ({ context }) => {
        const noteContent = sampleOne(alphanumGenerator);

        // Create an item to link against
        const createNote = await context.sudo().lists.NoteNoRead.createOne({
          data: { content: noteContent },
        });

        // Create an item to update
        const createUser = await context.sudo().lists.UserToNotesNoRead.createOne({
          data: {
            username: 'A thing',
            notes: { connect: [{ id: createNote.id }] },
          },
        });

        // Update the item and link the relationship field
        await context.lists.UserToNotesNoRead.updateOne({
          where: { id: createUser.id },
          data: { username: 'A thing', notes: { set: [] } },
        });

        const data = await context.sudo().lists.UserToNotesNoRead.findOne({
          where: { id: createUser.id },
          query: 'id notes { id }',
        });
        expect(data.notes).toHaveLength(0);
      })
    );
  });
});
