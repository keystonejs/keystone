import { ProviderName, testConfig } from '@keystone-next/test-utils-legacy';
import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig } from '@keystone-next/test-utils-legacy';
import { createItem } from '@keystone-next/server-side-graphql-client-legacy';

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
        'link AND create nested from within create mutation',
        runner(setupKeystone, async ({ context }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);

          // Create an item to link against
          const createNote = await createItem({
            context,
            listKey: 'Note',
            item: { content: noteContent },
          });

          // Create an item that does the linking
          type T = {
            data: { createUser: { id: IdType; notes: { id: IdType; content: string }[] } };
            errors: unknown;
          };
          const { data, errors }: T = await context.executeGraphQL({
            query: `
              mutation {
                createUser(data: {
                  username: "A thing",
                  notes: {
                    connect: [{ id: "${createNote.id}" }],
                    create: [{ content: "${noteContent2}" }]
                  }
                }) {
                  id
                  notes {
                    id
                    content
                  }
                }
              }`,
          });

          expect(data).toMatchObject({
            createUser: {
              id: expect.any(String),
              notes: [
                { id: expect.any(String), content: noteContent },
                { id: expect.any(String), content: noteContent2 },
              ],
            },
          });
          expect(errors).toBe(undefined);

          // Sanity check that the items are actually created
          const { allNotes } = await context.graphql.run({
            query: `
              query {
                allNotes(where: { id_in: [${data.createUser.notes
                  .map(({ id }) => `"${id}"`)
                  .join(',')}] }) {
                  id
                  content
                }
              }`,
          });
          expect(allNotes).toHaveLength(data.createUser.notes.length);
        })
      );

      test(
        'link & create nested from within update mutation',
        runner(setupKeystone, async ({ context }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);

          // Create an item to link against
          const createNote = await createItem({
            context,
            listKey: 'Note',
            item: { content: noteContent },
          });

          // Create an item to update
          const createUser = await createItem({
            context,
            listKey: 'User',
            item: { username: 'A thing' },
          });

          // Update the item and link the relationship field
          type T = {
            data: { updateUser: { id: IdType; notes: { id: IdType; content: string }[] } };
            errors: unknown;
          };
          const { data, errors }: T = await context.executeGraphQL({
            query: `
              mutation {
                updateUser(
                  id: "${createUser.id}"
                  data: {
                    username: "A thing",
                    notes: {
                      connect: [{ id: "${createNote.id}" }],
                      create: [{ content: "${noteContent2}" }]
                    }
                  }
                ) {
                  id
                  notes {
                    id
                    content
                  }
                }
              }`,
          });

          expect(data).toMatchObject({
            updateUser: {
              id: expect.any(String),
              notes: [
                { id: createNote.id, content: noteContent },
                { id: expect.any(String), content: noteContent2 },
              ],
            },
          });
          expect(errors).toBe(undefined);

          // Sanity check that the items are actually created
          const {
            data: { allNotes },
            errors: errors2,
          } = await context.executeGraphQL({
            query: `
              query {
                allNotes(where: { id_in: [${data.updateUser.notes
                  .map(({ id }) => `"${id}"`)
                  .join(',')}] }) {
                  id
                  content
                }
              }`,
          });
          expect(errors2).toBe(undefined);
          expect(allNotes).toHaveLength(data.updateUser.notes.length);
        })
      );
    });

    describe('errors on incomplete data', () => {
      test(
        'when neither id or create data passed',
        runner(setupKeystone, async ({ context }) => {
          // Create an item that does the linking
          const { errors } = await context.executeGraphQL({
            query: `
              mutation {
                createUser(data: { notes: {} }) {
                  id
                }
              }`,
          });

          expect(errors).toMatchObject([
            { message: 'Nested mutation operation invalid for User.notes<Note>' },
          ]);
        })
      );
    });

    describe('with access control', () => {
      describe('read: false on related list', () => {
        test(
          'throws when link AND create nested from within create mutation',
          runner(setupKeystone, async ({ context }) => {
            const noteContent = sampleOne(alphanumGenerator);
            const noteContent2 = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNoteNoRead = await createItem({
              context,
              listKey: 'NoteNoRead',
              item: { content: noteContent },
            });

            // Create an item that does the linking
            const { errors } = await context.exitSudo().executeGraphQL({
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

            expect(errors).toHaveLength(1);
            const error = errors[0];
            expect(error.message).toEqual(
              'Unable to create and/or connect 1 UserToNotesNoRead.notes<NoteNoRead>'
            );
            expect(error.path).toHaveLength(1);
            expect(error.path[0]).toEqual('createUserToNotesNoRead');
          })
        );

        test(
          'throws when link & create nested from within update mutation',
          runner(setupKeystone, async ({ context }) => {
            const noteContent = sampleOne(alphanumGenerator);
            const noteContent2 = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNote = await createItem({
              context,
              listKey: 'NoteNoRead',
              item: { content: noteContent },
            });

            // Create an item to update
            const createUser = await createItem({
              context,
              listKey: 'UserToNotesNoRead',
              item: { username: 'A thing' },
            });

            // Update the item and link the relationship field
            const { errors } = await context.exitSudo().executeGraphQL({
              query: `
                mutation {
                  updateUserToNotesNoRead(
                    id: "${createUser.id}"
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

            expect(errors).toHaveLength(1);
            const error = errors[0];
            expect(error.message).toEqual(
              'Unable to create and/or connect 1 UserToNotesNoRead.notes<NoteNoRead>'
            );
            expect(error.path).toHaveLength(1);
            expect(error.path[0]).toEqual('updateUserToNotesNoRead');
          })
        );
      });
    });
  })
);
