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
        'removes all items from list',
        runner(setupKeystone, async ({ context }) => {
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
          const data = await context.graphql.run({
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
        })
      );

      test(
        'silently succeeds if used during create',
        runner(setupKeystone, async ({ context }) => {
          // Create an item that does the linking
          const user = await context.lists.User.createOne({
            data: { notes: { disconnectAll: true } },
            query: 'id notes { id }',
          });

          expect(user).toMatchObject({ id: expect.any(String), notes: [] });
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
            const createNote = await context.lists.NoteNoRead.createOne({
              data: { content: noteContent },
            });

            // Create an item to update
            const createUser = await context.lists.UserToNotesNoRead.createOne({
              data: {
                username: 'A thing',
                notes: { connect: [{ id: createNote.id }] },
              },
            });

            // Update the item and link the relationship field
            await context.exitSudo().graphql.run({
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

            const data = await context.graphql.run({
              query: `
                query getUserNodes($userId: ID!){
                  UserToNotesNoRead(where: { id: $userId }) {
                    id
                    notes { id }
                  }
                }`,
              variables: { userId: createUser.id },
            });
            expect(data.UserToNotesNoRead.notes).toHaveLength(0);
          })
        );
      });
    });
  })
);
