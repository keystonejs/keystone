import { text, relationship } from '@keystone-6/core/fields';
import { list } from '@keystone-6/core';
import { setupTestRunner } from '@keystone-6/core/testing';
import { apiTestConfig } from '../../utils';

type IdType = any;

const runner = setupTestRunner({
  config: apiTestConfig({
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

describe('Reconnect', () => {
  test(
    'Reconnect from the many side',
    runner(async ({ context }) => {
      // Create some notes
      const [noteA, noteB, noteC, noteD] = await context.query.Note.createMany({
        data: [{ title: 'A' }, { title: 'B' }, { title: 'C' }, { title: 'D' }],
      });

      // Create some users that does the linking
      type T = { id: IdType; notes: { id: IdType; title: string }[] };
      const alice = (await context.query.User.createOne({
        data: { username: 'Alice', notes: { connect: [{ id: noteA.id }, { id: noteB.id }] } },
        query: 'id notes(orderBy: { title: asc }) { id title }',
      })) as T;

      const bob = (await context.query.User.createOne({
        data: { username: 'Bob', notes: { connect: [{ id: noteC.id }, { id: noteD.id }] } },
        query: 'id notes(orderBy: { title: asc }) { id title }',
      })) as T;

      // Make sure everyone has the correct notes
      expect(alice).toEqual({ id: expect.any(String), notes: expect.any(Array) });
      expect(alice.notes.map(({ title }) => title)).toEqual(['A', 'B']);
      expect(bob).toEqual({ id: expect.any(String), notes: expect.any(Array) });
      expect(bob.notes.map(({ title }) => title)).toEqual(['C', 'D']);

      // Set Bob as the author of note B
      await (async () => {
        type T = { id: IdType; notes: { id: IdType; title: string }[] };
        const user = (await context.query.User.updateOne({
          where: { id: bob.id },
          data: { notes: { connect: [{ id: noteB.id }] } },
          query: 'id notes(orderBy: { title: asc }) { id title }',
        })) as T;

        expect(user).toEqual({ id: bob.id, notes: expect.any(Array) });
        expect(user.notes.map(({ title }) => title)).toEqual(['B', 'C', 'D']);
      })();

      // B should see Bob as its author
      await (async () => {
        const note = await context.query.Note.findOne({
          where: { id: noteB.id },
          query: 'id author { id username }',
        });
        expect(note).toEqual({ id: noteB.id, author: { id: bob.id, username: 'Bob' } });
      })();

      // Alice should no longer see `B` in her notes
      await (async () => {
        type T = { id: IdType; notes: { id: IdType; title: string }[] };
        const user = (await context.query.User.findOne({
          where: { id: alice.id },
          query: 'id notes(orderBy: { title: asc }) { id title }',
        })) as T;
        expect(user).toEqual({ id: alice.id, notes: expect.any(Array) });
        expect(user.notes.map(({ title }) => title)).toEqual(['A']);
      })();
    })
  );
});
