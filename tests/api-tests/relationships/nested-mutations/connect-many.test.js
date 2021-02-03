const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');
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
        'connect nested from within create mutation',
        runner(setupKeystone, async ({ keystone }) => {
          const noteContent = sampleOne(alphanumGenerator);

          // Create an item to link against
          const createNote = await createItem({
            keystone,
            listKey: 'Note',
            item: { content: noteContent },
          });

          // Create an item that does the linking
          const { data, errors } = await keystone.executeGraphQL({
            query: `
              mutation {
                createUser(data: {
                  username: "A thing",
                  notes: { connect: [{ id: "${createNote.id}" }] }
                }) {
                  id
                  notes { id }
                }
              }`,
          });

          expect(data).toMatchObject({
            createUser: { id: expect.any(String), notes: expect.any(Array) },
          });
          expect(errors).toBe(undefined);

          // Create an item that does the linking
          const {
            data: { createUser },
            errors: errors2,
          } = await keystone.executeGraphQL({
            query: `
              mutation {
                createUser(data: {
                  username: "A thing",
                  notes: { connect: [{ id: "${createNote.id}" }, { id: "${createNote.id}" }] }
                }) {
                  id
                  notes { id }
                }
              }`,
          });
          expect(errors2).toBe(undefined);
          expect(createUser).toMatchObject({ id: expect.any(String), notes: expect.any(Array) });

          // Test an empty list of related notes
          const result = await keystone.executeGraphQL({
            query: `
              mutation {
                createUser(data: {
                  username: "A thing",
                  notes: { connect: [] }
                }) {
                  id
                  notes { id }
                }
              }`,
          });
          expect(result.errors).toBe(undefined);
          expect(result.data.createUser).toMatchObject({ id: expect.any(String), notes: [] });
        })
      );

      test(
        'connect nested from within create many mutation',
        runner(setupKeystone, async ({ keystone }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);

          // Create an item to link against
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

          // Create an item that does the linking
          const { data, errors } = await keystone.executeGraphQL({
            query: `
              mutation {
                createUsers(data: [
                  { data: { username: "A thing 1", notes: { connect: [{ id: "${createNote.id}" }] } } },
                  { data: { username: "A thing 2", notes: { connect: [{ id: "${createNote2.id}" }] } } }
                ]) {
                  id
                }
              }`,
          });

          expect(data).toMatchObject({
            createUsers: [{ id: expect.any(String) }, { id: expect.any(String) }],
          });
          expect(errors).toBe(undefined);
        })
      );

      test(
        'connect nested from within update mutation adds to an empty list',
        runner(setupKeystone, async ({ keystone }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);

          // Create an item to link against
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
            item: { username: 'A thing' },
          });

          // Update the item and link the relationship field
          const { data, errors } = await keystone.executeGraphQL({
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
              }`,
          });

          expect(data).toMatchObject({
            updateUser: {
              id: expect.any(String),
              notes: [{ id: expect.any(String), content: noteContent }],
            },
          });
          expect(errors).toBe(undefined);

          // Update the item and link multiple relationship fields
          const {
            data: { updateUser },
            errors: errors2,
          } = await keystone.executeGraphQL({
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
              }`,
          });
          expect(errors2).toBe(undefined);
          expect(updateUser).toMatchObject({
            id: expect.any(String),
            notes: [
              { id: createNote.id, content: noteContent },
              { id: createNote2.id, content: noteContent2 },
            ],
          });
        })
      );

      test(
        'connect nested from within update mutation adds to an existing list',
        runner(setupKeystone, async ({ keystone }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);

          // Create an item to link against
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
            item: { username: 'A thing', notes: { connect: [{ id: createNote.id }] } },
          });

          // Update the item and link the relationship field
          const { data, errors } = await keystone.executeGraphQL({
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
              }`,
          });

          expect(data).toMatchObject({
            updateUser: {
              id: expect.any(String),
              notes: [
                { id: createNote.id, content: noteContent },
                { id: createNote2.id, content: noteContent2 },
              ],
            },
          });
          expect(errors).toBe(undefined);
        })
      );

      test(
        'connect nested from within update many mutation adds to an existing list',
        runner(setupKeystone, async ({ keystone }) => {
          const noteContent = sampleOne(alphanumGenerator);
          const noteContent2 = sampleOne(alphanumGenerator);

          // Create an item to link against
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
              username: 'user1',
              notes: { connect: [{ id: createNote.id }, { id: createNote2.id }] },
            },
          });
          const createUser2 = await createItem({
            keystone,
            listKey: 'User',
            item: { username: 'user2' },
          });

          const { data, errors } = await keystone.executeGraphQL({
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
              { id: expect.any(String), notes: [{ id: createNote.id, content: noteContent }] },
              { id: expect.any(String), notes: [{ id: createNote2.id, content: noteContent2 }] },
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
          const { errors } = await keystone.executeGraphQL({
            query: `
              mutation {
                createUser(data: {
                  notes: {
                    connect: [{ id: "${FAKE_ID}" }]
                  }
                }) {
                  id
                }
              }`,
          });

          expect(errors).toMatchObject([
            { message: 'Unable to create and/or connect 1 User.notes<Note>' },
          ]);
        })
      );

      test(
        'errors if connecting items which cannot be found during update',
        runner(setupKeystone, async ({ keystone }) => {
          const FAKE_ID = adapterName === 'mongoose' ? '5b84f38256d3c2df59a0d9bf' : 100;

          // Create an item to link against
          const createUser = await createItem({ keystone, listKey: 'User', item: {} });

          // Create an item that does the linking
          const { errors } = await keystone.executeGraphQL({
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
              }`,
          });

          expect(errors).toMatchObject([
            { message: 'Unable to create and/or connect 1 User.notes<Note>' },
          ]);
        })
      );
    });

    describe('with access control', () => {
      describe('read: false on related list', () => {
        test(
          'throws when link nested from within create mutation',
          runner(setupKeystone, async ({ keystone }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNoteNoRead = await createItem({
              keystone,
              listKey: 'NoteNoRead',
              item: { content: noteContent },
            });

            const { errors } = await keystone.executeGraphQL({
              query: `
                mutation {
                  createUserToNotesNoRead(data: {
                    username: "A thing",
                    notes: { connect: [{ id: "${createNoteNoRead.id}" }] }
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
          'throws when link nested from within update mutation',
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
              item: { username: 'A thing' },
            });

            // Update the item and link the relationship field
            const { errors } = await keystone.executeGraphQL({
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

      describe('create: false on related list', () => {
        test(
          'does not throw when link nested from within create mutation',
          runner(setupKeystone, async ({ keystone }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNoteNoCreate = await createItem({
              keystone,
              listKey: 'NoteNoCreate',
              item: { content: noteContent },
            });

            // Create an item that does the linking
            const { data, errors } = await keystone.executeGraphQL({
              query: `
                mutation {
                  createUserToNotesNoCreate(data: {
                    username: "A thing",
                    notes: { connect: [{ id: "${createNoteNoCreate.id}" }] }
                  }) {
                    id
                  }
                }`,
            });

            expect(errors).toBe(undefined);
            expect(data.createUserToNotesNoCreate).toMatchObject({ id: expect.any(String) });
          })
        );

        test(
          'does not throw when link nested from within update mutation',
          runner(setupKeystone, async ({ keystone }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to link against
            const createNote = await createItem({
              keystone,
              listKey: 'NoteNoCreate',
              item: { content: noteContent },
            });

            // Create an item to update
            const createUser = await createItem({
              keystone,
              listKey: 'UserToNotesNoCreate',
              item: { username: 'A thing' },
            });

            // Update the item and link the relationship field
            const { data, errors } = await keystone.executeGraphQL({
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
                }`,
            });

            expect(errors).toBe(undefined);
            expect(data.updateUserToNotesNoCreate).toMatchObject({ id: expect.any(String) });
          })
        );
      });
    });
  })
);
