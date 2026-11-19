import { describe, expect, test } from 'vitest'
import { text, relationship } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import { mutation, query } from '../../run-field.ts'

type UserWithNotes = { id: string; notes: { id: string; title: string | null }[] }

const runner = setupTestRunner({
  config: {
    lists: {
      Note: list({
        access: allowAll,
        fields: {
          title: text(),
          author: relationship({ ref: 'User.notes' }),
        },
      }),
      User: list({
        access: allowAll,
        fields: {
          username: text(),
          notes: relationship({ ref: 'Note.author', many: true }),
        },
      }),
    },
  },
})

describe('Reconnect', () => {
  test(
    'Reconnect from the many side',
    runner(async ({ context }) => {
      // Create some notes
      const [noteA, noteB, noteC, noteD] = await context.db.Note.createMany({
        data: [{ title: 'A' }, { title: 'B' }, { title: 'C' }, { title: 'D' }],
        select: { id: true },
      })

      // Create some users that does the linking
      const userSelection = 'id notes(orderBy: { title: asc }) { id title }'
      const alice = await mutation(context).createUser<UserWithNotes>({
        data: { username: 'Alice', notes: { connect: [{ id: noteA.id }, { id: noteB.id }] } },
        query: userSelection,
      })

      const bob = await mutation(context).createUser<UserWithNotes>({
        data: { username: 'Bob', notes: { connect: [{ id: noteC.id }, { id: noteD.id }] } },
        query: userSelection,
      })

      // Make sure everyone has the correct notes
      expect(alice).toEqual({ id: expect.any(String), notes: expect.any(Array) })
      expect(alice.notes.map(({ title }) => title)).toEqual(['A', 'B'])
      expect(bob).toEqual({ id: expect.any(String), notes: expect.any(Array) })
      expect(bob.notes.map(({ title }) => title)).toEqual(['C', 'D'])

      // Set Bob as the author of note B
      await (async () => {
        const user = await mutation(context).updateUser<UserWithNotes>({
          where: { id: bob.id },
          data: { notes: { connect: [{ id: noteB.id }] } },
          query: userSelection,
        })

        expect(user).toEqual({ id: bob.id, notes: expect.any(Array) })
        expect(user.notes.map(({ title }) => title)).toEqual(['B', 'C', 'D'])
      })()

      // B should see Bob as its author
      await (async () => {
        const note = await query(context).note({
          where: { id: noteB.id.toString() },
          query: 'id author { id username }',
        })
        expect(note).toEqual({ id: noteB.id, author: { id: bob.id, username: 'Bob' } })
      })()

      // Alice should no longer see `B` in her notes
      await (async () => {
        const user = await query(context).user<UserWithNotes>({
          where: { id: alice.id },
          query: userSelection,
        })
        expect(user).toEqual({ id: alice.id, notes: expect.any(Array) })
        expect(user.notes.map(({ title }) => title)).toEqual(['A'])
      })()
    })
  )
})
