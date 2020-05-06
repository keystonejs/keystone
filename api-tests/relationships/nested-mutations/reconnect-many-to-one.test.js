const { Text, Relationship } = require('@keystonejs/fields');
const cuid = require('cuid');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystonejs/test-utils');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('Note', {
        fields: {
          title: { type: Text },
          author: { type: Relationship, ref: 'User.notes' },
        },
      });

      keystone.createList('User', {
        fields: {
          username: { type: Text },
          notes: { type: Relationship, ref: 'Note.author', many: true },
        },
      });
    },
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('Reconnect', () => {
      test(
        'Reconnect from the many side',
        runner(setupKeystone, async ({ keystone, create }) => {
          // Create some notes
          const noteA = await create('Note', { title: 'A' });
          const noteB = await create('Note', { title: 'B' });
          const noteC = await create('Note', { title: 'C' });
          const noteD = await create('Note', { title: 'D' });

          // Create some users that does the linking
          const { data: alice } = await graphqlRequest({
            keystone,
            query: `
              mutation {
                createUser(data: {
                  username: "Alice",
                  notes: { connect: [{ id: "${noteA.id}" }, { id: "${noteB.id}" }] }
                }) {
                  id
                  notes(orderBy: "title_ASC") { id title }
                }
              }
          `,
          });
          const { data: bob } = await graphqlRequest({
            keystone,
            query: `
              mutation {
                createUser(data: {
                  username: "Bob",
                  notes: { connect: [{ id: "${noteC.id}" }, { id: "${noteD.id}" }] }
                }) {
                  id
                  notes(orderBy: "title_ASC") { id title }
                }
              }
          `,
          });

          // Make sure everyone has the correct notes
          expect(alice.createUser).toEqual({ id: expect.any(String), notes: expect.any(Array) });
          expect(alice.createUser.notes.map(({ title }) => title)).toEqual(['A', 'B']);
          expect(bob.createUser).toEqual({ id: expect.any(String), notes: expect.any(Array) });
          expect(bob.createUser.notes.map(({ title }) => title)).toEqual(['C', 'D']);

          // Set Bob as the author of note B
          await (async () => {
            const { data } = await graphqlRequest({
              keystone,
              query: `
              mutation {
                updateUser(id: "${bob.createUser.id}" data: {
                  notes: { connect: [{ id: "${noteB.id}" }] }
                }) {
                  id
                  notes(orderBy: "title_ASC") { id title }
                }
              }
          `,
            });
            expect(data.updateUser).toEqual({ id: bob.createUser.id, notes: expect.any(Array) });
            expect(data.updateUser.notes.map(({ title }) => title)).toEqual(['B', 'C', 'D']);
          })();

          // B should see Bob as its author
          await (async () => {
            const { data } = await graphqlRequest({
              keystone,
              query: `
            {
              Note(where: { id: "${noteB.id}"}) {
                id
                author { id username }
              }
            }
            `,
            });

            expect(data.Note).toEqual({
              id: noteB.id,
              author: { id: bob.createUser.id, username: 'Bob' },
            });
          })();

          // Alice should no longer see `B` in her notes
          await (async () => {
            const { data } = await graphqlRequest({
              keystone,
              query: `
            {
              User(where: { id: "${alice.createUser.id}"}) {
                id
                notes(orderBy: "title_ASC") { id title }
              }
            }
            `,
            });
            expect(data.User).toEqual({ id: alice.createUser.id, notes: expect.any(Array) });
            expect(data.User.notes.map(({ title }) => title)).toEqual(['A']);
          })();
        })
      );
    });
  })
);
