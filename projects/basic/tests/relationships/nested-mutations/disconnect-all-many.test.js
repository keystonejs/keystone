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
    'removes all items from list',
    keystoneMongoTest(setupKeystone, async ({ server: { server }, create }) => {
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
              notes: { disconnectAll: true }
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
          notes: [],
        },
      });
      expect(updateUser.body).not.toHaveProperty('errors');
    })
  );

  test(
    'silently succeeds if used during create',
    keystoneMongoTest(setupKeystone, async ({ server: { server } }) => {
      // Create an item that does the linking
      const {
        body: { data },
      } = await graphqlRequest({
        server,
        query: `
        mutation {
          createUser(data: {
            notes: {
              disconnectAll: true
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

      expect(data.createUser).not.toHaveProperty('errors');
      expect(data.createUser).toMatchObject({
        id: expect.any(String),
        notes: [],
      });
    })
  );
});

describe('with access control', () => {
  describe('read: false on related list', () => {
    test(
      'has no effect when specifying disconnectAll',
      keystoneMongoTest(setupKeystone, async ({ server: { server }, create, findById }) => {
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
                notes: { disconnectAll: true }
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

    test.failing('silently keeps items that otherwise would be removed', () => {
      // TODO: Fill this in when we support more filtering on Unique items than
      // just ID.
      expect(false).toBe(true);
    });
  });
});
