import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { setupTestRunner } from '@keystone-next/testing';
import { apiTestConfig } from '../../utils';

const alphanumGenerator = gen.alphaNumString.notEmpty();

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: createSchema({
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
          read: () => false,
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
          create: () => false,
        },
      }),
      UserToNotesNoCreate: list({
        fields: {
          username: text(),
          notes: relationship({ ref: 'NoteNoCreate', many: true }),
        },
      }),
    }),
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
        id: createUser.id,
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
    'silently succeeds if used during create',
    runner(async ({ context }) => {
      const FAKE_ID = 'c5b84f38256d3c2df59a0d9bf';

      // Create an item that does the linking
      const user = await context.lists.User.createOne({
        data: { notes: { disconnect: [{ id: FAKE_ID }] } },
        query: 'id notes { id content }',
      });
      expect(user).toMatchObject({ id: expect.any(String), notes: [] });
    })
  );
});

describe('non-matching filter', () => {
  test(
    'silently succeeds if items to disconnect cannot be found during update',
    runner(async ({ context }) => {
      const FAKE_ID = 'c5b84f38256d3c2df59a0d9bf';

      // Create an item to link against
      const createUser = await context.lists.User.createOne({ data: {} });

      // Create an item that does the linking
      const user = await context.lists.User.updateOne({
        id: createUser.id,
        data: { notes: { disconnect: [{ id: FAKE_ID }] } },
        query: 'id notes { id }',
      });

      expect(user).toMatchObject({ id: expect.any(String), notes: [] });
    })
  );

  test(
    'removes items that match, silently ignores those that do not',
    runner(async ({ context }) => {
      const FAKE_ID = 'c5b84f38256d3c2df59a0d9bf';
      const noteContent = sampleOne(alphanumGenerator);
      const noteContent2 = sampleOne(alphanumGenerator);

      // Create an item to link against
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
        id: createUser.id,
        data: { notes: { disconnect: [{ id: createNote.id }, { id: FAKE_ID }] } },
        query: 'id notes { id content }',
      });

      expect(user).toMatchObject({
        id: expect.any(String),
        notes: [{ id: expect.any(String), content: noteContent2 }],
      });
    })
  );
});

describe('with access control', () => {
  describe('read: false on related list', () => {
    test(
      'has no impact when disconnecting directly with an id',
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
          id: createUser.id,
          data: { username: 'A thing', notes: { disconnect: [{ id: createNote.id }] } },
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
