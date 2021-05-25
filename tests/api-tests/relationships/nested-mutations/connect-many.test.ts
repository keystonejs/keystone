import { ProviderName, testConfig } from '@keystone-next/test-utils-legacy';
import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig } from '@keystone-next/test-utils-legacy';

const alphanumGenerator = gen.alphaNumString.notEmpty();

function setupKeystone(provider: ProviderName) {
  return setupFromConfig({
    provider,
    config: testConfig({
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
}

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe('no access control', () => {
      test(
        'connect nested from within create mutation',
        runner(setupKeystone, async ({ context }) => {
          const noteContent = sampleOne(alphanumGenerator);

          // Create an item to link against
          const createNote = await context.lists.Note.createOne({ data: { content: noteContent } });

          // Create an item that does the linking
          const user = await context.lists.User.createOne({
            data: { username: 'A thing', notes: { connect: [{ id: createNote.id }] } },
            query: 'id notes { id }',
          });

          expect(user).toMatchObject({ id: expect.any(String), notes: expect.any(Array) });

          // Create an item that does the linking
          const user1 = await context.lists.User.createOne({
            data: {
              username: 'A thing',
              notes: { connect: [{ id: createNote.id }, { id: createNote.id }] },
            },
            query: 'id notes { id }',
          });

          expect(user1).toMatchObject({ id: expect.any(String), notes: expect.any(Array) });

          // Test an empty list of related notes
          const user2 = await context.lists.User.createOne({
            data: { username: 'A thing', notes: { connect: [] } },
            query: 'id notes { id }',
          });

          expect(user2).toMatchObject({ id: expect.any(String), notes: [] });
        })
      );

      test(
        'connect nested from within create many mutation',
        runner(setupKeystone, async ({ context }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);

          // Create an item to link against
          const createNote = await context.lists.Note.createOne({ data: { content: noteContent } });
          const createNote2 = await context.lists.Note.createOne({
            data: { content: noteContent2 },
          });

          // Create an item that does the linking
          const users = await context.lists.User.createMany({
            data: [
              { data: { username: 'A thing 1', notes: { connect: [{ id: createNote.id }] } } },
              { data: { username: 'A thing 2', notes: { connect: [{ id: createNote2.id }] } } },
            ],
          });

          expect(users).toMatchObject([{ id: expect.any(String) }, { id: expect.any(String) }]);
        })
      );

      test(
        'connect nested from within update mutation adds to an empty list',
        runner(setupKeystone, async ({ context }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);

          // Create an item to link against
          const createNote = await context.lists.Note.createOne({ data: { content: noteContent } });
          const createNote2 = await context.lists.Note.createOne({
            data: { content: noteContent2 },
          });

          // Create an item to update
          const createUser = await context.lists.User.createOne({ data: { username: 'A thing' } });

          // Update the item and link the relationship field
          const user = await context.lists.User.updateOne({
            id: createUser.id,
            data: { username: 'A thing', notes: { connect: [{ id: createNote.id }] } },
            query: 'id notes { id content }',
          });

          expect(user).toMatchObject({
            id: expect.any(String),
            notes: [{ id: expect.any(String), content: noteContent }],
          });

          // Update the item and link multiple relationship fields
          const _user = await context.lists.User.updateOne({
            id: createUser.id,
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
        runner(setupKeystone, async ({ context }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);

          // Create an item to link against
          const createNote = await context.lists.Note.createOne({ data: { content: noteContent } });
          const createNote2 = await context.lists.Note.createOne({
            data: { content: noteContent2 },
          });

          // Create an item to update
          const createUser = await context.lists.User.createOne({
            data: { username: 'A thing', notes: { connect: [{ id: createNote.id }] } },
          });

          // Update the item and link the relationship field
          const user = await context.lists.User.updateOne({
            id: createUser.id,
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
        runner(setupKeystone, async ({ context }) => {
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
              username: 'user1',
              notes: { connect: [{ id: createNote.id }, { id: createNote2.id }] },
            },
          });
          const createUser2 = await context.lists.User.createOne({ data: { username: 'user2' } });

          const users = await context.lists.User.updateMany({
            data: [
              {
                id: createUser.id,
                data: { notes: { disconnectAll: true, connect: [{ id: createNote.id }] } },
              },
              {
                id: createUser2.id,
                data: { notes: { disconnectAll: true, connect: [{ id: createNote2.id }] } },
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
        'does not throw if connecting items which cannot be found during creating',
        runner(setupKeystone, async ({ context }) => {
          const FAKE_ID = 100;

          // Create an item that does the linking
          const item = await context.lists.User.createOne({
            data: { notes: { connect: [{ id: FAKE_ID }] } },
            query: 'id notes { id }',
          });

          expect(item.notes).toEqual([]);
        })
      );

      test(
        'does not throw if connecting items which cannot be found during update',
        runner(setupKeystone, async ({ context }) => {
          const FAKE_ID = 100;

          // Create an item to link against
          const createUser = await context.lists.User.createOne({ data: {} });

          // Create an item that does the linking
          const item = await context.lists.User.updateOne({
            id: createUser.id,
            data: { notes: { connect: [{ id: FAKE_ID }] } },
            query: 'id notes { id }',
          });

          expect(item.notes).toEqual([]);
        })
      );
    });

    describe('with access control', () => {
      describe('read: false on related list', () => {
        test(
          'does not throw when link nested from within create mutation',
          runner(setupKeystone, async ({ context }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNoteNoRead = await context.lists.NoteNoRead.createOne({
              data: { content: noteContent },
            });

            // We can connect the item, but we can't read it back
            const item = await context.exitSudo().lists.UserToNotesNoRead.createOne({
              data: { username: 'A thing', notes: { connect: [{ id: createNoteNoRead.id }] } },
              query: 'id username notes { id content }',
            });
            expect(item.username).toEqual('A thing');
            expect(item.notes).toEqual([]);

            // Verify that it did indeed get connected
            const _item = await context.lists.UserToNotesNoRead.findOne({
              where: { id: item.id },
              query: 'id username notes { id content }',
            });
            expect(_item.username).toEqual('A thing');
            expect(_item.notes).toHaveLength(1);
            expect(_item.notes[0].content).toEqual(noteContent);
          })
        );

        test(
          'does not throw when link nested from within update mutation',
          runner(setupKeystone, async ({ context }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNote = await context.lists.NoteNoRead.createOne({
              data: { content: noteContent },
            });

            // Create an item to update
            const createUser = await context.lists.UserToNotesNoRead.createOne({
              data: { username: 'A thing' },
            });

            // We can connect the item, but we can't read it back
            const item = await context.exitSudo().lists.UserToNotesNoRead.updateOne({
              id: createUser.id,
              data: { username: 'A thing', notes: { connect: [{ id: createNote.id }] } },
              query: 'id username notes { id content }',
            });
            expect(item.username).toEqual('A thing');
            expect(item.notes).toEqual([]);

            // Verify that it did indeed get connected
            const _item = await context.lists.UserToNotesNoRead.findOne({
              where: { id: item.id },
              query: 'id username notes { id content }',
            });
            expect(_item.username).toEqual('A thing');
            expect(_item.notes).toHaveLength(1);
            expect(_item.notes[0].content).toEqual(noteContent);
          })
        );
      });

      describe('create: false on related list', () => {
        test(
          'does not throw when link nested from within create mutation',
          runner(setupKeystone, async ({ context }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNoteNoCreate = await context.lists.NoteNoCreate.createOne({
              data: { content: noteContent },
            });

            // Create an item that does the linking
            const data = await context.exitSudo().lists.UserToNotesNoCreate.createOne({
              data: { username: 'A thing', notes: { connect: [{ id: createNoteNoCreate.id }] } },
            });

            expect(data).toMatchObject({ id: expect.any(String) });
          })
        );

        test(
          'does not throw when link nested from within update mutation',
          runner(setupKeystone, async ({ context }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNote = await context.lists.NoteNoCreate.createOne({
              data: { content: noteContent },
            });

            // Create an item to update
            const createUser = await context.lists.UserToNotesNoCreate.createOne({
              data: { username: 'A thing' },
            });

            // Update the item and link the relationship field
            const data = await context.exitSudo().lists.UserToNotesNoCreate.updateOne({
              id: createUser.id,
              data: { username: 'A thing', notes: { connect: [{ id: createNote.id }] } },
            });

            expect(data).toMatchObject({ id: expect.any(String) });
          })
        );
      });
    });
  })
);
