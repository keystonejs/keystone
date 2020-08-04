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
        'create nested from within create mutation',
        runner(setupKeystone, async ({ keystone }) => {
          const noteContent = `a${sampleOne(alphanumGenerator)}`;
          const noteContent2 = `b${sampleOne(alphanumGenerator)}`;
          const noteContent3 = `c${sampleOne(alphanumGenerator)}`;

          // Create an item that does the nested create
          const { data, errors } = await keystone.executeGraphQL({
            query: `
              mutation {
                createUser(data: {
                  username: "A thing",
                  notes: { create: [{ content: "${noteContent}" }] }
                }) {
                  id
                  notes(sortBy: content_ASC) {
                    id
                    content
                  }
                }
              }`,
          });

          expect(errors).toBe(undefined);
          expect(data).toMatchObject({
            createUser: {
              id: expect.any(String),
              notes: [{ id: expect.any(String), content: noteContent }],
            },
          });

          // Create an item that does the nested create
          const {
            data: { createUser },
            errors: errors2,
          } = await keystone.executeGraphQL({
            query: `
              mutation {
                createUser(data: {
                  username: "A thing",
                  notes: {
                    create: [{ content: "${noteContent2}" }, { content: "${noteContent3}" }]
                  }
                }) {
                  id
                  notes(sortBy: content_ASC) {
                    id
                    content
                  }
                }
              }`,
          });
          expect(errors2).toBe(undefined);
          expect(createUser).toMatchObject({
            id: expect.any(String),
            notes: [
              { id: expect.any(String), content: noteContent2 },
              { id: expect.any(String), content: noteContent3 },
            ],
          });

          // Sanity check that the items are actually created
          const {
            data: { allNotes },
            errors: errors3,
          } = await keystone.executeGraphQL({
            query: `
              query {
                allNotes(where: { id_in: [${createUser.notes
                  .map(({ id }) => `"${id}"`)
                  .join(',')}] }) {
                  id
                  content
                }
              }`,
          });
          expect(errors3).toBe(undefined);
          expect(allNotes).toHaveLength(createUser.notes.length);

          // Test an empty list of related notes
          const result = await keystone.executeGraphQL({
            query: `
              mutation {
                createUser(data: {
                  username: "A thing",
                  notes: { create: [] }
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
        'create nested from within update mutation',
        runner(setupKeystone, async ({ keystone }) => {
          const noteContent = `a${sampleOne(alphanumGenerator)}`;
          const noteContent2 = `b${sampleOne(alphanumGenerator)}`;
          const noteContent3 = `c${sampleOne(alphanumGenerator)}`;

          // Create an item to update
          const createUser = await createItem({
            keystone,
            listKey: 'User',
            item: { username: 'A thing' },
          });

          // Update an item that does the nested create
          const { data, errors } = await keystone.executeGraphQL({
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
              }`,
          });
          expect(errors).toBe(undefined);
          expect(data).toMatchObject({
            updateUser: {
              id: expect.any(String),
              notes: [{ id: expect.any(String), content: noteContent }],
            },
          });

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
                      create: [
                        { content: "${noteContent2}" },
                        { content: "${noteContent3}" }
                      ]
                    }
                  }
                ) {
                  id
                  notes(sortBy: content_ASC) {
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
              { id: expect.any(String), content: noteContent },
              { id: expect.any(String), content: noteContent2 },
              { id: expect.any(String), content: noteContent3 },
            ],
          });

          // Sanity check that the items are actually created
          const {
            data: { allNotes },
            errors: errors3,
          } = await keystone.executeGraphQL({
            query: `
              query {
                allNotes(where: { id_in: [${updateUser.notes
                  .map(({ id }) => `"${id}"`)
                  .join(',')}] }) {
                  id
                  content
                }
              }`,
          });
          expect(errors3).toBe(undefined);
          expect(allNotes).toHaveLength(updateUser.notes.length);
        })
      );
    });

    describe('with access control', () => {
      describe('read: false on related list', () => {
        test(
          'throws when trying to read after nested create',
          runner(setupKeystone, async ({ keystone }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item that does the nested create
            const { errors } = await keystone.executeGraphQL({
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
                }`,
            });

            expect(errors).toHaveLength(1);
            const error = errors[0];
            expect(error.message).toEqual('You do not have access to this resource');
            expect(error.path).toHaveLength(2);
            expect(error.path[0]).toEqual('createUserToNotesNoRead');
            expect(error.path[1]).toEqual('notes');
          })
        );

        test(
          'does not throw when create nested from within create mutation',
          runner(setupKeystone, async ({ keystone }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item that does the nested create
            const { errors } = await keystone.executeGraphQL({
              query: `
                mutation {
                  createUserToNotesNoRead(data: {
                    username: "A thing",
                    notes: { create: [{ content: "${noteContent}" }] }
                  }) {
                    id
                  }
                }`,
            });

            expect(errors).toBe(undefined);
          })
        );

        test(
          'does not throw when create nested from within update mutation',
          runner(setupKeystone, async ({ keystone }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to update
            const createUser = await createItem({
              keystone,
              listKey: 'UserToNotesNoRead',
              item: { username: 'A thing' },
            });

            // Update an item that does the nested create
            const { errors } = await keystone.executeGraphQL({
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
                }`,
            });

            expect(errors).toBe(undefined);
          })
        );
      });

      describe('create: false on related list', () => {
        test(
          'throws error when creating nested within create mutation',
          runner(setupKeystone, async ({ keystone }) => {
            const userName = sampleOne(alphanumGenerator);
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item that does the nested create
            const { errors } = await keystone.executeGraphQL({
              query: `
                mutation {
                  createUserToNotesNoCreate(data: {
                    username: "${userName}",
                    notes: { create: [{ content: "${noteContent}" }] }
                  }) {
                    id
                  }
                }`,
            });

            // Assert it throws an access denied error
            expect(errors).toHaveLength(1);
            const error = errors[0];
            expect(error.message).toEqual(
              'Unable to create and/or connect 1 UserToNotesNoCreate.notes<NoteNoCreate>'
            );
            expect(error.path).toHaveLength(1);
            expect(error.path[0]).toEqual('createUserToNotesNoCreate');

            // Confirm it didn't insert either of the records anyway
            const {
              data: { allNoteNoCreates, allUserToNotesNoCreates },
              errors: errors2,
            } = await keystone.executeGraphQL({
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
                }`,
            });
            expect(errors2).toBe(undefined);
            expect(allNoteNoCreates).toMatchObject([]);
            expect(allUserToNotesNoCreates).toMatchObject([]);
          })
        );

        test(
          'throws error when creating nested within update mutation',
          runner(setupKeystone, async ({ keystone }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to update
            const createUserToNotesNoCreate = await createItem({
              keystone,
              listKey: 'UserToNotesNoCreate',
              item: { username: 'A thing' },
            });

            // Update an item that does the nested create
            const { errors } = await keystone.executeGraphQL({
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
                }`,
            });

            // Assert it throws an access denied error
            expect(errors).toHaveLength(1);
            const error = errors[0];
            expect(error.message).toEqual(
              'Unable to create and/or connect 1 UserToNotesNoCreate.notes<NoteNoCreate>'
            );
            expect(error.path).toHaveLength(1);
            expect(error.path[0]).toEqual('updateUserToNotesNoCreate');

            // Confirm it didn't insert the record anyway
            const {
              data: { allNoteNoCreates },
              errors: errors2,
            } = await keystone.executeGraphQL({
              query: `
                query {
                  allNoteNoCreates(where: { content: "${noteContent}" }) {
                    id
                    content
                  }
                }`,
            });
            expect(errors2).toBe(undefined);
            expect(allNoteNoCreates).toMatchObject([]);
          })
        );
      });
    });
  })
);
