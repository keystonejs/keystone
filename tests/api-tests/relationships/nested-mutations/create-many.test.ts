import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import {
  ProviderName,
  multiAdapterRunners,
  setupFromConfig,
  testConfig,
} from '@keystone-next/test-utils-legacy';

const alphanumGenerator = gen.alphaNumString.notEmpty();

type IdType = any;

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
        'create nested from within create mutation',
        runner(setupKeystone, async ({ context }) => {
          const noteContent = `a${sampleOne(alphanumGenerator)}`;
          const noteContent2 = `b${sampleOne(alphanumGenerator)}`;
          const noteContent3 = `c${sampleOne(alphanumGenerator)}`;

          // Create an item that does the nested create
          const user = await context.lists.User.createOne({
            data: { username: 'A thing', notes: { create: [{ content: noteContent }] } },
            query: 'id notes(sortBy: [content_ASC]) { id content }',
          });

          expect(user).toMatchObject({
            id: expect.any(String),
            notes: [{ id: expect.any(String), content: noteContent }],
          });

          // Create an item that does the nested create
          type T = { id: IdType; notes: { id: IdType; content: string }[] };

          const user1 = (await context.lists.User.createOne({
            data: {
              username: 'A thing',
              notes: { create: [{ content: noteContent2 }, { content: noteContent3 }] },
            },
            query: 'id notes(sortBy: [content_ASC]) { id content }',
          })) as T;

          expect(user1).toMatchObject({
            id: expect.any(String),
            notes: [
              { id: expect.any(String), content: noteContent2 },
              { id: expect.any(String), content: noteContent3 },
            ],
          });

          // Sanity check that the items are actually created
          const notes = await context.lists.Note.findMany({
            where: { id_in: user1.notes.map(({ id }) => id) },
          });
          expect(notes).toHaveLength(user1.notes.length);

          // Test an empty list of related notes
          const user2 = await context.lists.User.createOne({
            data: { username: 'A thing', notes: { create: [] } },
            query: 'id notes { id }',
          });
          expect(user2).toMatchObject({ id: expect.any(String), notes: [] });
        })
      );

      test(
        'create nested from within update mutation',
        runner(setupKeystone, async ({ context }) => {
          const noteContent = `a${sampleOne(alphanumGenerator)}`;
          const noteContent2 = `b${sampleOne(alphanumGenerator)}`;
          const noteContent3 = `c${sampleOne(alphanumGenerator)}`;

          // Create an item to update
          const createUser = await context.lists.User.createOne({ data: { username: 'A thing' } });

          // Update an item that does the nested create
          const user = await context.lists.User.updateOne({
            id: createUser.id,
            data: { username: 'A thing', notes: { create: [{ content: noteContent }] } },
            query: 'id notes { id content }',
          });

          expect(user).toMatchObject({
            id: expect.any(String),
            notes: [{ id: expect.any(String), content: noteContent }],
          });

          type T = { id: IdType; notes: { id: IdType; content: string }[] };
          const _user = (await context.lists.User.updateOne({
            id: createUser.id,
            data: {
              username: 'A thing',
              notes: { create: [{ content: noteContent2 }, { content: noteContent3 }] },
            },
            query: 'id notes(sortBy: [content_ASC]) { id content }',
          })) as T;

          expect(_user).toMatchObject({
            id: expect.any(String),
            notes: [
              { id: expect.any(String), content: noteContent },
              { id: expect.any(String), content: noteContent2 },
              { id: expect.any(String), content: noteContent3 },
            ],
          });

          // Sanity check that the items are actually created
          const notes = await context.lists.Note.findMany({
            where: { id_in: _user.notes.map(({ id }) => id) },
          });
          expect(notes).toHaveLength(_user.notes.length);
        })
      );
    });

    describe('with access control', () => {
      describe('read: false on related list', () => {
        test(
          'throws when trying to read after nested create',
          runner(setupKeystone, async ({ context }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item that does the nested create
            const { errors } = await context.exitSudo().graphql.raw({
              query: `
                mutation {
                  createUserToNotesNoRead(data: {
                    username: "A thing",
                    notes: { create: [{ content: "${noteContent}" }] }
                  }) {
                    id
                    notes {
                      id
                    }
                  }
                }`,
            });

            expect(errors).toHaveLength(1);
            const error = errors![0];
            expect(error.message).toEqual('You do not have access to this resource');
            expect(error.path).toHaveLength(2);
            expect(error.path![0]).toEqual('createUserToNotesNoRead');
            expect(error.path![1]).toEqual('notes');
          })
        );

        test(
          'does not throw when create nested from within create mutation',
          runner(setupKeystone, async ({ context }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item that does the nested create
            const { errors } = await context.exitSudo().graphql.raw({
              query: `
                mutation {
                  createUserToNotesNoRead(data: {
                    username: "A thing",
                    notes: { create: [{ content: "${noteContent}" }] }
                  }) {
                    id
                  }
                }`,
            });

            expect(errors).toBe(undefined);
          })
        );

        test(
          'does not throw when create nested from within update mutation',
          runner(setupKeystone, async ({ context }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to update
            const createUser = await context.lists.UserToNotesNoRead.createOne({
              data: { username: 'A thing' },
            });

            // Update an item that does the nested create
            const { errors } = await context.exitSudo().graphql.raw({
              query: `
                mutation {
                  updateUserToNotesNoRead(
                    id: "${createUser.id}"
                    data: {
                      username: "A thing",
                      notes: { create: [{ content: "${noteContent}" }] }
                    }
                  ) {
                    id
                  }
                }`,
            });

            expect(errors).toBe(undefined);
          })
        );
      });

      describe('create: false on related list', () => {
        test(
          'throws error when creating nested within create mutation',
          runner(setupKeystone, async ({ context }) => {
            const userName = sampleOne(alphanumGenerator);
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item that does the nested create
            const { errors } = await context.exitSudo().graphql.raw({
              query: `
                mutation {
                  createUserToNotesNoCreate(data: {
                    username: "${userName}",
                    notes: { create: [{ content: "${noteContent}" }] }
                  }) {
                    id
                  }
                }`,
            });

            // Assert it throws an access denied error
            expect(errors).toHaveLength(1);
            const error = errors![0];
            expect(error.message).toEqual(
              'Unable to create and/or connect 1 UserToNotesNoCreate.notes<NoteNoCreate>'
            );
            expect(error.path).toHaveLength(1);
            expect(error.path![0]).toEqual('createUserToNotesNoCreate');

            // Confirm it didn't insert either of the records anyway
            const allNoteNoCreates = await context.lists.NoteNoCreate.findMany({
              where: { content: noteContent },
            });
            const allUserToNotesNoCreates = await context.lists.UserToNotesNoCreate.findMany({
              where: { username: userName },
            });
            expect(allNoteNoCreates).toMatchObject([]);
            expect(allUserToNotesNoCreates).toMatchObject([]);
          })
        );

        test(
          'throws error when creating nested within update mutation',
          runner(setupKeystone, async ({ context }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to update
            const createUserToNotesNoCreate = await context.lists.UserToNotesNoCreate.createOne({
              data: { username: 'A thing' },
            });

            // Update an item that does the nested create
            const { errors } = await context.exitSudo().graphql.raw({
              query: `
                mutation {
                  updateUserToNotesNoCreate(
                    id: "${createUserToNotesNoCreate.id}"
                    data: {
                      username: "A thing",
                      notes: { create: { content: "${noteContent}" } }
                    }
                  ) {
                    id
                  }
                }`,
            });

            // Assert it throws an access denied error
            expect(errors).toHaveLength(1);
            const error = errors![0];
            expect(error.message).toEqual(
              'Unable to create and/or connect 1 UserToNotesNoCreate.notes<NoteNoCreate>'
            );
            expect(error.path).toHaveLength(1);
            expect(error.path![0]).toEqual('updateUserToNotesNoCreate');

            // Confirm it didn't insert the record anyway
            const items = await context.lists.NoteNoCreate.findMany({
              where: { content: noteContent },
            });
            expect(items).toMatchObject([]);
          })
        );
      });
    });
  })
);
