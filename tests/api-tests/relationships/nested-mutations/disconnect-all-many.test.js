const { gen, sampleOne } = require('testcheck');
const { text, relationship } = require('@keystone-next/fields');
const { createSchema, list } = require('@keystone-next/keystone/schema');
const { multiAdapterRunners, setupFromConfig } = require('@keystonejs/test-utils');
const { createItem } = require('@keystonejs/server-side-graphql-client');

const alphanumGenerator = gen.alphaNumString.notEmpty();

function setupKeystone(adapterName) {
  return setupFromConfig({
    adapterName,
    config: createSchema({
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
      },
    }),
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('no access control', () => {
      test(
        'removes all items from list',
        runner(setupKeystone, async ({ context }) => {
          const noteContent = `foo${sampleOne(alphanumGenerator)}`;
          const noteContent2 = `foo${sampleOne(alphanumGenerator)}`;

          // Create two items with content that can be matched
          const createNote = await createItem({
            context,
            listKey: 'Note',
            item: { content: noteContent },
          });
          const createNote2 = await createItem({
            context,
            listKey: 'Note',
            item: { content: noteContent2 },
          });

          // Create an item to update
          const createUser = await createItem({
            context,
            listKey: 'User',
            item: {
              username: 'A thing',
              notes: { connect: [{ id: createNote.id }, { id: createNote2.id }] },
            },
          });

          // Update the item and link the relationship field
          const { data, errors } = await context.executeGraphQL({
            query: `
              mutation {
                updateUser(
                  id: "${createUser.id}"
                  data: {
                    username: "A thing",
                    notes: { disconnectAll: true }
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

          expect(data).toMatchObject({ updateUser: { id: expect.any(String), notes: [] } });
          expect(errors).toBe(undefined);
        })
      );

      test(
        'silently succeeds if used during create',
        runner(setupKeystone, async ({ context }) => {
          // Create an item that does the linking
          const { data, errors } = await context.executeGraphQL({
            query: `
              mutation {
                createUser(data: {
                  notes: {
                    disconnectAll: true
                  }
                }) {
                  id
                  notes {
                    id
                  }
                }
              }`,
          });

          expect(errors).toBe(undefined);
          expect(data.createUser).toMatchObject({ id: expect.any(String), notes: [] });
        })
      );
    });

    describe('with access control', () => {
      describe('read: false on related list', () => {
        test(
          'has no effect when specifying disconnectAll',
          runner(setupKeystone, async ({ context }) => {
            const noteContent = sampleOne(alphanumGenerator);

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
              item: {
                username: 'A thing',
                notes: { connect: [{ id: createNote.id }] },
              },
            });

            // Update the item and link the relationship field
            const { errors } = await context.exitSudo().executeGraphQL({
              query: `
                mutation {
                  updateUserToNotesNoRead(
                    id: "${createUser.id}"
                    data: {
                      username: "A thing",
                      notes: { disconnectAll: true }
                    }
                  ) {
                    id
                  }
                }`,
            });

            expect(errors).toBe(undefined);

            const result = await context.executeGraphQL({
              query: `
                query getUserNodes($userId: ID!){
                  UserToNotesNoRead(where: { id: $userId }) {
                    id
                    notes { id }
                  }
                }`,
              variables: { userId: createUser.id },
              context,
            });
            expect(result.errors).toBe(undefined);
            expect(result.data.UserToNotesNoRead.notes).toHaveLength(0);
          })
        );

        test.failing('silently keeps items that otherwise would be removed', () => {
          // TODO: Fill this in when we support more filtering on Unique items than
          // just ID.
          expect(false).toBe(true);
        });
      });
    });
  })
);
