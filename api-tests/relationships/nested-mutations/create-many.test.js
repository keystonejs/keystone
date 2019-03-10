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
        'create nested from within create mutation',
        runner(setupKeystone, async ({ server: { server } }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);
          const noteContent3 = sampleOne(alphanumGenerator);

          // Create an item that does the nested create
          const createUser = await graphqlRequest({
            server,
            query: `
        mutation {
          createUser(data: {
            username: "A thing",
            notes: { create: [{ content: "${noteContent}" }] }
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

          expect(createUser.body).not.toHaveProperty('errors');
          expect(createUser.body.data).toMatchObject({
            createUser: {
              id: expect.any(String),
              notes: [
                {
                  id: expect.any(String),
                  content: noteContent,
                },
              ],
            },
          });

          // Create an item that does the nested create
          const createUserManyNotes = await graphqlRequest({
            server,
            query: `
        mutation {
          createUser(data: {
            username: "A thing",
            notes: {
              create: [{ content: "${noteContent2}" }, { content: "${noteContent3}" }]
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

          expect(createUserManyNotes.body).not.toHaveProperty('errors');
          expect(createUserManyNotes.body.data).toMatchObject({
            createUser: {
              id: expect.any(String),
              notes: [
                {
                  id: expect.any(String),
                  content: noteContent2,
                },
                {
                  id: expect.any(String),
                  content: noteContent3,
                },
              ],
            },
          });

          // Sanity check that the items are actually created
          const {
            body: {
              data: { allNotes },
            },
          } = await graphqlRequest({
            server,
            query: `
        query {
          allNotes(where: { id_in: [${createUserManyNotes.body.data.createUser.notes
            .map(({ id }) => `"${id}"`)
            .join(',')}] }) {
            id
            content
          }
        }
    `,
          });

          expect(allNotes).toHaveLength(createUserManyNotes.body.data.createUser.notes.length);
        })
      );

      test(
        'create nested from within update mutation',
        runner(setupKeystone, async ({ server: { server }, create }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);
          const noteContent3 = sampleOne(alphanumGenerator);

          // Create an item to update
          const createUser = await create('User', { username: 'A thing' });

          // Update an item that does the nested create
          const updateUser = await graphqlRequest({
            server,
            query: `
        mutation {
          updateUser(
            id: "${createUser.id}"
            data: {
              username: "A thing",
              notes: { create: [{ content: "${noteContent}" }] }
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

          expect(updateUser.body).not.toHaveProperty('errors');
          expect(updateUser.body.data).toMatchObject({
            updateUser: {
              id: expect.any(String),
              notes: [
                {
                  id: expect.any(String),
                  content: noteContent,
                },
              ],
            },
          });

          const updateUserManyNotes = await graphqlRequest({
            server,
            query: `
        mutation {
          updateUser(
            id: "${createUser.id}"
            data: {
              username: "A thing",
              notes: {
                create: [
                  { content: "${noteContent2}" },
                  { content: "${noteContent3}" }
                ]
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

          expect(updateUserManyNotes.body).not.toHaveProperty('errors');
          expect(updateUserManyNotes.body.data).toMatchObject({
            updateUser: {
              id: expect.any(String),
              notes: [
                {
                  id: expect.any(String),
                  content: noteContent,
                },
                {
                  id: expect.any(String),
                  content: noteContent2,
                },
                {
                  id: noteContent3.id,
                  id: expect.any(String),
                  content: noteContent3,
                },
              ],
            },
          });

          // Sanity check that the items are actually created
          const {
            body: {
              data: { allNotes },
            },
          } = await graphqlRequest({
            server,
            query: `
        query {
          allNotes(where: { id_in: [${updateUserManyNotes.body.data.updateUser.notes
            .map(({ id }) => `"${id}"`)
            .join(',')}] }) {
            id
            content
          }
        }
    `,
          });

          expect(allNotes).toHaveLength(updateUserManyNotes.body.data.updateUser.notes.length);
        })
      );
    });

    describe('with access control', () => {
      describe('read: false on related list', () => {
        test(
          'throws when trying to read after nested create',
          runner(setupKeystone, async ({ server: { server } }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item that does the nested create
            const createUserToNotesNoRead = await graphqlRequest({
              server,
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
          }
      `,
            });

            expect(createUserToNotesNoRead.body).toHaveProperty('errors');
            expect(createUserToNotesNoRead.body.errors).toMatchObject([
              {
                name: 'AccessDeniedError',
                path: ['createUserToNotesNoRead', 'notes'],
              },
            ]);
            expect(createUserToNotesNoRead.body).toHaveProperty(
              'data.createUserToNotesNoRead.notes',
              null
            );
          })
        );

        test(
          'does not throw when create nested from within create mutation',
          runner(setupKeystone, async ({ server: { server } }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item that does the nested create
            const createUserToNotesNoRead = await graphqlRequest({
              server,
              query: `
          mutation {
            createUserToNotesNoRead(data: {
              username: "A thing",
              notes: { create: [{ content: "${noteContent}" }] }
            }) {
              id
            }
          }
      `,
            });

            expect(createUserToNotesNoRead.body).not.toHaveProperty('errors');
          })
        );

        test(
          'does not throw when create nested from within update mutation',
          runner(setupKeystone, async ({ server: { server }, create }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to update
            const createUser = await create('UserToNotesNoRead', {
              username: 'A thing',
            });

            // Update an item that does the nested create
            const updateUserToNotesNoRead = await graphqlRequest({
              server,
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
          }
      `,
            });

            expect(updateUserToNotesNoRead.body).not.toHaveProperty('errors');
          })
        );
      });

      describe('create: false on related list', () => {
        test(
          'throws error when creating nested within create mutation',
          runner(setupKeystone, async ({ server: { server } }) => {
            const userName = sampleOne(alphanumGenerator);
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item that does the nested create
            const createUserToNotesNoCreate = await graphqlRequest({
              server,
              query: `
          mutation {
            createUserToNotesNoCreate(data: {
              username: "${userName}",
              notes: { create: [{ content: "${noteContent}" }] }
            }) {
              id
            }
          }
      `,
            });

            // Assert it throws an access denied error
            expect(createUserToNotesNoCreate.body).toHaveProperty(
              'data.createUserToNotesNoCreate',
              null
            );
            expect(createUserToNotesNoCreate.body.errors).toMatchObject([
              {
                name: 'NestedError',
                data: {
                  errors: [
                    {
                      message:
                        'Unable to create and/or connect 1 UserToNotesNoCreate.notes<NoteNoCreate>',
                      path: ['createUserToNotesNoCreate', 'notes'],
                      name: 'Error',
                    },
                    {
                      path: ['createUserToNotesNoCreate', 'notes', 'create', 0],
                      name: 'AccessDeniedError',
                    },
                  ],
                },
              },
            ]);

            // Confirm it didn't insert either of the records anyway
            const {
              body: {
                data: { allNoteNoCreates, allUserToNotesNoCreates },
              },
            } = await graphqlRequest({
              server,
              query: `
          query {
            allNoteNoCreates(where: { content: "${noteContent}" }) {
              id
              content
            }
            allUserToNotesNoCreates(where: { username: "${userName}" }) {
              id
              username
            }
          }
      `,
            });

            expect(allNoteNoCreates).toMatchObject([]);
            expect(allUserToNotesNoCreates).toMatchObject([]);
          })
        );

        test(
          'throws error when creating nested within update mutation',
          runner(setupKeystone, async ({ server: { server }, create }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to update
            const createUserToNotesNoCreate = await create('UserToNotesNoCreate', {
              username: 'A thing',
            });

            // Update an item that does the nested create
            const updateUserToNotesNoCreate = await graphqlRequest({
              server,
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
          }
      `,
            });

            // Assert it throws an access denied error
            expect(updateUserToNotesNoCreate.body).toHaveProperty(
              'data.updateUserToNotesNoCreate',
              null
            );
            expect(updateUserToNotesNoCreate.body.errors).toMatchObject([
              {
                name: 'NestedError',
                data: {
                  errors: [
                    {
                      message:
                        'Unable to create and/or connect 1 UserToNotesNoCreate.notes<NoteNoCreate>',
                      path: ['updateUserToNotesNoCreate', 'notes'],
                      name: 'Error',
                    },
                    {
                      path: ['updateUserToNotesNoCreate', 'notes', 'create', 0],
                      name: 'AccessDeniedError',
                    },
                  ],
                },
              },
            ]);

            // Confirm it didn't insert the record anyway
            const {
              body: {
                data: { allNoteNoCreates },
              },
            } = await graphqlRequest({
              server,
              query: `
          query {
            allNoteNoCreates(where: { content: "${noteContent}" }) {
              id
              content
            }
          }
      `,
            });

            expect(allNoteNoCreates).toMatchObject([]);
          })
        );
      });
    });
  })
);
