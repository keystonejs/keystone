const { gen, sampleOne } = require('testcheck');
const { Text, Relationship } = require('@voussoir/fields');
const cuid = require('cuid');
const { keystoneMongoTest, setupServer, graphqlRequest } = require('@voussoir/test-utils');

const alphanumGenerator = gen.alphaNumString.notEmpty();

function setupKeystone() {
  return setupServer({
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

describe('no access control', () => {
  test(
    'connect nested from within create mutation',
    keystoneMongoTest(setupKeystone, async ({ server: { server }, create }) => {
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
    'connect nested from within update mutation adds to an empty list',
    keystoneMongoTest(setupKeystone, async ({ server: { server }, create }) => {
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
    keystoneMongoTest(setupKeystone, async ({ server: { server }, create }) => {
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
});

describe('non-matching filter', () => {
  test(
    'errors if connecting items which cannot be found during creating',
    keystoneMongoTest(setupKeystone, async ({ server: { server } }) => {
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
    keystoneMongoTest(setupKeystone, async ({ server: { server }, create }) => {
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
      keystoneMongoTest(setupKeystone, async ({ server: { server }, create }) => {
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
                  path: ['createUserToNotesNoRead', 'notes', 'connect', 0],
                  name: 'AccessDeniedError',
                },
              ],
            },
          },
        ]);
      })
    );

    test(
      'throws when link nested from within update mutation',
      keystoneMongoTest(setupKeystone, async ({ server: { server }, create }) => {
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
                  path: ['updateUserToNotesNoRead', 'notes', 'connect', 0],
                  name: 'AccessDeniedError',
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
      keystoneMongoTest(setupKeystone, async ({ server: { server }, create }) => {
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
      keystoneMongoTest(setupKeystone, async ({ server: { server }, create }) => {
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
