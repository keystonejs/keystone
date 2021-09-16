import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig, expectRelationshipError } from '../../utils';

const alphanumGenerator = gen.alphaNumString.notEmpty();

type IdType = any;

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
    'link AND create nested from within create mutation',
    runner(async ({ context }) => {
      const noteContent = sampleOne(alphanumGenerator);
      const noteContent2 = sampleOne(alphanumGenerator);

      // Create an item to link against
      const createNote = await context.lists.Note.createOne({ data: { content: noteContent } });

      // Create an item that does the linking
      type T = { id: IdType; notes: { id: IdType; content: string }[] };
      const user = (await context.lists.User.createOne({
        data: {
          username: 'A thing',
          notes: { connect: [{ id: createNote.id }], create: [{ content: noteContent2 }] },
        },
        query: 'id notes { id content }',
      })) as T;

      expect(user).toMatchObject({
        id: expect.any(String),
        notes: [
          { id: expect.any(String), content: noteContent },
          { id: expect.any(String), content: noteContent2 },
        ],
      });

      // Sanity check that the items are actually created
      const allNotes = await context.lists.Note.findMany({
        where: { id: { in: user.notes.map(({ id }) => id) } },
        query: 'id content',
      });

      expect(allNotes).toHaveLength(user.notes.length);
    })
  );

  test(
    'link & create nested from within update mutation',
    runner(async ({ context }) => {
      const noteContent = sampleOne(alphanumGenerator);
      const noteContent2 = sampleOne(alphanumGenerator);

      // Create an item to link against
      const createNote = await context.lists.Note.createOne({ data: { content: noteContent } });

      // Create an item to update
      const createUser = await context.lists.User.createOne({ data: { username: 'A thing' } });

      // Update the item and link the relationship field
      type T = { id: IdType; notes: { id: IdType; content: string }[] };
      const user = (await context.lists.User.updateOne({
        where: { id: createUser.id },
        data: {
          username: 'A thing',
          notes: { connect: [{ id: createNote.id }], create: [{ content: noteContent2 }] },
        },
        query: 'id notes { id content }',
      })) as T;

      expect(user).toMatchObject({
        id: expect.any(String),
        notes: [
          { id: createNote.id, content: noteContent },
          { id: expect.any(String), content: noteContent2 },
        ],
      });

      // Sanity check that the items are actually created
      const allNotes = await context.lists.Note.findMany({
        where: { id: { in: user.notes.map(({ id }) => id) } },
        query: 'id content',
      });

      expect(allNotes).toHaveLength(user.notes.length);
    })
  );
});

describe('errors on incomplete data', () => {
  test(
    'when neither id or create data passed',
    runner(async ({ context }) => {
      // Create an item that does the linking
      const { data, errors } = await context.graphql.raw({
        query: `
              mutation {
                createUser(data: { notes: {} }) {
                  id
                }
              }`,
      });

      expect(data).toEqual({ createUser: null });
      expectRelationshipError(errors, [
        {
          path: ['createUser'],
          message:
            'Input error: You must provide at least one field in to-many relationship inputs but none were provided at User.notes<Note>',
        },
      ]);
    })
  );
});

describe('with access control', () => {
  describe('read: false on related list', () => {
    test(
      'throws when link AND create nested from within create mutation',
      runner(async ({ context }) => {
        const noteContent = sampleOne(alphanumGenerator);
        const noteContent2 = sampleOne(alphanumGenerator);

        // Create an item to link against
        const createNoteNoRead = await context.sudo().lists.NoteNoRead.createOne({
          data: { content: noteContent },
        });

        // Create an item that does the linking
        const { data, errors } = await context.graphql.raw({
          query: `
                mutation {
                  createUserToNotesNoRead(data: {
                    username: "A thing",
                    notes: {
                      connect: [{ id: "${createNoteNoRead.id}" }],
                      create: [{ content: "${noteContent2}" }]
                    }
                  }) {
                    id
                  }
                }`,
        });

        expect(data).toEqual({ createUserToNotesNoRead: null });
        expectRelationshipError(errors, [
          {
            path: ['createUserToNotesNoRead'],
            message: 'Unable to create and/or connect 1 UserToNotesNoRead.notes<NoteNoRead>',
          },
        ]);
      })
    );

    test(
      'throws when link & create nested from within update mutation',
      runner(async ({ context }) => {
        const noteContent = sampleOne(alphanumGenerator);
        const noteContent2 = sampleOne(alphanumGenerator);

        // Create an item to link against
        const createNote = await context.sudo().lists.NoteNoRead.createOne({
          data: { content: noteContent },
        });

        // Create an item to update
        const createUser = await context.lists.UserToNotesNoRead.createOne({
          data: { username: 'A thing' },
        });

        // Update the item and link the relationship field
        const { data, errors } = await context.graphql.raw({
          query: `
                mutation {
                  updateUserToNotesNoRead(
                    where: { id: "${createUser.id}" }
                    data: {
                      username: "A thing",
                      notes: {
                        connect: [{ id: "${createNote.id}" }],
                        create: [{ content: "${noteContent2}" }]
                      }
                    }
                  ) {
                    id
                  }
                }`,
        });

        expect(data).toEqual({ updateUserToNotesNoRead: null });
        expectRelationshipError(errors, [
          {
            path: ['updateUserToNotesNoRead'],
            message:
              'Unable to create, connect, disconnect and/or set 1 UserToNotesNoRead.notes<NoteNoRead>',
          },
        ]);
      })
    );
  });
});
