const { gen, sampleOne } = require('testcheck');

const { Text, Relationship } = require('@keystonejs/fields');
const { resolveAllKeys, mapKeys } = require('@keystonejs/utils');
const cuid = require('cuid');

const { setupServer, graphqlRequest } = require('../../util');

const alphanumGenerator = gen.alphaNumString.notEmpty();

let server;

beforeAll(() => {
  server = setupServer({
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

  server.keystone.connect();
});

function create(list, item) {
  return server.keystone.getListByKey(list).adapter.create(item);
}

afterAll(async () => {
  // clean the db
  await resolveAllKeys(mapKeys(server.keystone.adapters, adapter => adapter.dropDatabase()));
  // then shut down
  await resolveAllKeys(
    mapKeys(server.keystone.adapters, adapter => adapter.dropDatabase().then(() => adapter.close()))
  );
});

beforeEach(() =>
  // clean the db
  resolveAllKeys(mapKeys(server.keystone.adapters, adapter => adapter.dropDatabase())));

describe('no access control', () => {
  test('link nested from within create mutation', async () => {
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
            notes: [{ id: "${createNote.id}" }]
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
            notes: [{ id: "${createNote.id}" }, { id: "${createNote.id}" }]
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
  });

  test('create nested from within create mutation', async () => {
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
            notes: [{ create: { content: "${noteContent}" } }]
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
            notes: [{ create: { content: "${noteContent2}" } }, { create: { content: "${noteContent3}" } }]
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
  });

  test('link AND create nested from within create mutation', async () => {
    const noteContent = sampleOne(alphanumGenerator);
    const noteContent2 = sampleOne(alphanumGenerator);

    // Create an item to link against
    const createNote = await create('Note', { content: noteContent });

    // Create an item that does the linking
    const createUser = await graphqlRequest({
      server,
      query: `
        mutation {
          createUser(data: {
            username: "A thing",
            notes: [{ id: "${createNote.id}" }, { create: { content: "${noteContent2}" } }]
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

    expect(createUser.body.data).toMatchObject({
      createUser: {
        id: expect.any(String),
        notes: [
          { id: expect.any(String), content: noteContent },
          { id: expect.any(String), content: noteContent2 },
        ],
      },
    });
    expect(createUser.body).not.toHaveProperty('errors');

    // Sanity check that the items are actually created
    const {
      body: {
        data: { allNotes },
      },
    } = await graphqlRequest({
      server,
      query: `
        query {
          allNotes(where: { id_in: [${createUser.body.data.createUser.notes
            .map(({ id }) => `"${id}"`)
            .join(',')}] }) {
            id
            content
          }
        }
    `,
    });

    expect(allNotes).toHaveLength(createUser.body.data.createUser.notes.length);
  });

  test('link nested from within update mutation', async () => {
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
              notes: [{ id: "${createNote.id}" }]
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
              notes: [{ id: "${createNote.id}" }, { id: "${createNote2.id}" }]
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
  });

  test('create nested from within update mutation', async () => {
    const noteContent = sampleOne(alphanumGenerator);
    const noteContent2 = sampleOne(alphanumGenerator);

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
              notes: [{ create: { content: "${noteContent}" } }]
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
              notes: [{ create: { content: "${noteContent}" } }, { create: { content: "${noteContent2}" } }]
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
  });

  test('link & create nested from within update mutation', async () => {
    const noteContent = sampleOne(alphanumGenerator);
    const noteContent2 = sampleOne(alphanumGenerator);

    // Create an item to link against
    const createNote = await create('Note', { content: noteContent });

    // Create an item to update
    const createUser = await create('User', { username: 'A thing' });

    // Update the item and link the relationship field
    const { body } = await graphqlRequest({
      server,
      query: `
        mutation {
          updateUser(
            id: "${createUser.id}"
            data: {
              username: "A thing",
              notes: [{ id: "${createNote.id}" }, { create: { content: "${noteContent2}" } }]
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
            id: expect.any(String),
            content: noteContent2,
          },
        ],
      },
    });
    expect(body).not.toHaveProperty('errors');

    // Sanity check that the items are actually created
    const {
      body: {
        data: { allNotes },
      },
    } = await graphqlRequest({
      server,
      query: `
        query {
          allNotes(where: { id_in: [${body.data.updateUser.notes
            .map(({ id }) => `"${id}"`)
            .join(',')}] }) {
            id
            content
          }
        }
    `,
    });

    expect(allNotes).toHaveLength(body.data.updateUser.notes.length);
  });
});

describe('errors on incomplete data', () => {
  test('when neither id or create data passed', async () => {
    // Create an item that does the linking
    const createUser = await graphqlRequest({
      server,
      query: `
        mutation {
          createUser(data: { notes: [{}] }) {
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
              path: ['createUser', 'notes', 0],
              name: 'ParameterError',
            },
          ],
        },
      },
    ]);
  });

  test('when neither id or create data passed for only some', async () => {
    // Create an item that does the linking
    const createUser = await graphqlRequest({
      server,
      query: `
        mutation {
          createUser(data: { notes: [
            { create: { content: "foo" } },
            {}
          ] }) {
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
              path: ['createUser', 'notes', 1],
              name: 'ParameterError',
            },
          ],
        },
      },
    ]);
  });

  test('when both id and create data passed', async () => {
    // Create an item that does the linking
    const createUser = await graphqlRequest({
      server,
      query: `
        mutation {
          createUser(data: { notes: [{ id: "abc123", create: { content: "foo" } }] }) {
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
              path: ['createUser', 'notes', 0],
              name: 'ParameterError',
            },
          ],
        },
      },
    ]);
  });

  test('when both id and create data passed for only some', async () => {
    // Create an item that does the linking
    const createUser = await graphqlRequest({
      server,
      query: `
        mutation {
          createUser(data: { notes: [
            { create: { content: "bar" } },
            { id: "abc123", create: { content: "foo" } }
          ] }) {
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
              path: ['createUser', 'notes', 1],
              name: 'ParameterError',
            },
          ],
        },
      },
    ]);
  });
});

describe('with access control', () => {
  describe('read: false on related list', () => {
    test('does not throw when link nested from within create mutation', async () => {
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
              notes: [{ id: "${createNoteNoRead.id}" }]
            }) {
              id
            }
          }
      `,
      });

      expect(createUserOneNote.body).not.toHaveProperty('errors');
    });

    test('throws when trying to read after nested create', async () => {
      const noteContent = sampleOne(alphanumGenerator);

      // Create an item that does the nested create
      const createUserToNotesNoRead = await graphqlRequest({
        server,
        query: `
          mutation {
            createUserToNotesNoRead(data: {
              username: "A thing",
              notes: [{ create: { content: "${noteContent}" } }]
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
    });

    test('does not throw when create nested from within create mutation', async () => {
      const noteContent = sampleOne(alphanumGenerator);

      // Create an item that does the nested create
      const createUserToNotesNoRead = await graphqlRequest({
        server,
        query: `
          mutation {
            createUserToNotesNoRead(data: {
              username: "A thing",
              notes: [{ create: { content: "${noteContent}" } }]
            }) {
              id
            }
          }
      `,
      });

      expect(createUserToNotesNoRead.body).not.toHaveProperty('errors');
    });

    test('does not throw when link AND create nested from within create mutation', async () => {
      const noteContent = sampleOne(alphanumGenerator);
      const noteContent2 = sampleOne(alphanumGenerator);

      // Create an item to link against
      const createNoteNoRead = await create('NoteNoRead', {
        content: noteContent,
      });

      // Create an item that does the linking
      const createUser = await graphqlRequest({
        server,
        query: `
          mutation {
            createUserToNotesNoRead(data: {
              username: "A thing",
              notes: [{ id: "${createNoteNoRead.id}" }, { create: { content: "${noteContent2}" } }]
            }) {
              id
            }
          }
      `,
      });

      expect(createUser.body).not.toHaveProperty('errors');
    });

    test('does not throw when link nested from within update mutation', async () => {
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
                notes: [{ id: "${createNote.id}" }]
              }
            ) {
              id
            }
          }
      `,
      });

      expect(body).not.toHaveProperty('errors');
    });

    test('does not throw when create nested from within update mutation', async () => {
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
                notes: [{ create: { content: "${noteContent}" } }]
              }
            ) {
              id
            }
          }
      `,
      });

      expect(updateUserToNotesNoRead.body).not.toHaveProperty('errors');
    });

    test('does not throw when link & create nested from within update mutation', async () => {
      const noteContent = sampleOne(alphanumGenerator);
      const noteContent2 = sampleOne(alphanumGenerator);

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
                notes: [{ id: "${createNote.id}" }, { create: { content: "${noteContent2}" } }]
              }
            ) {
              id
            }
          }
      `,
      });

      expect(body).not.toHaveProperty('errors');
    });
  });

  describe('create: false on related list', () => {
    test('does not throw when link nested from within create mutation', async () => {
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
              notes: [{ id: "${createNoteNoCreate.id}" }]
            }) {
              id
            }
          }
      `,
      });

      expect(createUserOneNote.body).not.toHaveProperty('errors');
    });

    test('throws error when creating nested within create mutation', async () => {
      const userName = sampleOne(alphanumGenerator);
      const noteContent = sampleOne(alphanumGenerator);

      // Create an item that does the nested create
      const createUserToNotesNoCreate = await graphqlRequest({
        server,
        query: `
          mutation {
            createUserToNotesNoCreate(data: {
              username: "${userName}",
              notes: [{ create: { content: "${noteContent}" } }]
            }) {
              id
            }
          }
      `,
      });

      // Assert it throws an access denied error
      expect(createUserToNotesNoCreate.body).toHaveProperty('data.createUserToNotesNoCreate', null);
      expect(createUserToNotesNoCreate.body.errors).toMatchObject([
        {
          name: 'NestedError',
          data: {
            errors: [
              {
                path: ['createUserToNotesNoCreate', 'notes', 0, 'create'],
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
    });

    test('does not throw when link nested from within update mutation', async () => {
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
                notes: [{ id: "${createNote.id}" }]
              }
            ) {
              id
            }
          }
      `,
      });

      expect(body).not.toHaveProperty('errors');
    });

    test('throws error when creating nested within update mutation', async () => {
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
      expect(updateUserToNotesNoCreate.body).toHaveProperty('data.updateUserToNotesNoCreate', null);
      expect(updateUserToNotesNoCreate.body.errors).toMatchObject([
        {
          name: 'NestedError',
          data: {
            errors: [
              {
                path: ['updateUserToNotesNoCreate', 'notes', 0, 'create'],
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
    });
  });
});
