const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@keystone-alpha/fields');
const cuid = require('cuid');
const {
  multiAdapterRunners,
  setupServer,
  graphqlRequest,
  networkedGraphqlRequest,
} = require('@keystone-alpha/test-utils');

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
        runner(setupKeystone, async ({ keystone }) => {
          const noteContent = `a${sampleOne(alphanumGenerator)}`;
          const noteContent2 = `b${sampleOne(alphanumGenerator)}`;
          const noteContent3 = `c${sampleOne(alphanumGenerator)}`;

          // Create an item that does the nested create
          const { data, errors } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          createUser(data: {
            username: "A thing",
            notes: { create: [{ content: "${noteContent}" }] }
          }) {
            id
            notes(orderBy: "content_ASC") {
              id
              content
            }
          }
        }
    `,
          });

          expect(errors).toBe(undefined);
          expect(data).toMatchObject({
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
          const {
            data: { createUser },
          } = await graphqlRequest({
            keystone,
            query: `
        mutation {
          createUser(data: {
            username: "A thing",
            notes: {
              create: [{ content: "${noteContent2}" }, { content: "${noteContent3}" }]
            }
          }) {
            id
            notes(orderBy: "content_ASC") {
              id
              content
            }
          }
        }
    `,
          });

          expect(createUser).toMatchObject({
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
          });

          // Sanity check that the items are actually created
          const {
            data: { allNotes },
          } = await graphqlRequest({
            keystone,
            query: `
        query {
          allNotes(where: { id_in: [${createUser.notes.map(({ id }) => `"${id}"`).join(',')}] }) {
            id
            content
          }
        }
    `,
          });

          expect(allNotes).toHaveLength(createUser.notes.length);

          // Test an empty list of related notes
          const result = await graphqlRequest({
            keystone,
            query: `
        mutation {
          createUser(data: {
            username: "A thing",
            notes: { create: [] }
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
        'create nested from within update mutation',
        runner(setupKeystone, async ({ keystone, create }) => {
          const noteContent = `a${sampleOne(alphanumGenerator)}`;
          const noteContent2 = `b${sampleOne(alphanumGenerator)}`;
          const noteContent3 = `c${sampleOne(alphanumGenerator)}`;

          // Create an item to update
          const createUser = await create('User', { username: 'A thing' });

          // Update an item that does the nested create
          const { data } = await graphqlRequest({
            keystone,
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

          const {
            data: { updateUser },
            errors,
          } = await graphqlRequest({
            keystone,
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
            notes(orderBy: "content_ASC") {
              id
              content
            }
          }
        }
    `,
          });

          expect(errors).toBe(undefined);
          expect(updateUser).toMatchObject({
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
                id: expect.any(String),
                content: noteContent3,
              },
            ],
          });

          // Sanity check that the items are actually created
          const {
            data: { allNotes },
          } = await graphqlRequest({
            keystone,
            query: `
        query {
          allNotes(where: { id_in: [${updateUser.notes.map(({ id }) => `"${id}"`).join(',')}] }) {
            id
            content
          }
        }
    `,
          });

          expect(allNotes).toHaveLength(updateUser.notes.length);
        })
      );
    });

    describe('with access control', () => {
      describe('read: false on related list', () => {
        test(
          'throws when trying to read after nested create',
          runner(setupKeystone, async ({ app }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item that does the nested create
            const { errors } = await networkedGraphqlRequest({
              app,
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

            expect(errors).toMatchObject([
              {
                message: 'You do not have access to this resource',
              },
            ]);
          })
        );

        test(
          'does not throw when create nested from within create mutation',
          runner(setupKeystone, async ({ app }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item that does the nested create
            const { errors } = await networkedGraphqlRequest({
              app,
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

            expect(errors).toBe(undefined);
          })
        );

        test(
          'does not throw when create nested from within update mutation',
          runner(setupKeystone, async ({ app, create }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to update
            const createUser = await create('UserToNotesNoRead', {
              username: 'A thing',
            });

            // Update an item that does the nested create
            const { errors } = await networkedGraphqlRequest({
              app,
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

            expect(errors).toBe(undefined);
          })
        );
      });

      describe('create: false on related list', () => {
        test(
          'throws error when creating nested within create mutation',
          runner(setupKeystone, async ({ keystone, app }) => {
            const userName = sampleOne(alphanumGenerator);
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item that does the nested create
            const { errors } = await networkedGraphqlRequest({
              app,
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

            expect(errors).toMatchObject([
              {
                data: {
                  errors: expect.arrayContaining([
                    expect.objectContaining({
                      message:
                        'Unable to create and/or connect 1 UserToNotesNoCreate.notes<NoteNoCreate>',
                    }),
                  ]),
                },
              },
            ]);

            // Confirm it didn't insert either of the records anyway
            const {
              data: { allNoteNoCreates, allUserToNotesNoCreates },
            } = await graphqlRequest({
              keystone,
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
          runner(setupKeystone, async ({ keystone, app, create }) => {
            const noteContent = sampleOne(alphanumGenerator);

            // Create an item to update
            const createUserToNotesNoCreate = await create('UserToNotesNoCreate', {
              username: 'A thing',
            });

            // Update an item that does the nested create
            const { errors } = await networkedGraphqlRequest({
              app,
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
            expect(errors).toMatchObject([
              {
                data: {
                  errors: expect.arrayContaining([
                    expect.objectContaining({
                      message:
                        'Unable to create and/or connect 1 UserToNotesNoCreate.notes<NoteNoCreate>',
                    }),
                  ]),
                },
              },
            ]);

            // Confirm it didn't insert the record anyway
            const {
              data: { allNoteNoCreates },
            } = await graphqlRequest({
              keystone,
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
