import { list } from '@keystone-6/core'
import { checkbox, password, relationship, text, timestamp } from '@keystone-6/core/fields'
import { select } from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'
import type { Lists } from '.keystone/types'

// needs to be compatible with withAuth
export type Session = {
  listKey: string
  itemId: string
  data: {}
}

function isAssignedUserFilter ({ session }: { session?: Session }) {
  // you need to have a session
  if (!session) return false

  // the authenticated user can edit posts they are assigned to
  return {
    assignedTo: {
      id: {
        equals: session.itemId,
      },
    },
  }
}

export const lists = {
  Task: list({
    access: {
      operation: allowAll,
      filter: {
        update: isAssignedUserFilter,
      },
    },
    fields: {
      label: text({ validation: { isRequired: true } }),
      priority: select({
        type: 'enum',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
        ],
      }),
      isComplete: checkbox(),
      assignedTo: relationship({ ref: 'User.tasks', many: false }),
      finishBy: timestamp(),
    },
  }),
  User: list({
    access: allowAll,
    fields: {
      name: text({ isIndexed: 'unique', validation: { isRequired: true } }),
      password: password({ validation: { isRequired: true } }),
      tasks: relationship({ ref: 'Task.assignedTo', many: true }),
    },
  }),
} satisfies Lists<Session>
