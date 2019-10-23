const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystone/fields');
const cuid = require('cuid');
const {
  multiAdapterRunners,
  setupServer,
  graphqlRequest,
  networkedGraphqlRequest,
} = require('@keystone/test-utils');

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
        runner(setupKeystone, async ({ keystone, create }) => {
          const noteContent = sampleOne(alphanumGenerator);

          // Create an item to link against
          const createNote = await create('Note', { content: noteContent });

          // Create an item that does the linking
          const { data, errors } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          createUser(data: {
            username: "A thing",
            notes: { connect: [{ id: "${createNote.id}" }] }
          }) {
            id
            notes { id }
          }
        }
    `,
          });

          expect(data).toMatchObject({
            createUser: { id: expect.any(String), notes: expect.any(Array) },
          });
          expect(errors).toBe(undefined);

          // Create an item that does the linking
          const {
            data: { createUser },
          } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          createUser(data: {
            username: "A thing",
            notes: { connect: [{ id: "${createNote.id}" }, { id: "${createNote.id}" }] }
          }) {
            id
            notes { id }
          }
        }
    `,
          });

          expect(createUser).toMatchObject({
            id: expect.any(String),
            notes: expect.any(Array),
          });

          // Test an empty list of related notes
          const result = await graphqlRequest({
            keystone,
            query: `
        mutation {
          createUser(data: {
            username: "A thing",
            notes: { connect: [] }
          }) {
            id
            notes { id }
          }
        }
    `,
          });
          expect(result.data.createUser).toMatchObject({
            id: expect.any(String),
            notes: [],
          });
        })
      );

      test(
        'connect nested from within create many mutation',
        runner(setupKeystone, async ({ keystone, create }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);

          // Create an item to link against
          const createNote = await create('Note', { content: noteContent });
          const createNote2 = await create('Note', { content: noteContent2 });

          // Create an item that does the linking
          const { data, errors } = await graphqlRequest({
            keystone,
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

          expect(data).toMatchObject({
            createUsers: [{ id: expect.any(String) }, { id: expect.any(String) }],
          });
          expect(errors).toBe(undefined);
        })
      );

      test(
        'connect nested from within update mutation adds to an empty list',
        runner(setupKeystone, async ({ keystone, create }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);

          // Create an item to link against
          const createNote = await create('Note', { content: noteContent });
          const createNote2 = await create('Note', { content: noteContent2 });

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

          expect(data).toMatchObject({
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
          expect(errors).toBe(undefined);

          // Update the item and link multiple relationship fields
          const {
            data: { updateUser },
          } = await graphqlRequest({
            keystone,
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

          expect(updateUser).toMatchObject({
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
          });
        })
      );

      test(
        'connect nested from within update mutation adds to an existing list',
        runner(setupKeystone, async ({ keystone, create }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);

          // Create an item to link against
          const createNote = await create('Note', { content: noteContent });
          const createNote2 = await create('Note', { content: noteContent2 });

          // Create an item to update
          const createUser = await create('User', { username: 'A thing', notes: [createNote.id] });

          // Update the item and link the relationship field
          const { data, errors } = await graphqlRequest({
            keystone,
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

          expect(data).toMatchObject({
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
          expect(errors).toBe(undefined);
        })
      );

      test(
        'connect nested from within update many mutation adds to an existing list',
        runner(setupKeystone, async ({ keystone, create }) => {
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

          const { data, errors } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          updateUsers(data: [
          { id: "${createUser.id}", data: { notes: { disconnectAll: true, connect: [{ id: "${createNote.id}" }] } } },
          { id: "${createUser2.id}", data: { notes: { disconnectAll: true, connect: [{ id: "${createNote2.id}" }] } } },
        ]) {
          id
          notes {
            id
            content
          }
        }
      }`,
          });
          expect(data).toMatchObject({
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
          expect(errors).toBe(undefined);
        })
      );
    });

    describe('non-matching filter', () => {
      test(
        'errors if connecting items which cannot be found during creating',
        runner(setupKeystone, async ({ keystone }) => {
          const FAKE_ID = adapterName === 'mongoose' ? '5b84f38256d3c2df59a0d9bf' : 100;

          // Create an item that does the linking
          const { errors } = await graphqlRequest({
            keystone,
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

          expect(errors).toMatchObject([
            {
              message: 'Unable to create and/or connect 1 User.notes<Note>',
            },
          ]);
        })
      );

      test(
        'errors if connecting items which cannot be found during update',
        runner(setupKeystone, async ({ keystone, create }) => {
          const FAKE_ID = adapterName === 'mongoose' ? '5b84f38256d3c2df59a0d9bf' : 100;

          // Create an item to link against
          const createUser = await create('User', {});

          // Create an item that does the linking
          const { errors } = await graphqlRequest({
            keystone,
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

          expect(errors).toMatchObject([
            {
              message: 'Unable to create and/or connect 1 User.notes<Note>',
            },
          ]);
        })
      );
    });

    describe('with access control', () => {
      describe('read: false on related list', () => {
        test(
          'throws when link nested from within create mutation',
          runner(setupKeystone, async ({ app, create }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNoteNoRead = await create('NoteNoRead', {
              content: noteContent,
            });

            const { errors } = await networkedGraphqlRequest({
              app,
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

            expect(errors).toMatchObject([
              {
                data: {
                  errors: expect.arrayContaining([
                    expect.objectContaining({
                      message:
                        'Unable to create and/or connect 1 UserToNotesNoRead.notes<NoteNoRead>',
                    }),
                  ]),
                },
              },
            ]);
          })
        );

        test(
          'throws when link nested from within update mutation',
          runner(setupKeystone, async ({ app, create }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNote = await create('NoteNoRead', { content: noteContent });

            // Create an item to update
            const createUser = await create('UserToNotesNoRead', {
              username: 'A thing',
            });

            // Update the item and link the relationship field
            const { errors } = await networkedGraphqlRequest({
              app,
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

            expect(errors).toMatchObject([
              {
                data: {
                  errors: expect.arrayContaining([
                    expect.objectContaining({
                      message:
                        'Unable to create and/or connect 1 UserToNotesNoRead.notes<NoteNoRead>',
                    }),
                  ]),
                },
              },
            ]);
          })
        );
      });

      describe('create: false on related list', () => {
        test(
          'does not throw when link nested from within create mutation',
          runner(setupKeystone, async ({ app, create }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNoteNoCreate = await create('NoteNoCreate', {
              content: noteContent,
            });

            // Create an item that does the linking
            const { data, errors } = await networkedGraphqlRequest({
              app,
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

            expect(errors).toBe(undefined);
            expect(data.createUserToNotesNoCreate).toMatchObject({ id: expect.any(String) });
          })
        );

        test(
          'does not throw when link nested from within update mutation',
          runner(setupKeystone, async ({ app, create }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNote = await create('NoteNoCreate', { content: noteContent });

            // Create an item to update
            const createUser = await create('UserToNotesNoCreate', {
              username: 'A thing',
            });

            // Update the item and link the relationship field
            const { data, errors } = await networkedGraphqlRequest({
              app,
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

            expect(errors).toBe(undefined);
            expect(data.updateUserToNotesNoCreate).toMatchObject({ id: expect.any(String) });
          })
        );
      });
    });
  })
);
