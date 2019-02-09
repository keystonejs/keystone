const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@voussoir/fields');
const cuid = require('cuid');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@voussoir/test-utils');

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
        'connect nested from within create mutation',
        runner(setupKeystone, async ({ server: { server }, create }) => {
          const noteContent = sampleOne(alphanumGenerator);

          // Create an item to link against
          const createNote = await create('Note', { content: noteContent });

          // Create an item that does the linking
          const createUserOneNote = await graphqlRequest({
            server,
            query: `
        mutation {
          createUser(data: {
            username: "A thing",
            notes: { connect: [{ id: "${createNote.id}" }] }
          }) {
            id
          }
        }
    `,
          });

          expect(createUserOneNote.body.data).toMatchObject({
            createUser: { id: expect.any(String) },
          });
          expect(createUserOneNote.body).not.toHaveProperty('errors');

          // Create an item that does the linking
          const createUserManyNotes = await graphqlRequest({
            server,
            query: `
        mutation {
          createUser(data: {
            username: "A thing",
            notes: { connect: [{ id: "${createNote.id}" }, { id: "${createNote.id}" }] }
          }) {
            id
          }
        }
    `,
          });

          expect(createUserManyNotes.body.data).toMatchObject({
            createUser: { id: expect.any(String) },
          });
          expect(createUserManyNotes.body).not.toHaveProperty('errors');
        })
      );

      test(
        'connect nested from within create many mutation',
        runner(setupKeystone, async ({ server: { server }, create }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);

          // Create an item to link against
          const createNote = await create('Note', { content: noteContent });
          const createNote2 = await create('Note', { content: noteContent2 });

          // Create an item that does the linking
          const createUsersOneNote = await graphqlRequest({
            server,
            query: `
        mutation {
          createUsers(data: [
            { data: { username: "A thing 1", notes: { connect: [{ id: "${createNote.id}" }] } } },
            { data: { username: "A thing 2", notes: { connect: [{ id: "${createNote2.id}" }] } } }
          ]) {
            id
          }
        }
    `,
          });

          expect(createUsersOneNote.body.data).toMatchObject({
            createUsers: [{ id: expect.any(String) }, { id: expect.any(String) }],
          });
          expect(createUsersOneNote.body).not.toHaveProperty('errors');
        })
      );

      test(
        'connect nested from within update mutation adds to an empty list',
        runner(setupKeystone, async ({ server: { server }, create }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);

          // Create an item to link against
          const createNote = await create('Note', { content: noteContent });
          const createNote2 = await create('Note', { content: noteContent2 });

          // Create an item to update
          const createUser = await create('User', { username: 'A thing' });

          // Update the item and link the relationship field
          const updateUser = await graphqlRequest({
            server,
            query: `
        mutation {
          updateUser(
            id: "${createUser.id}"
            data: {
              username: "A thing",
              notes: { connect: [{ id: "${createNote.id}" }] }
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
          expect(updateUser.body).not.toHaveProperty('errors');

          // Update the item and link multiple relationship fields
          const { body } = await graphqlRequest({
            server,
            query: `
        mutation {
          updateUser(
            id: "${createUser.id}"
            data: {
              username: "A thing",
              notes: {
                connect: [{ id: "${createNote.id}" }, { id: "${createNote2.id}" }]
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

          expect(body.data).toMatchObject({
            updateUser: {
              id: expect.any(String),
              notes: [
                {
                  id: createNote.id,
                  content: noteContent,
                },
                {
                  id: createNote2.id,
                  content: noteContent2,
                },
              ],
            },
          });
          expect(body).not.toHaveProperty('errors');
        })
      );

      test(
        'connect nested from within update mutation adds to an existing list',
        runner(setupKeystone, async ({ server: { server }, create }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);

          // Create an item to link against
          const createNote = await create('Note', { content: noteContent });
          const createNote2 = await create('Note', { content: noteContent2 });

          // Create an item to update
          const createUser = await create('User', { username: 'A thing', notes: [createNote.id] });

          // Update the item and link the relationship field
          const updateUser = await graphqlRequest({
            server,
            query: `
        mutation {
          updateUser(
            id: "${createUser.id}"
            data: {
              username: "A thing",
              notes: { connect: [{ id: "${createNote2.id}" }] }
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

          expect(updateUser.body.data).toMatchObject({
            updateUser: {
              id: expect.any(String),
              notes: [
                {
                  id: createNote.id,
                  content: noteContent,
                },
                {
                  id: createNote2.id,
                  content: noteContent2,
                },
              ],
            },
          });
          expect(updateUser.body).not.toHaveProperty('errors');
        })
      );

      test(
        'connect nested from within update many mutation adds to an existing list',
        runner(setupKeystone, async ({ server: { server }, create }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);

          // Create an item to link against
          const createNote = await create('Note', { content: noteContent });
          const createNote2 = await create('Note', { content: noteContent2 });

          // Create an item to update
          const createUser = await create('User', {
            username: 'user1',
            notes: [createNote.id, createNote2.id],
          });
          const createUser2 = await create('User', { username: 'user2', notes: [] });

          const updateUsers = await graphqlRequest({
            server,
            query: `
        mutation {
          updateUsers(data: [
          { id: "${createUser.id}", data: { notes: { disconnectAll: true, connect: [{ id: "${
              createNote.id
            }" }] } } },
          { id: "${createUser2.id}", data: { notes: { disconnectAll: true, connect: [{ id: "${
              createNote2.id
            }" }] } } },
        ]) {
          id
          notes {
            id
            content
          }
        }
      }`,
          });
          expect(updateUsers.body.data).toMatchObject({
            updateUsers: [
              {
                id: expect.any(String),
                notes: [
                  {
                    id: createNote.id,
                    content: noteContent,
                  },
                ],
              },
              {
                id: expect.any(String),
                notes: [
                  {
                    id: createNote2.id,
                    content: noteContent2,
                  },
                ],
              },
            ],
          });
          expect(updateUsers.body).not.toHaveProperty('errors');
        })
      );
    });

    describe('non-matching filter', () => {
      test(
        'errors if connecting items which cannot be found during creating',
        runner(setupKeystone, async ({ server: { server } }) => {
          const FAKE_ID = '5b84f38256d3c2df59a0d9bf';

          // Create an item that does the linking
          const createUser = await graphqlRequest({
            server,
            query: `
        mutation {
          createUser(data: {
            notes: {
              connect: [{ id: "${FAKE_ID}" }]
            }
          }) {
            id
          }
        }
    `,
          });

          expect(createUser.body).toHaveProperty('data.createUser', null);
          expect(createUser.body.errors).toMatchObject([
            {
              name: 'NestedError',
              data: {
                errors: [
                  {
                    message: 'Unable to create and/or connect 1 User.notes<Note>',
                    path: ['createUser', 'notes'],
                    name: 'Error',
                  },
                  {
                    name: 'AccessDeniedError',
                    path: ['createUser', 'notes', 'connect', 0],
                  },
                ],
              },
            },
          ]);
        })
      );

      test(
        'errors if connecting items which cannot be found during update',
        runner(setupKeystone, async ({ server: { server }, create }) => {
          const FAKE_ID = '5b84f38256d3c2df59a0d9bf';

          // Create an item to link against
          const createUser = await create('User', {});

          // Create an item that does the linking
          const updateUser = await graphqlRequest({
            server,
            query: `
        mutation {
          updateUser(
            id: "${createUser.id}",
            data: {
              notes: {
                connect: [{ id: "${FAKE_ID}" }]
              }
            }
          ) {
            id
          }
        }
    `,
          });

          expect(updateUser.body).toHaveProperty('data.updateUser', null);
          expect(updateUser.body.errors).toMatchObject([
            {
              name: 'NestedError',
              data: {
                errors: [
                  {
                    message: 'Unable to create and/or connect 1 User.notes<Note>',
                    path: ['updateUser', 'notes'],
                    name: 'Error',
                  },
                  {
                    name: 'AccessDeniedError',
                    path: ['updateUser', 'notes', 'connect', 0],
                  },
                ],
              },
            },
          ]);
        })
      );
    });

    describe('with access control', () => {
      describe('read: false on related list', () => {
        test(
          'throws when link nested from within create mutation',
          runner(setupKeystone, async ({ server: { server }, create }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNoteNoRead = await create('NoteNoRead', {
              content: noteContent,
            });

            // Create an item that does the linking
            const createUserOneNote = await graphqlRequest({
              server,
              query: `
          mutation {
            createUserToNotesNoRead(data: {
              username: "A thing",
              notes: { connect: [{ id: "${createNoteNoRead.id}" }] }
            }) {
              id
            }
          }
      `,
            });

            expect(createUserOneNote.body).toHaveProperty('data.createUserToNotesNoRead', null);
            expect(createUserOneNote.body.errors).toMatchObject([
              {
                name: 'NestedError',
                data: {
                  errors: [
                    {
                      message:
                        'Unable to create and/or connect 1 UserToNotesNoRead.notes<NoteNoRead>',
                      path: ['createUserToNotesNoRead', 'notes'],
                      name: 'Error',
                    },
                    {
                      name: 'AccessDeniedError',
                      path: ['createUserToNotesNoRead', 'notes', 'connect', 0],
                    },
                  ],
                },
              },
            ]);
          })
        );

        test(
          'throws when link nested from within update mutation',
          runner(setupKeystone, async ({ server: { server }, create }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNote = await create('NoteNoRead', { content: noteContent });

            // Create an item to update
            const createUser = await create('UserToNotesNoRead', {
              username: 'A thing',
            });

            // Update the item and link the relationship field
            const { body } = await graphqlRequest({
              server,
              query: `
          mutation {
            updateUserToNotesNoRead(
              id: "${createUser.id}"
              data: {
                username: "A thing",
                notes: { connect: [{ id: "${createNote.id}" }] }
              }
            ) {
              id
            }
          }
      `,
            });

            expect(body).toHaveProperty('data.updateUserToNotesNoRead', null);
            expect(body.errors).toMatchObject([
              {
                name: 'NestedError',
                data: {
                  errors: [
                    {
                      message:
                        'Unable to create and/or connect 1 UserToNotesNoRead.notes<NoteNoRead>',
                      path: ['updateUserToNotesNoRead', 'notes'],
                      name: 'Error',
                    },
                    {
                      name: 'AccessDeniedError',
                      path: ['updateUserToNotesNoRead', 'notes', 'connect', 0],
                    },
                  ],
                },
              },
            ]);
          })
        );
      });

      describe('create: false on related list', () => {
        test(
          'does not throw when link nested from within create mutation',
          runner(setupKeystone, async ({ server: { server }, create }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNoteNoCreate = await create('NoteNoCreate', {
              content: noteContent,
            });

            // Create an item that does the linking
            const createUserOneNote = await graphqlRequest({
              server,
              query: `
          mutation {
            createUserToNotesNoCreate(data: {
              username: "A thing",
              notes: { connect: [{ id: "${createNoteNoCreate.id}" }] }
            }) {
              id
            }
          }
      `,
            });

            expect(createUserOneNote.body).not.toHaveProperty('errors');
          })
        );

        test(
          'does not throw when link nested from within update mutation',
          runner(setupKeystone, async ({ server: { server }, create }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNote = await create('NoteNoCreate', { content: noteContent });

            // Create an item to update
            const createUser = await create('UserToNotesNoCreate', {
              username: 'A thing',
            });

            // Update the item and link the relationship field
            const { body } = await graphqlRequest({
              server,
              query: `
          mutation {
            updateUserToNotesNoCreate(
              id: "${createUser.id}"
              data: {
                username: "A thing",
                notes: {
                  connect: [{id: "${createNote.id}" }]
                }
              }
            ) {
              id
            }
          }
      `,
            });

            expect(body).not.toHaveProperty('errors');
          })
        );
      });
    });
  })
);
