const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystonejs/fields');
const { setupServer, multiAdapterRunners } = require('@keystonejs/test-utils');
const { createItem } = require('@keystonejs/server-side-graphql-client');

const alphanumGenerator = gen.alphaNumString.notEmpty();

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('Note', {
        fields: {
          content: { type: Text },
        },
      });

      keystone.createList('User', {
        fields: {
          username: { type: Text },
          notes: { type: Relationship, ref: 'Note', many: true },
        },
      });

      keystone.createList('NoteNoRead', {
        fields: {
          content: { type: Text },
        },
        access: {
          read: () => false,
        },
      });

      keystone.createList('UserToNotesNoRead', {
        fields: {
          username: { type: Text },
          notes: { type: Relationship, ref: 'NoteNoRead', many: true },
        },
      });

      keystone.createList('NoteNoCreate', {
        fields: {
          content: { type: Text },
        },
        access: {
          create: () => false,
        },
      });

      keystone.createList('UserToNotesNoCreate', {
        fields: {
          username: { type: Text },
          notes: { type: Relationship, ref: 'NoteNoCreate', many: true },
        },
      });
    },
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('no access control', () => {
      test(
        'removes all items from list',
        runner(setupKeystone, async ({ keystone }) => {
          const noteContent = `foo${sampleOne(alphanumGenerator)}`;
          const noteContent2 = `foo${sampleOne(alphanumGenerator)}`;

          // Create two items with content that can be matched
          const createNote = await createItem({
            keystone,
            listKey: 'Note',
            item: { content: noteContent },
          });
          const createNote2 = await createItem({
            keystone,
            listKey: 'Note',
            item: { content: noteContent2 },
          });

          // Create an item to update
          const createUser = await createItem({
            keystone,
            listKey: 'User',
            item: {
              username: 'A thing',
              notes: { connect: [{ id: createNote.id }, { id: createNote2.id }] },
            },
          });

          // Update the item and link the relationship field
          const { data, errors } = await keystone.executeGraphQL({
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
        runner(setupKeystone, async ({ keystone }) => {
          // Create an item that does the linking
          const { data, errors } = await keystone.executeGraphQL({
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
          runner(setupKeystone, async ({ keystone }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNote = await createItem({
              keystone,
              listKey: 'NoteNoRead',
              item: { content: noteContent },
            });

            // Create an item to update
            const createUser = await createItem({
              keystone,
              listKey: 'UserToNotesNoRead',
              item: {
                username: 'A thing',
                notes: { connect: [{ id: createNote.id }] },
              },
            });

            // Update the item and link the relationship field
            const { errors } = await keystone.executeGraphQL({
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

            const result = await keystone.executeGraphQL({
              query: `
                query getUserNodes($userId: ID!){
                  UserToNotesNoRead(where: { id: $userId }) {
                    id
                    notes { id }
                  }
                }`,
              variables: { userId: createUser.id },
              context: keystone.createContext({ skipAccessControl: true }),
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
