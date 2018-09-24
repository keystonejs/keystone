const { gen, sampleOne } = require('testcheck');

const { Text, Relationship } = require('@voussoir/fields');
const { resolveAllKeys, mapKeys } = require('@voussoir/utils');
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
          createUser(data: { notes: {} }) {
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
              path: ['createUser', 'notes'],
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
    test('throws when link AND create nested from within create mutation', async () => {
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

      expect(createUser.body).toHaveProperty('data.createUserToNotesNoRead', null);
      expect(createUser.body.errors).toMatchObject([
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
    });

    test('throws when link & create nested from within update mutation', async () => {
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
    });
  });
});
