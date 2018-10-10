const { gen, sampleOne } = require('testcheck');

const { Text, Relationship } = require('@voussoir/fields');
const cuid = require('cuid');

const { keystoneMongoTest, setupServer, graphqlRequest } = require('../../util');

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
    'removes matched items from list',
    keystoneMongoTest(setupKeystone, async ({ server, create }) => {
      const noteContent = `foo${sampleOne(alphanumGenerator)}`;
      const noteContent2 = `foo${sampleOne(alphanumGenerator)}`;

      // Create two items with content that can be matched
      const createNote = await create('Note', { content: noteContent });
      const createNote2 = await create('Note', { content: noteContent2 });

      // Create an item to update
      const createUser = await create('User', {
        username: 'A thing',
        notes: [createNote.id, createNote2.id],
      });

      // Update the item and link the relationship field
      const updateUser = await graphqlRequest({
        server,
        query: `
        mutation {
          updateUser(
            id: "${createUser.id}"
            data: {
              username: "A thing",
              notes: { disconnect: [{ id: "${createNote2.id}" }] }
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
          ],
        },
      });
      expect(updateUser.body).not.toHaveProperty('errors');
    })
  );

  test(
    'silently succeeds if used during create',
    keystoneMongoTest(setupKeystone, async ({ server }) => {
      const FAKE_ID = '5b84f38256d3c2df59a0d9bf';

      // Create an item that does the linking
      const {
        body: { data },
      } = await graphqlRequest({
        server,
        query: `
        mutation {
          createUser(data: {
            notes: {
              disconnect: [{ id: "${FAKE_ID}" }]
            }
          }) {
            id
            notes {
              id
            }
          }
        }
    `,
      });

      expect(data.createUser).toMatchObject({
        id: expect.any(String),
        notes: [],
      });
      expect(data.createUser).not.toHaveProperty('errors');
    })
  );
});

describe('non-matching filter', () => {
  test(
    'silently succeeds if items to disconnect cannot be found during update',
    keystoneMongoTest(setupKeystone, async ({ server, create }) => {
      const FAKE_ID = '5b84f38256d3c2df59a0d9bf';

      // Create an item to link against
      const createUser = await create('User', {});

      // Create an item that does the linking
      const {
        body: { data },
      } = await graphqlRequest({
        server,
        query: `
        mutation {
          updateUser(
            id: "${createUser.id}",
            data: {
              notes: {
                disconnect: [{ id: "${FAKE_ID}" }]
              }
            }
          ) {
            id
            notes {
             id
           }
          }
        }
    `,
      });

      expect(data.updateUser).toMatchObject({
        id: expect.any(String),
        notes: [],
      });
      expect(data.updateUser).not.toHaveProperty('errors');
    })
  );

  test(
    'removes items that match, silently ignores those that do not',
    keystoneMongoTest(setupKeystone, async ({ server, create }) => {
      const FAKE_ID = '5b84f38256d3c2df59a0d9bf';
      const noteContent = sampleOne(alphanumGenerator);
      const noteContent2 = sampleOne(alphanumGenerator);

      // Create an item to link against
      const createNote = await create('Note', { content: noteContent });
      const createNote2 = await create('Note', { content: noteContent2 });

      // Create an item to update
      const createUser = await create('User', {
        username: 'A thing',
        notes: [createNote.id, createNote2.id],
      });

      // Update the item and link the relationship field
      const updateUser = await graphqlRequest({
        server,
        query: `
        mutation {
          updateUser(
            id: "${createUser.id}"
            data: {
              notes: { disconnect: [{ id: "${createNote.id}" }, { id: "${FAKE_ID}" }] }
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
              content: noteContent2,
            },
          ],
        },
      });
      expect(updateUser.body).not.toHaveProperty('errors');
    })
  );
});

describe('with access control', () => {
  describe('read: false on related list', () => {
    test(
      'has no impact when disconnecting directly with an id',
      keystoneMongoTest(setupKeystone, async ({ server, create, findById }) => {
        const noteContent = sampleOne(alphanumGenerator);

        // Create an item to link against
        const createNote = await create('NoteNoRead', { content: noteContent });

        // Create an item to update
        const createUser = await create('UserToNotesNoRead', {
          username: 'A thing',
          notes: [createNote.id],
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
                notes: { disconnect: [{ id: "${createNote.id}" }] }
              }
            ) {
              id
            }
          }
      `,
        });

        expect(body).not.toHaveProperty('data.updateUserToNotesNoRead.errors');

        const userData = await findById('UserToNotesNoRead', createUser.id);

        expect(userData.notes).toHaveLength(0);
      })
    );

    test.failing('silently ignores items that otherwise would match the filter', () => {
      // TODO: Fill this in once we support more than just id filtering for
      // disconnection
      expect(false).toBe(true);
    });
  });
});
