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
    'removes matched items from list',
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
        data: { username: 'A thing', notes: { disconnect: [{ id: createNote2.id }] } },
        query: 'id notes { id content }',
      });

      expect(user).toMatchObject({
        id: expect.any(String),
        notes: [{ id: createNote.id, content: noteContent }],
      });
    })
  );

  test(
    'causes a validation error if used during create',
    runner(async ({ graphQLRequest }) => {
      const { body } = await graphQLRequest({
        query: `
          mutation {
            createUser(data: { notes: { disconnect: [{ id: "c5b84f38256d3c2df59a0d9bf" }] } }) {
              id
            }
          }
        `,
      }).expect(400);
      expectGraphQLValidationError(body.errors, [
        {
          message: `Field "disconnect" is not defined by type "NoteRelateToManyForCreateInput". Did you mean \"connect\"?`,
        },
      ]);
    })
  );
});

describe('non-matching filter', () => {
  test(
    'errors if items to disconnect cannot be found during update',
    runner(async ({ context }) => {
      // Create an item to link against
      const createUser = await context.lists.User.createOne({ data: {} });

      // Create an item that does the linking
      const { data, errors } = await context.graphql.raw({
        query: `
          mutation ($id: ID!) {
            updateUser(
              where: { id: $id }
              data: { notes: { disconnect: [{ id: "c5b84f38256d3c2df59a0d9bf" }] } }
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
          message: 'Unable to create, connect, disconnect and/or set 1 User.notes<Note>',
        },
      ]);
    })
  );
});

describe('with access control', () => {
  describe('read: false on related list', () => {
    test(
      'throws when disconnecting directly with an id',
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
        {
          const { data, errors } = await context.graphql.raw({
            query: `
            mutation ($id: ID!, $idToDisconnect: ID!) {
              updateUserToNotesNoRead(
                where: { id: $id }
                data: { notes: { disconnect: [{ id: $idToDisconnect }] } }
              ) {
                id
              }
            }
          `,
            variables: { id: createUser.id, idToDisconnect: createNote.id },
          });
          expect(data).toEqual({ updateUserToNotesNoRead: null });
          expectRelationshipError(errors, [
            {
              path: ['updateUserToNotesNoRead'],
              message:
                'Unable to create, connect, disconnect and/or set 1 UserToNotesNoRead.notes<NoteNoRead>',
            },
          ]);
        }

        const data = await context.sudo().lists.UserToNotesNoRead.findOne({
          where: { id: createUser.id },
          query: 'id notes { id }',
        });

        expect(data.notes).toHaveLength(1);
      })
    );
  });
});
