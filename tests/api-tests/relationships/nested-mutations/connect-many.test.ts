import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-6/core/fields';
import { list } from '@keystone-6/core';
import { setupTestRunner } from '@keystone-6/core/testing';
import { apiTestConfig, expectSingleRelationshipError } from '../../utils';

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
    'connect nested from within create mutation',
    runner(async ({ context }) => {
      const noteContent = sampleOne(alphanumGenerator);

      // Create an item to link against
      const createNote = await context.query.Note.createOne({ data: { content: noteContent } });

      // Create an item that does the linking
      const user = await context.query.User.createOne({
        data: { username: 'A thing', notes: { connect: [{ id: createNote.id }] } },
        query: 'id notes { id }',
      });

      expect(user).toMatchObject({ id: expect.any(String), notes: expect.any(Array) });

      // Create an item that does the linking
      const user1 = await context.query.User.createOne({
        data: {
          username: 'A thing',
          notes: { connect: [{ id: createNote.id }, { id: createNote.id }] },
        },
        query: 'id notes { id }',
      });

      expect(user1).toMatchObject({ id: expect.any(String), notes: expect.any(Array) });

      // Test an empty list of related notes
      const user2 = await context.query.User.createOne({
        data: { username: 'A thing', notes: { connect: [] } },
        query: 'id notes { id }',
      });

      expect(user2).toMatchObject({ id: expect.any(String), notes: [] });
    })
  );

  test(
    'connect nested from within create many mutation',
    runner(async ({ context }) => {
      const noteContent = sampleOne(alphanumGenerator);
      const noteContent2 = sampleOne(alphanumGenerator);

      // Create an item to link against
      const createNote = await context.query.Note.createOne({ data: { content: noteContent } });
      const createNote2 = await context.query.Note.createOne({
        data: { content: noteContent2 },
      });

      // Create an item that does the linking
      const users = await context.query.User.createMany({
        data: [
          { username: 'A thing 1', notes: { connect: [{ id: createNote.id }] } },
          { username: 'A thing 2', notes: { connect: [{ id: createNote2.id }] } },
        ],
      });

      expect(users).toMatchObject([{ id: expect.any(String) }, { id: expect.any(String) }]);
    })
  );

  test(
    'connect nested from within update mutation adds to an empty list',
    runner(async ({ context }) => {
      const noteContent = sampleOne(alphanumGenerator);
      const noteContent2 = sampleOne(alphanumGenerator);

      // Create an item to link against
      const createNote = await context.query.Note.createOne({ data: { content: noteContent } });
      const createNote2 = await context.query.Note.createOne({
        data: { content: noteContent2 },
      });

      // Create an item to update
      const createUser = await context.query.User.createOne({ data: { username: 'A thing' } });

      // Update the item and link the relationship field
      const user = await context.query.User.updateOne({
        where: { id: createUser.id },
        data: { username: 'A thing', notes: { connect: [{ id: createNote.id }] } },
        query: 'id notes { id content }',
      });

      expect(user).toMatchObject({
        id: expect.any(String),
        notes: [{ id: expect.any(String), content: noteContent }],
      });

      // Update the item and link multiple relationship fields
      const _user = await context.query.User.updateOne({
        where: { id: createUser.id },
        data: {
          username: 'A thing',
          notes: { connect: [{ id: createNote.id }, { id: createNote2.id }] },
        },
        query: 'id notes { id content }',
      });
      expect(_user).toMatchObject({
        id: expect.any(String),
        notes: [
          { id: createNote.id, content: noteContent },
          { id: createNote2.id, content: noteContent2 },
        ],
      });
    })
  );

  test(
    'connect nested from within update mutation adds to an existing list',
    runner(async ({ context }) => {
      const noteContent = sampleOne(alphanumGenerator);
      const noteContent2 = sampleOne(alphanumGenerator);

      // Create an item to link against
      const createNote = await context.query.Note.createOne({ data: { content: noteContent } });
      const createNote2 = await context.query.Note.createOne({
        data: { content: noteContent2 },
      });

      // Create an item to update
      const createUser = await context.query.User.createOne({
        data: { username: 'A thing', notes: { connect: [{ id: createNote.id }] } },
      });

      // Update the item and link the relationship field
      const user = await context.query.User.updateOne({
        where: { id: createUser.id },
        data: { username: 'A thing', notes: { connect: [{ id: createNote2.id }] } },
        query: 'id notes { id content }',
      });

      expect(user).toMatchObject({
        id: expect.any(String),
        notes: [
          { id: createNote.id, content: noteContent },
          { id: createNote2.id, content: noteContent2 },
        ],
      });
    })
  );

  test(
    'connect nested from within update many mutation adds to an existing list',
    runner(async ({ context }) => {
      const noteContent = sampleOne(alphanumGenerator);
      const noteContent2 = sampleOne(alphanumGenerator);

      // Create an item to link against
      const createNote = await context.query.Note.createOne({ data: { content: noteContent } });
      const createNote2 = await context.query.Note.createOne({
        data: { content: noteContent2 },
      });

      // Create an item to update
      const createUser = await context.query.User.createOne({
        data: {
          username: 'user1',
          notes: { connect: [{ id: createNote.id }, { id: createNote2.id }] },
        },
      });
      const createUser2 = await context.query.User.createOne({ data: { username: 'user2' } });

      const users = await context.query.User.updateMany({
        data: [
          {
            where: { id: createUser.id },
            data: { notes: { set: [{ id: createNote.id }] } },
          },
          {
            where: { id: createUser2.id },
            data: { notes: { set: [{ id: createNote2.id }] } },
          },
        ],
        query: 'id notes { id content }',
      });

      expect(users).toMatchObject([
        { id: expect.any(String), notes: [{ id: createNote.id, content: noteContent }] },
        { id: expect.any(String), notes: [{ id: createNote2.id, content: noteContent2 }] },
      ]);
    })
  );
});

describe('non-matching filter', () => {
  test(
    'errors if connecting items which cannot be found during creating',
    runner(async ({ context }) => {
      const FAKE_ID = 'cabc123';

      // Create an item that does the linking
      const { data, errors } = await context.graphql.raw({
        query: `
              mutation {
                createUser(data: {
                  notes: {
                    connect: [{ id: "${FAKE_ID}" }]
                  }
                }) {
                  id
                }
              }`,
      });
      expect(data).toEqual({ createUser: null });
      const message = `Access denied: You cannot perform the 'connect' operation on the item '{\"id\":\"${FAKE_ID}\"}'. It may not exist.`;
      expectSingleRelationshipError(errors, 'createUser', 'User.notes', message);
    })
  );

  test(
    'errors if connecting items which cannot be found during update',
    runner(async ({ context }) => {
      const FAKE_ID = 'cabc123';

      // Create an item to link against
      const createUser = await context.query.User.createOne({ data: {} });

      // Create an item that does the linking
      const { data, errors } = await context.graphql.raw({
        query: `
              mutation {
                updateUser(
                  where: { id: "${createUser.id}" },
                  data: {
                    notes: {
                      connect: [{ id: "${FAKE_ID}" }]
                    }
                  }
                ) {
                  id
                }
              }`,
      });

      expect(data).toEqual({ updateUser: null });
      const message = `Access denied: You cannot perform the 'connect' operation on the item '{\"id\":\"${FAKE_ID}\"}'. It may not exist.`;
      expectSingleRelationshipError(errors, 'updateUser', 'User.notes', message);
    })
  );

  test(
    'errors on incomplete data',
    runner(async ({ context }) => {
      // Create an item to link against
      const createUser = await context.query.User.createOne({ data: {} });

      // Create an item that does the linking
      const { data, errors } = await context.graphql.raw({
        query: `
              mutation {
                updateUser(
                  where: { id: "${createUser.id}" },
                  data: { notes: {} }
                ) {
                  id
                }
              }`,
      });

      expect(data).toEqual({ updateUser: null });
      const message =
        'Input error: You must provide at least one of "set", "connect", "create" or "disconnect" in to-many relationship inputs for "update" operations.';
      expectSingleRelationshipError(errors, 'updateUser', 'User.notes', message);
    })
  );
});

describe('with access control', () => {
  describe('read: false on related list', () => {
    test(
      'throws when link nested from within create mutation',
      runner(async ({ context }) => {
        const noteContent = sampleOne(alphanumGenerator);

        // Create an item to link against
        const createNoteNoRead = await context.sudo().query.NoteNoRead.createOne({
          data: { content: noteContent },
        });

        const { data, errors } = await context.graphql.raw({
          query: `
                mutation {
                  createUserToNotesNoRead(data: {
                    username: "A thing",
                    notes: { connect: [{ id: "${createNoteNoRead.id}" }] }
                  }) {
                    id
                  }
                }`,
        });

        expect(data).toEqual({ createUserToNotesNoRead: null });
        const message = `Access denied: You cannot perform the 'connect' operation on the item '{\"id\":\"${createNoteNoRead.id}\"}'. It may not exist.`;
        expectSingleRelationshipError(
          errors,
          'createUserToNotesNoRead',
          'UserToNotesNoRead.notes',
          message
        );
      })
    );

    test(
      'throws when link nested from within update mutation',
      runner(async ({ context }) => {
        const noteContent = sampleOne(alphanumGenerator);

        // Create an item to link against
        const createNote = await context.sudo().query.NoteNoRead.createOne({
          data: { content: noteContent },
        });

        // Create an item to update
        const createUser = await context.sudo().query.UserToNotesNoRead.createOne({
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
                      notes: { connect: [{ id: "${createNote.id}" }] }
                    }
                  ) {
                    id
                  }
                }`,
        });
        expect(data).toEqual({ updateUserToNotesNoRead: null });
        const message = `Access denied: You cannot perform the 'connect' operation on the item '{\"id\":\"${createNote.id}\"}'. It may not exist.`;
        expectSingleRelationshipError(
          errors,
          'updateUserToNotesNoRead',
          'UserToNotesNoRead.notes',
          message
        );
      })
    );
  });

  describe('create: false on related list', () => {
    test(
      'does not throw when link nested from within create mutation',
      runner(async ({ context }) => {
        const noteContent = sampleOne(alphanumGenerator);

        // Create an item to link against
        const createNoteNoCreate = await context.sudo().query.NoteNoCreate.createOne({
          data: { content: noteContent },
        });

        // Create an item that does the linking
        const data = await context.query.UserToNotesNoCreate.createOne({
          data: { username: 'A thing', notes: { connect: [{ id: createNoteNoCreate.id }] } },
        });

        expect(data).toMatchObject({ id: expect.any(String) });
      })
    );

    test(
      'does not throw when link nested from within update mutation',
      runner(async ({ context }) => {
        const noteContent = sampleOne(alphanumGenerator);

        // Create an item to link against
        const createNote = await context.sudo().query.NoteNoCreate.createOne({
          data: { content: noteContent },
        });

        // Create an item to update
        const createUser = await context.sudo().query.UserToNotesNoCreate.createOne({
          data: { username: 'A thing' },
        });

        // Update the item and link the relationship field
        const data = await context.query.UserToNotesNoCreate.updateOne({
          where: { id: createUser.id },
          data: { username: 'A thing', notes: { connect: [{ id: createNote.id }] } },
        });

        expect(data).toMatchObject({ id: expect.any(String) });
      })
    );
  });
});
