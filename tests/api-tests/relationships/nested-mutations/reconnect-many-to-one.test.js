const { text, relationship } = require('@keystone-next/fields');
const { createSchema, list } = require('@keystone-next/keystone/schema');
const { multiAdapterRunners, setupFromConfig } = require('@keystone-next/test-utils-legacy');
const { createItems } = require('@keystone-next/server-side-graphql-client-legacy');

function setupKeystone(adapterName) {
  return setupFromConfig({
    adapterName,
    config: createSchema({
      lists: {
        Note: list({
          fields: {
            title: text(),
            author: relationship({ ref: 'User.notes' }),
          },
        }),
        User: list({
          fields: {
            username: text(),
            notes: relationship({ ref: 'Note.author', many: true }),
          },
        }),
      },
    }),
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('Reconnect', () => {
      test(
        'Reconnect from the many side',
        runner(setupKeystone, async ({ context }) => {
          // Create some notes
          const [noteA, noteB, noteC, noteD] = await createItems({
            context,
            listKey: 'Note',
            items: [
              { data: { title: 'A' } },
              { data: { title: 'B' } },
              { data: { title: 'C' } },
              { data: { title: 'D' } },
            ],
          });

          // Create some users that does the linking
          const { data: alice, errors } = await context.executeGraphQL({
            query: `
              mutation {
                createUser(data: {
                  username: "Alice",
                  notes: { connect: [{ id: "${noteA.id}" }, { id: "${noteB.id}" }] }
                }) {
                  id
                  notes(sortBy: title_ASC) { id title }
                }
              }`,
          });
          expect(errors).toBe(undefined);
          const { data: bob, errors: errors2 } = await context.executeGraphQL({
            query: `
              mutation {
                createUser(data: {
                  username: "Bob",
                  notes: { connect: [{ id: "${noteC.id}" }, { id: "${noteD.id}" }] }
                }) {
                  id
                  notes(sortBy: title_ASC) { id title }
                }
              }`,
          });
          expect(errors2).toBe(undefined);
          // Make sure everyone has the correct notes
          expect(alice.createUser).toEqual({ id: expect.any(String), notes: expect.any(Array) });
          expect(alice.createUser.notes.map(({ title }) => title)).toEqual(['A', 'B']);
          expect(bob.createUser).toEqual({ id: expect.any(String), notes: expect.any(Array) });
          expect(bob.createUser.notes.map(({ title }) => title)).toEqual(['C', 'D']);

          // Set Bob as the author of note B
          await (async () => {
            const { data, errors } = await context.executeGraphQL({
              query: `
                mutation {
                  updateUser(id: "${bob.createUser.id}" data: {
                    notes: { connect: [{ id: "${noteB.id}" }] }
                  }) {
                    id
                    notes(sortBy: title_ASC) { id title }
                  }
                }`,
            });
            expect(errors).toBe(undefined);
            expect(data.updateUser).toEqual({ id: bob.createUser.id, notes: expect.any(Array) });
            expect(data.updateUser.notes.map(({ title }) => title)).toEqual(['B', 'C', 'D']);
          })();

          // B should see Bob as its author
          await (async () => {
            const { data, errors } = await context.executeGraphQL({
              query: `
                query {
                  Note(where: { id: "${noteB.id}"}) {
                    id
                    author { id username }
                  }
                }`,
            });
            expect(errors).toBe(undefined);
            expect(data.Note).toEqual({
              id: noteB.id,
              author: { id: bob.createUser.id, username: 'Bob' },
            });
          })();

          // Alice should no longer see `B` in her notes
          await (async () => {
            const { data, errors } = await context.executeGraphQL({
              query: `
                query {
                  User(where: { id: "${alice.createUser.id}"}) {
                    id
                    notes(sortBy: title_ASC) { id title }
                  }
                }`,
            });
            expect(errors).toBe(undefined);
            expect(data.User).toEqual({ id: alice.createUser.id, notes: expect.any(Array) });
            expect(data.User.notes.map(({ title }) => title)).toEqual(['A']);
          })();
        })
      );
    });
  })
);
