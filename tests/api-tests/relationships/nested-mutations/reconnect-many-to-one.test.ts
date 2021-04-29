import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import {
  ProviderName,
  multiAdapterRunners,
  setupFromConfig,
  testConfig,
} from '@keystone-next/test-utils-legacy';

type IdType = any;

function setupKeystone(provider: ProviderName) {
  return setupFromConfig({
    provider,
    config: testConfig({
      lists: createSchema({
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
      }),
    }),
  });
}

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe('Reconnect', () => {
      test(
        'Reconnect from the many side',
        runner(setupKeystone, async ({ context }) => {
          // Create some notes
          const [noteA, noteB, noteC, noteD] = await context.lists.Note.createMany({
            data: [
              { data: { title: 'A' } },
              { data: { title: 'B' } },
              { data: { title: 'C' } },
              { data: { title: 'D' } },
            ],
          });

          // Create some users that does the linking
          type T = { id: IdType; notes: { id: IdType; title: string }[] };
          const alice = (await context.lists.User.createOne({
            data: { username: 'Alice', notes: { connect: [{ id: noteA.id }, { id: noteB.id }] } },
            query: 'id notes(sortBy: [title_ASC]) { id title }',
          })) as T;

          const bob = (await context.lists.User.createOne({
            data: { username: 'Bob', notes: { connect: [{ id: noteC.id }, { id: noteD.id }] } },
            query: 'id notes(sortBy: [title_ASC]) { id title }',
          })) as T;

          // Make sure everyone has the correct notes
          expect(alice).toEqual({ id: expect.any(String), notes: expect.any(Array) });
          expect(alice.notes.map(({ title }) => title)).toEqual(['A', 'B']);
          expect(bob).toEqual({ id: expect.any(String), notes: expect.any(Array) });
          expect(bob.notes.map(({ title }) => title)).toEqual(['C', 'D']);

          // Set Bob as the author of note B
          await (async () => {
            type T = { updateUser: { id: IdType; notes: { id: IdType; title: string }[] } };
            const data = (await context.graphql.run({
              query: `
                mutation {
                  updateUser(id: "${bob.id}" data: {
                    notes: { connect: [{ id: "${noteB.id}" }] }
                  }) {
                    id
                    notes(sortBy: title_ASC) { id title }
                  }
                }`,
            })) as T;
            expect(data.updateUser).toEqual({ id: bob.id, notes: expect.any(Array) });
            expect(data.updateUser.notes.map(({ title }) => title)).toEqual(['B', 'C', 'D']);
          })();

          // B should see Bob as its author
          await (async () => {
            const data = await context.graphql.run({
              query: `
                query {
                  Note(where: { id: "${noteB.id}"}) {
                    id
                    author { id username }
                  }
                }`,
            });
            expect(data.Note).toEqual({ id: noteB.id, author: { id: bob.id, username: 'Bob' } });
          })();

          // Alice should no longer see `B` in her notes
          await (async () => {
            type T = { User: { id: IdType; notes: { id: IdType; title: string }[] } };
            const data = (await context.graphql.run({
              query: `
                query {
                  User(where: { id: "${alice.id}"}) {
                    id
                    notes(sortBy: title_ASC) { id title }
                  }
                }`,
            })) as T;
            expect(data.User).toEqual({ id: alice.id, notes: expect.any(Array) });
            expect(data.User.notes.map(({ title }) => title)).toEqual(['A']);
          })();
        })
      );
    });
  })
);
