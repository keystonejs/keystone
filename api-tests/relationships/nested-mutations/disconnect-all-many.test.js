const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystone-alpha/fields');
const cuid = require('cuid');
const { setupServer, graphqlRequest, multiAdapterRunners } = require('@keystone-alpha/test-utils');

const alphanumGenerator = gen.alphaNumString.notEmpty();

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
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
        runner(setupKeystone, async ({ keystone, create }) => {
          const noteContent = `foo${sampleOne(alphanumGenerator)}`;
          const noteContent2 = `foo${sampleOne(alphanumGenerator)}`;

          // Create two items with content that can be matched
          const createNote = await create('Note', { content: noteContent });
          const createNote2 = await create('Note', { content: noteContent2 });

          // Create an item to update
          const createUser = await create('User', {
            username: 'A thing',
            notes: [createNote.id, createNote2.id],
          });

          // Update the item and link the relationship field
          const { data } = await graphqlRequest({
            keystone,
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
          }
      `,
          });

          expect(data).toMatchObject({
            updateUser: {
              id: expect.any(String),
              notes: [],
            },
          });
        })
      );

      test(
        'silently succeeds if used during create',
        runner(setupKeystone, async ({ keystone }) => {
          // Create an item that does the linking
          const { data } = await graphqlRequest({
            keystone,
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
          }
      `,
          });

          expect(data.createUser).toMatchObject({
            id: expect.any(String),
            notes: [],
          });
        })
      );
    });

    describe('with access control', () => {
      describe('read: false on related list', () => {
        test(
          'has no effect when specifying disconnectAll',
          runner(setupKeystone, async ({ keystone, create, findById }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNote = await create('NoteNoRead', { content: noteContent });

            // Create an item to update
            const createUser = await create('UserToNotesNoRead', {
              username: 'A thing',
              notes: [createNote.id],
            });

            // Update the item and link the relationship field
            await graphqlRequest({
              keystone,
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
            }
        `,
            });

            const userData = await findById('UserToNotesNoRead', createUser.id);

            expect(userData.notes).toHaveLength(0);
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
