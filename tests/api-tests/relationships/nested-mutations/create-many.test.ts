import { gen, sampleOne } from 'testcheck';
import { text, relationship } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig, expectRelationshipError } from '../../utils';

const alphanumGenerator = gen.alphaNumString.notEmpty();

type IdType = any;

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      Note: list({
        fields: {
          content: text({ isOrderable: true }),
        },
      }),
      User: list({
        fields: {
          username: text(),
          notes: relationship({ ref: 'Note', many: true }),
        },
      }),
      NoteNoRead: list({
        fields: {
          content: text(),
        },
        access: {
          operation: { query: () => false },
        },
      }),
      UserToNotesNoRead: list({
        fields: {
          username: text(),
          notes: relationship({ ref: 'NoteNoRead', many: true }),
        },
      }),
      NoteNoCreate: list({
        fields: {
          content: text({ isFilterable: true }),
        },
        access: {
          operation: { create: () => false },
        },
      }),
      UserToNotesNoCreate: list({
        fields: {
          username: text({ isFilterable: true }),
          notes: relationship({ ref: 'NoteNoCreate', many: true }),
        },
      }),
    },
  }),
});

let afterChangeWasCalled = false;

const runner2 = setupTestRunner({
  config: apiTestConfig({
    lists: {
      Note: list({
        fields: {
          content: text({ isOrderable: true }),
        },
        hooks: {
          afterChange() {
            afterChangeWasCalled = true;
          },
        },
      }),
      User: list({
        fields: {
          username: text(),
          notes: relationship({ ref: 'Note', many: true }),
        },
      }),
    },
  }),
});

test(
  'afterChange is called for nested creates',
  runner2(async ({ context }) => {
    // Update an item that does the nested create
    const item = await context.lists.User.createOne({
      data: { username: 'something', notes: { create: [{ content: 'some content' }] } },
      query: 'username notes {content}',
    });
    expect(item).toEqual({ username: 'something', notes: [{ content: 'some content' }] });
    expect(afterChangeWasCalled).toBe(true);
  })
);
describe('no access control', () => {
  test(
    'create nested from within create mutation',
    runner(async ({ context }) => {
      const noteContent = `a${sampleOne(alphanumGenerator)}`;
      const noteContent2 = `b${sampleOne(alphanumGenerator)}`;
      const noteContent3 = `c${sampleOne(alphanumGenerator)}`;

      // Create an item that does the nested create
      const user = await context.lists.User.createOne({
        data: { username: 'A thing', notes: { create: [{ content: noteContent }] } },
        query: 'id notes(orderBy: { content: asc }) { id content }',
      });

      expect(user).toMatchObject({
        id: expect.any(String),
        notes: [{ id: expect.any(String), content: noteContent }],
      });

      // Create an item that does the nested create
      type T = { id: IdType; notes: { id: IdType; content: string }[] };

      const user1 = (await context.lists.User.createOne({
        data: {
          username: 'A thing',
          notes: { create: [{ content: noteContent2 }, { content: noteContent3 }] },
        },
        query: 'id notes(orderBy: { content: asc }) { id content }',
      })) as T;

      expect(user1).toMatchObject({
        id: expect.any(String),
        notes: [
          { id: expect.any(String), content: noteContent2 },
          { id: expect.any(String), content: noteContent3 },
        ],
      });

      // Sanity check that the items are actually created
      const notes = await context.lists.Note.findMany({
        where: { id: { in: user1.notes.map(({ id }) => id) } },
      });
      expect(notes).toHaveLength(user1.notes.length);

      // Test an empty list of related notes
      const user2 = await context.lists.User.createOne({
        data: { username: 'A thing', notes: { create: [] } },
        query: 'id notes { id }',
      });
      expect(user2).toMatchObject({ id: expect.any(String), notes: [] });
    })
  );

  test(
    'create nested from within update mutation',
    runner(async ({ context }) => {
      const noteContent = `a${sampleOne(alphanumGenerator)}`;
      const noteContent2 = `b${sampleOne(alphanumGenerator)}`;
      const noteContent3 = `c${sampleOne(alphanumGenerator)}`;

      // Create an item to update
      const createUser = await context.lists.User.createOne({ data: { username: 'A thing' } });

      // Update an item that does the nested create
      const user = await context.lists.User.updateOne({
        where: { id: createUser.id },
        data: { username: 'A thing', notes: { create: [{ content: noteContent }] } },
        query: 'id notes { id content }',
      });

      expect(user).toMatchObject({
        id: expect.any(String),
        notes: [{ id: expect.any(String), content: noteContent }],
      });

      type T = { id: IdType; notes: { id: IdType; content: string }[] };
      const _user = (await context.lists.User.updateOne({
        where: { id: createUser.id },
        data: {
          username: 'A thing',
          notes: { create: [{ content: noteContent2 }, { content: noteContent3 }] },
        },
        query: 'id notes(orderBy: { content: asc }) { id content }',
      })) as T;

      expect(_user).toMatchObject({
        id: expect.any(String),
        notes: [
          { id: expect.any(String), content: noteContent },
          { id: expect.any(String), content: noteContent2 },
          { id: expect.any(String), content: noteContent3 },
        ],
      });

      // Sanity check that the items are actually created
      const notes = await context.lists.Note.findMany({
        where: { id: { in: _user.notes.map(({ id }) => id) } },
      });
      expect(notes).toHaveLength(_user.notes.length);
    })
  );
});

describe('with access control', () => {
  describe('read: false on related list', () => {
    test(
      'throws when trying to read after nested create',
      runner(async ({ context }) => {
        const noteContent = sampleOne(alphanumGenerator);

        // Create an item that does the nested create
        const { data, errors } = await context.graphql.raw({
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

        expect(data).toEqual({ createUserToNotesNoRead: { id: expect.any(String), notes: [] } });
        expect(errors).toBe(undefined);
      })
    );

    test(
      'does not throw when create nested from within create mutation',
      runner(async ({ context }) => {
        const noteContent = sampleOne(alphanumGenerator);

        // Create an item that does the nested create
        const { data, errors } = await context.graphql.raw({
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

        expect(data).toEqual({ createUserToNotesNoRead: { id: expect.any(String) } });
        expect(errors).toBe(undefined);
      })
    );

    test(
      'does not throw when create nested from within update mutation',
      runner(async ({ context }) => {
        const noteContent = sampleOne(alphanumGenerator);

        // Create an item to update
        const createUser = await context.lists.UserToNotesNoRead.createOne({
          data: { username: 'A thing' },
        });

        // Update an item that does the nested create
        const { data, errors } = await context.graphql.raw({
          query: `
                mutation {
                  updateUserToNotesNoRead(
                    where: { id: "${createUser.id}" }
                    data: {
                      username: "A thing",
                      notes: { create: [{ content: "${noteContent}" }] }
                    }
                  ) {
                    id
                  }
                }`,
        });
        expect(data).toEqual({ updateUserToNotesNoRead: { id: createUser.id } });
        expect(errors).toBe(undefined);
      })
    );
  });

  describe('create: false on related list', () => {
    test(
      'throws error when creating nested within create mutation',
      runner(async ({ context }) => {
        const userName = sampleOne(alphanumGenerator);
        const noteContent = sampleOne(alphanumGenerator);

        // Create an item that does the nested create
        const { data, errors } = await context.graphql.raw({
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
        expect(data).toEqual({ createUserToNotesNoCreate: null });
        expectRelationshipError(errors, [
          {
            path: ['createUserToNotesNoCreate'],
            message: 'Unable to create and/or connect 1 UserToNotesNoCreate.notes<NoteNoCreate>',
          },
        ]);

        // Confirm it didn't insert either of the records anyway
        const allNoteNoCreates = await context.lists.NoteNoCreate.findMany({
          where: { content: { equals: noteContent } },
        });
        const allUserToNotesNoCreates = await context.lists.UserToNotesNoCreate.findMany({
          where: { username: { equals: userName } },
        });
        expect(allNoteNoCreates).toMatchObject([]);
        expect(allUserToNotesNoCreates).toMatchObject([]);
      })
    );

    test(
      'throws error when creating nested within update mutation',
      runner(async ({ context }) => {
        const noteContent = sampleOne(alphanumGenerator);

        // Create an item to update
        const createUserToNotesNoCreate = await context.lists.UserToNotesNoCreate.createOne({
          data: { username: 'A thing' },
        });

        // Update an item that does the nested create
        const { data, errors } = await context.graphql.raw({
          query: `
                mutation {
                  updateUserToNotesNoCreate(
                    where: { id: "${createUserToNotesNoCreate.id}" }
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
        expect(data).toEqual({ updateUserToNotesNoCreate: null });
        expectRelationshipError(errors, [
          {
            path: ['updateUserToNotesNoCreate'],
            message:
              'Unable to create, connect, disconnect and/or set 1 UserToNotesNoCreate.notes<NoteNoCreate>',
          },
        ]);

        // Confirm it didn't insert the record anyway
        const items = await context.lists.NoteNoCreate.findMany({
          where: { content: { equals: noteContent } },
        });
        expect(items).toMatchObject([]);
      })
    );
  });
});
