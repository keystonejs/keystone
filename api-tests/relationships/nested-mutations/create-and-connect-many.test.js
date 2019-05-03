const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystone-alpha/fields');
const cuid = require('cuid');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystone-alpha/test-utils');

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
        'link AND create nested from within create mutation',
        runner(setupKeystone, async ({ keystone, create }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);

          // Create an item to link against
          const createNote = await create('Note', { content: noteContent });

          // Create an item that does the linking
          const { data, errors } = await graphqlRequest({
            keystone,
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
        }
    `,
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
          const {
            data: { allNotes },
          } = await graphqlRequest({
            keystone,
            query: `
        query {
          allNotes(where: { id_in: [${data.createUser.notes
            .map(({ id }) => `"${id}"`)
            .join(',')}] }) {
            id
            content
          }
        }
    `,
          });

          expect(allNotes).toHaveLength(data.createUser.notes.length);
        })
      );

      test(
        'link & create nested from within update mutation',
        runner(setupKeystone, async ({ keystone, create }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);

          // Create an item to link against
          const createNote = await create('Note', { content: noteContent });

          // Create an item to update
          const createUser = await create('User', { username: 'A thing' });

          // Update the item and link the relationship field
          const { data, errors } = await graphqlRequest({
            keystone,
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
        }
    `,
          });

          expect(data).toMatchObject({
            updateUser: {
              id: expect.any(String),
              notes: [
                {
                  id: createNote.id,
                  content: noteContent,
                },
                {
                  id: expect.any(String),
                  content: noteContent2,
                },
              ],
            },
          });
          expect(errors).toBe(undefined);

          // Sanity check that the items are actually created
          const {
            data: { allNotes },
          } = await graphqlRequest({
            keystone,
            query: `
        query {
          allNotes(where: { id_in: [${data.updateUser.notes
            .map(({ id }) => `"${id}"`)
            .join(',')}] }) {
            id
            content
          }
        }
    `,
          });

          expect(allNotes).toHaveLength(data.updateUser.notes.length);
        })
      );
    });

    describe('errors on incomplete data', () => {
      test(
        'when neither id or create data passed',
        runner(setupKeystone, async ({ keystone }) => {
          // Create an item that does the linking
          const { errors } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          createUser(data: { notes: {} }) {
            id
          }
        }
    `,
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
          runner(setupKeystone, async ({ keystone, create }) => {
            const noteContent = sampleOne(alphanumGenerator);
            const noteContent2 = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNoteNoRead = await create('NoteNoRead', {
              content: noteContent,
            });

            // Create an item that does the linking
            const { errors } = await graphqlRequest({
              keystone,
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
          }
      `,
            });

            expect(errors).toMatchObject([
              { message: 'Unable to create and/or connect 1 UserToNotesNoRead.notes<NoteNoRead>' },
            ]);
          })
        );

        test(
          'throws when link & create nested from within update mutation',
          runner(setupKeystone, async ({ keystone, create }) => {
            const noteContent = sampleOne(alphanumGenerator);
            const noteContent2 = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNote = await create('NoteNoRead', { content: noteContent });

            // Create an item to update
            const createUser = await create('UserToNotesNoRead', {
              username: 'A thing',
            });

            // Update the item and link the relationship field
            const { errors } = await graphqlRequest({
              keystone,
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
          }
      `,
            });

            expect(errors).toMatchObject([
              { message: 'Unable to create and/or connect 1 UserToNotesNoRead.notes<NoteNoRead>' },
            ]);
          })
        );
      });
    });
  })
);
